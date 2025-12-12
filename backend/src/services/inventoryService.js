import {
    createItem,
    findItemId,
    findItemById,
    updateItem,
    deleteItem,
    findItemsByWarehouse,
    findDuplicateSKU,
    findAllItems,
    countItemsByWarehouse,
}   from "../repositories/inventoryRepository.js";

import { 
    findWarehouseById,
    incrementCapacity
 } from "../repositories/warehouseRepository.js";

/*
    CREATE ITEM (Merged & Fixed)
*/

const formatSequenceNumber = (num) => String(num).padStart(4, '0');

export const bulkTransferInventoryService = async ({ 
    sourceWarehouseId, 
    destinationWarehouseId, 
    items 
}) => {
    const totalUnitsToTransfer = items.reduce((sum, item) => sum + item.quantity, 0);

    // 1. Capacity Check for Destination Warehouse
    const destWarehouse = await findWarehouseById(destinationWarehouseId);
    if (!destWarehouse) {
        throw new Error("Destination warehouse not found.");
    }
    
    // Check if total transfer quantity exceeds remaining capacity
    const remainingCapacity = destWarehouse.maxCapacity - destWarehouse.currentCapacity;
    if (totalUnitsToTransfer > remainingCapacity) {
        throw new Error(`Transfer failed: Destination warehouse capacity of ${remainingCapacity} units is exceeded by the ${totalUnitsToTransfer} units being moved.`);
    }

    // 2. Process Transfers Item by Item
    const results = [];
    const destWarehousePrefix = destWarehouse.name[0].toUpperCase();

    for (const transferItem of items) {
        const { itemId, quantity: transferQuantity } = transferItem;

        if (transferQuantity <= 0) continue; 

        const sourceItem = await findItemById(itemId);
        if (!sourceItem || sourceItem.warehouse._id.toString() !== sourceWarehouseId) {
            throw new Error(`Item ${itemId} not found or mismatch in source warehouse.`);
        }

        // --- SKU GENERATION AND CHECK ---
        let newSku = sourceItem.sku;
        let isNewItemNeeded = false;
        
        if (transferQuantity < sourceItem.quantity) {
             // If partial transfer, a new item must be created in the destination, 
             // and it MUST get a new SKU.
             isNewItemNeeded = true;
        } else {
            // Full transfer: Check if the current SKU exists in the destination warehouse.
            const existingDestItems = await findItemsByWarehouse(destinationWarehouseId);
            const skuExistsInDest = existingDestItems.some(item => item.sku === sourceItem.sku);

            if (skuExistsInDest) {
                // If the SKU exists in the destination, we must create a new item with a new SKU.
                isNewItemNeeded = true;
            } else {
                // Full transfer and SKU is unique in destination, we just update the warehouse ID of the sourceItem.
                isNewItemNeeded = false;
            }
        }
        
        if (isNewItemNeeded) {
            // Generate New SKU: Base it on the destination warehouse count + 1
            const currentItemCount = await countItemsByWarehouse(destinationWarehouseId);
            const nextSequence = currentItemCount + 1;
            newSku = `${destWarehousePrefix}-${formatSequenceNumber(nextSequence)}`;
        }
        
        // --- DATABASE OPERATIONS ---
        
        // A. Handle Source Warehouse Update
        if (transferQuantity < sourceItem.quantity) {
            // Partial Transfer: Decrease quantity in source item
            const remainingQuantity = sourceItem.quantity - transferQuantity;
            await updateItem(sourceItem._id, { quantity: remainingQuantity });
        } else {
            // Full Transfer: Remove capacity from source warehouse
            // (Capacity update is handled in the final step for simplicity, but we mark the source item for 'deletion' in terms of warehouse link)
            // If full transfer AND no new SKU needed, we update the warehouse ID of the existing item
            if (!isNewItemNeeded) {
                await updateItem(sourceItem._id, { 
                    warehouse: destinationWarehouseId, 
                    sku: newSku // Should be the old SKU if no new needed
                });
            } else {
                 // Full transfer but needs new SKU, we essentially "delete" the old item 
                 // and create a new one (or just let it stay, and we create the new one, 
                 // then the capacity update handles the source reduction.)
                 // To simplify: we reduce the quantity to zero, and the final capacity update will account for it.
                 await updateItem(sourceItem._id, { quantity: 0 });
            }
        }

        // B. Handle Destination Warehouse Item (Creation or Update)
        if (isNewItemNeeded) {
            // Create New Item in destination with new SKU and transfer quantity
            const newItemData = {
                name: sourceItem.name,
                description: sourceItem.description,
                category: sourceItem.category,
                sku: newSku,
                quantity: transferQuantity,
                storageLocation: sourceItem.storageLocation, // Keep location if applicable
                warehouse: destinationWarehouseId
            };
            await createItem(newItemData);
        } else {
            // Full transfer where SKU is unique in destination: 
            // We already updated the warehouse ID in the 'Source Update' step for this item.
        }

        results.push({
            itemId: sourceItem._id,
            itemName: sourceItem.name,
            transferQuantity: transferQuantity,
            finalSku: newSku,
            status: 'Transferred'
        });
    }

    

    // 3. Final Capacity Update
    // Reduce capacity in source warehouse
    await incrementCapacity(sourceWarehouseId, -totalUnitsToTransfer);
    // Increase capacity in destination warehouse
    await incrementCapacity(destinationWarehouseId, totalUnitsToTransfer);

    return {
        destinationWarehouseName: destWarehouse.name,
        // Map the results array to the expected format for the toast
        itemsTransferred: results.map(item => ({ 
            id: item.itemId, 
            quantity: item.transferQuantity, 
            name: item.itemName // Use the name we added to the results array
        }))
    };

    
};

