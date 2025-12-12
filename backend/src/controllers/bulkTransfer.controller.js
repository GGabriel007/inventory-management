// --- /controllers/bulkTransfer.controller.js ---

// FIX 1: Use ES Module import for axios
// We don't actually use axios anymore, but keep it if you need it elsewhere.
// Otherwise, you can remove this line:
// import axios from 'axios'; 

// Import Models
import InventoryItem from '../models/InventoryItem.js'; 
import Warehouse from '../models/Warehouse.js';

// The internalApiUrl is no longer needed since we use direct database calls.
// const internalApiUrl = 'http://localhost:5000/api/inventory'; 

export const bulkTransfer = async (req, res) => {
    // 🛑 ERROR FIXED: Move the destructuring of request body to the top of the try block.
    // This allows you to define sourceWarehouseId, destinationWarehouseId, and items array.
    const { sourceWarehouseId, destinationWarehouseId, items } = req.body;
    
    // NOTE: Always wrap database and network calls in a try...catch block
    try {
        // 🛑 ERROR FIXED: Removed misplaced/redundant variable definitions outside the loop.
        // const { itemId, quantity: quantityToTransfer } = itemTransfer; // Removed
        // const sourceInventoryRecord = await InventoryItem.findOne(...); // Removed

        // Use a transaction here for reliable inventory control if possible (recommended)

        for (const itemTransfer of items) {
            // ✅ Correctly destructure item variables INSIDE the loop
            const { itemId, quantity: quantityToTransfer } = itemTransfer;

            // 1. Fetch the current source inventory item data
            const sourceInventoryRecord = await InventoryItem.findOne({ 
                _id: itemId, 
                warehouse: sourceWarehouseId 
            });

            // Basic validation
            if (!sourceInventoryRecord) {
                console.warn(`Item ${itemId} not found in source warehouse ${sourceWarehouseId}. Skipping.`);
                continue; 
            }

            // ✅ Correct order: calculate quantities using the fetched record
            const currentSourceQuantity = sourceInventoryRecord.quantity;
            const newSourceQuantity = currentSourceQuantity - quantityToTransfer;
            
            // Validation to prevent negative stock (optional, but good)
            if (newSourceQuantity < 0) {
                 // Throwing an error will stop the whole transaction (good for bulk transfers)
                 throw new Error(`Insufficient stock for item ${itemId}. Available: ${currentSourceQuantity}`);
            }

            // --- CRITICAL LOGIC: Source Inventory Update/Delete ---
            if (newSourceQuantity === 0) {
                
                // 1A. Perform direct database deletion of the InventoryItem
                try {
                    await InventoryItem.findByIdAndDelete(itemId);
                } catch (error) { 
                    console.error(`Database deletion failed for source item ${itemId}:`, error.message);
                    // Decide if this failure should halt the transfer
                }
                
            } else { // newSourceQuantity > 0
                
                // 1B. Update the InventoryItem quantity
                await InventoryItem.updateOne(
                    { _id: itemId },
                    { $set: { quantity: newSourceQuantity } }
                );
            }

            // 🚨 FIX A: DECREMENT SOURCE WAREHOUSE CAPACITY (Only occurs once per item)
            await Warehouse.updateOne(
                { _id: sourceWarehouseId },
                { $inc: { currentCapacity: -quantityToTransfer } } 
            );

            // --- PART 2: Handle Destination Inventory Update/Creation ---
            const skuToTransfer = sourceInventoryRecord.sku;

            await InventoryItem.findOneAndUpdate(
                { 
                    sku: skuToTransfer, 
                    warehouse: destinationWarehouseId 
                }, 
                { 
                    $inc: { quantity: quantityToTransfer },
                    $set: {
                        sku: skuToTransfer, 
                        name: sourceInventoryRecord.name,
                        description: sourceInventoryRecord.description,
                        storageLocation: sourceInventoryRecord.storageLocation 
                    }
                },
                { 
                    upsert: true, 
                    new: true, 
                } 
            );
            
            // 🚨 FIX B: INCREMENT DESTINATION WAREHOUSE CAPACITY (Only occurs once per item)
            await Warehouse.updateOne(
                { _id: destinationWarehouseId },
                { $inc: { currentCapacity: quantityToTransfer } } 
            );
            
            // 🛑 ERROR FIXED: Removed duplicate and redundant Warehouse update logic below
            // await Warehouse.findByIdAndUpdate(...) removed
        }

        // Send success response after the loop completes
        res.status(200).send({ message: "Bulk transfer successful." });
        
    } catch (error) {
        // Handle validation or database errors
        res.status(400).send({ message: error.message || "Bulk transfer failed." });
    }
};