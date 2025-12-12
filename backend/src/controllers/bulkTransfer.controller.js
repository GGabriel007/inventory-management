// --- /controllers/bulkTransfer.controller.js ---

/**
 * bulkTransfer.controller.js
 * * Handles the bulk transfer of inventory items between warehouses.
 * * Note: This controller currently contains direct business logic. 
 * In a strict Layered Architecture, this logic should eventually move to a Service.
 */

import InventoryItem from '../models/InventoryItem.js'; 
import Warehouse from '../models/Warehouse.js';

/**
 * Executes a bulk transfer of items from a source warehouse to a destination warehouse.
 * * Validates inventory availability before transfer.
 * * Updates or creates inventory records in the destination.
 * * Adjusts capacity for both source and destination warehouses.
 */

export const bulkTransfer = async (req, res) => {

    const { sourceWarehouseId, destinationWarehouseId, items } = req.body;
    
    try {

        for (const itemTransfer of items) {
            const { itemId, quantity: quantityToTransfer } = itemTransfer;

            // Fetch the current source inventory item data
            const sourceInventoryRecord = await InventoryItem.findOne({ 
                _id: itemId, 
                warehouse: sourceWarehouseId 
            });

            // Basic validation
            if (!sourceInventoryRecord) {
                console.warn(`Item ${itemId} not found in source warehouse ${sourceWarehouseId}. Skipping.`);
                continue; 
            }

            const currentSourceQuantity = sourceInventoryRecord.quantity;
            const newSourceQuantity = currentSourceQuantity - quantityToTransfer;
            
            // Validation to prevent negative stock 
            if (newSourceQuantity < 0) {
                 throw new Error(`Insufficient stock for item ${itemId}. Available: ${currentSourceQuantity}`);
            }

            // Source Inventory Update/Delete ---
            if (newSourceQuantity === 0) {
                
                try {
                    await InventoryItem.findByIdAndDelete(itemId);
                } catch (error) { 
                    console.error(`Database deletion failed for source item ${itemId}:`, error.message);
                }
                
            } else { 
                await InventoryItem.updateOne(
                    { _id: itemId },
                    { $set: { quantity: newSourceQuantity } }
                );
            }

            await Warehouse.updateOne(
                { _id: sourceWarehouseId },
                { $inc: { currentCapacity: -quantityToTransfer } } 
            );

            // Handle Destination Inventory Update/Creation ---
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
            
            await Warehouse.updateOne(
                { _id: destinationWarehouseId },
                { $inc: { currentCapacity: quantityToTransfer } } 
            );
            
        }

        res.status(200).send({ message: "Bulk transfer successful." });
        
    } catch (error) {
        res.status(400).send({ message: error.message || "Bulk transfer failed." });
    }
};