export const createInventoryItemService = async (itemData) => {
    // 1. Destructure input
    const { warehouse: warehouseId, quantity, ...otherItemData } = itemData;

    // 2. Initial Validation: Check if Warehouse exists & get details for capacity check AND SKU generation
    const warehouseDoc = await findWarehouseById(warehouseId);
    if (!warehouseDoc) throw new Error("Warehouse not found");

    if (warehouseDoc.currentCapacity + quantity > warehouseDoc.maxCapacity) {
        throw new Error("Warehouse does not have enough space.");
    }
    
    // --- SKU GENERATION STARTS HERE ---
    
    // 3. Get the item count for the sequence number (e.g., 4)
    const currentItemCount = await countItemsByWarehouse(warehouseId);
    
    // 4. Calculate the next sequence number (4 + 1 = 5)
    const nextSequence = currentItemCount + 1;
    
    // 5. Get the warehouse code prefix (e.g., 'T' from "Test Warehouse")
    const warehousePrefix = warehouseDoc.name[0].toUpperCase();
    
    // 6. Generate the unique SKU: T-0005
    const formattedSequence = formatSequenceNumber(nextSequence);
    const newSKU = `${warehousePrefix}-${formattedSequence}`; 
    
    // --- SKU GENERATION ENDS HERE ---

    // 7. Construct Payload
    const finalItemPayload = {
        ...otherItemData,
        quantity,
        sku: newSKU, // 🚨 Assign the auto-generated SKU
        warehouse: warehouseId
    };

    // 8. Create Item in DB
    const newItem = await createItem(finalItemPayload);

    // 9. Update Warehouse Capacity (Uses your existing logic)
    await incrementCapacity(warehouseId, quantity);

    return newItem;
};

/*
    READ ALL
*/
export const getAllInventoryItemsService  = async () => {
    return await findAllItems();
};

/*
    READ ONE
*/
export const getInventoryItemService = async (id) => {
    const item = await findItemId(id);
    if (!item) throw new Error("Item not found");
    return item;
};

/*
    UPDATE ITEM 
*/
export const updateInventoryItemService = async (id, data) => {
    const item = await findItemId(id);
    if (!item) throw new Error("Item not found");

    const oldWarehouse = await findWarehouseById(item.warehouse);
    const newWarehouse = 
        data.warehouse ? await findWarehouseById(data.warehouse) : oldWarehouse;

    if (!newWarehouse) throw new Error("New warehouse not found");

    // Validating unique SKU INSIDE the target warehouse
    const targetWarehouseId = data.warehouse || item.warehouse; 

    // Only check duplicate SKU if the user is explicitly trying to change it manually
    // (If your system disallows manual SKU edits, you can remove this block)
    if(data.sku) {
        const existing = await findDuplicateSKU(data.sku, targetWarehouseId ,id);
        if (existing) {
            throw new Error(`SKU "${data.sku}" already exists in this warehouse.`);
        }
    }

    /* CAPACITY CALCULATION */
   const oldQty = item.quantity;
   const newQty = data.quantity ?? item.quantity;
   const qtyDifference = newQty - oldQty;

    // If changing warehouses
    if (data.warehouse && data.warehouse !== item.warehouse) {
        // Removing from old warehouse
        await incrementCapacity(item.warehouse, -oldQty);

        // Add to new warehouse (check capacity)
        if (newWarehouse.currentCapacity + newQty > newWarehouse.maxCapacity){
            throw new Error("New warehouse does not have enough space.");
        }
        await incrementCapacity(data.warehouse, newQty);

    } else {
        // Same warehouse -> only move difference
        if (oldWarehouse.currentCapacity + qtyDifference > oldWarehouse.maxCapacity) {
            throw new Error ("Warehouse does not have enough space.");
        }
        await incrementCapacity(item.warehouse, qtyDifference);
    }

    // Final Save for the item
    Object.assign(item, data);
    await item.save();
    
    return item;
};

/*
    DELETE ITEM 
*/
export const deleteInventoryItemService = async (id) => {
    const item = await findItemId(id);
    if (!item) throw new Error("Item not found");
    
    // Release capacity
    // Ensure we don't go below zero (handled by repo logic or check here)
    await incrementCapacity(item.warehouse, -item.quantity);

    // Delete item
    await deleteItem(id);

    return item;
};

/*
    GET ITEMS BY WAREHOUSE
*/
export const getItemsByWarehouseService = async (warehouseId) => {
    return await findItemsByWarehouse(warehouseId);
};