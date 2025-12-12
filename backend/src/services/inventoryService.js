/**
 * inventoryService.js
 * * Business Logic Layer for Inventory Operations.
 * * This file handles the core rules of the application:
 * 1. Capacity Management (checking limits before adds/transfers).
 * 2. SKU Generation (auto-incrementing sequences).
 * 3. Warehouse Transfers (moving items and updating counts).
 * 4. Data Validation (preventing duplicates).
 */


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


/**
 * Orchestrates the bulk transfer of inventory items between two warehouses.
 * * Performs strict capacity validation on the destination before processing.
 * * Handles SKU conflicts: 
 * - If the SKU exists in the destination, a new Item with a new SKU is created.
 * - If the SKU is unique, the existing Item is moved (warehouse ID updated).
 * * Updates capacity for both source (decrease) and destination (increase).
 * */

export const bulkTransferInventoryService = async ({ 
    sourceWarehouseId, 
    destinationWarehouseId, 
    items 
}) => {
    const totalUnitsToTransfer = items.reduce((sum, item) => sum + item.quantity, 0);

    //  Capacity Check for Destination Warehouse
    const destWarehouse = await findWarehouseById(destinationWarehouseId);
    if (!destWarehouse) {
        throw new Error("Destination warehouse not found.");
    }
    
    // Check if total transfer quantity exceeds remaining capacity
    const remainingCapacity = destWarehouse.maxCapacity - destWarehouse.currentCapacity;
    if (totalUnitsToTransfer > remainingCapacity) {
        throw new Error(`Transfer failed: Destination warehouse capacity of ${remainingCapacity} units is exceeded by the ${totalUnitsToTransfer} units being moved.`);
    }

    //  Process Transfers Item by Item
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
             isNewItemNeeded = true;
        } else {
            
            const existingDestItems = await findItemsByWarehouse(destinationWarehouseId);
            const skuExistsInDest = existingDestItems.some(item => item.sku === sourceItem.sku);

            if (skuExistsInDest) {
                
                isNewItemNeeded = true;
            } else {
                
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
            const remainingQuantity = sourceItem.quantity - transferQuantity;
            await updateItem(sourceItem._id, { quantity: remainingQuantity });
        } else {
            if (!isNewItemNeeded) {
                await updateItem(sourceItem._id, { 
                    warehouse: destinationWarehouseId, 
                    sku: newSku 
                });
            } else {
                 await updateItem(sourceItem._id, { quantity: 0 });
            }
        }

        // Handle Destination Warehouse Item 
        if (isNewItemNeeded) {
            // Create New Item in destination with new SKU and transfer quantity
            const newItemData = {
                name: sourceItem.name,
                description: sourceItem.description,
                category: sourceItem.category,
                sku: newSku,
                quantity: transferQuantity,
                storageLocation: sourceItem.storageLocation,
                warehouse: destinationWarehouseId
            };
            await createItem(newItemData);
        }

        results.push({
            itemId: sourceItem._id,
            itemName: sourceItem.name,
            transferQuantity: transferQuantity,
            finalSku: newSku,
            status: 'Transferred'
        });
    }

    

    // Final Capacity Update
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
            name: item.itemName 
        }))
    };

    
};

export const createInventoryItemService = async (itemData) => {
    // Destructure input
    const { warehouse: warehouseId, quantity, ...otherItemData } = itemData;

    // Initial Validation: Check if Warehouse exists & get details for capacity check AND SKU generation
    const warehouseDoc = await findWarehouseById(warehouseId);
    if (!warehouseDoc) throw new Error("Warehouse not found");

    if (warehouseDoc.currentCapacity + quantity > warehouseDoc.maxCapacity) {
        throw new Error("Warehouse does not have enough space.");
    }
    
    // --- SKU GENERATION STARTS HERE ---
    
    // Get the item count for the sequence number
    const currentItemCount = await countItemsByWarehouse(warehouseId);
    
    // Calculate the next sequence number 
    const nextSequence = currentItemCount + 1;
    
    // Get the warehouse code prefix (e.g., 'T' from "Test Warehouse")
    const warehousePrefix = warehouseDoc.name[0].toUpperCase();
    
    // Generate the unique SKU: T-0005
    const formattedSequence = formatSequenceNumber(nextSequence);
    const newSKU = `${warehousePrefix}-${formattedSequence}`; 
    
    // --- SKU GENERATION ENDS HERE ---

    // Construct Payload
    const finalItemPayload = {
        ...otherItemData,
        quantity,
        sku: newSKU, 
        warehouse: warehouseId
    };

    // Create Item in DB
    const newItem = await createItem(finalItemPayload);

    // Update Warehouse Capacity 
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

/**
 * Updates an inventory item.
 * * Handles complex capacity calculations if the quantity changes.
 * * Handles logic for moving an item to a different warehouse (decrement old, increment new).
 * * Ensures strict capacity limits are not exceeded in the target warehouse.
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

        // Add to new warehouse
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
    Deletes an inventory item and releases the associated warehouse capacity.
*/
export const deleteInventoryItemService = async (id) => {
    const item = await findItemId(id);
    if (!item) throw new Error(`Item not found ${item}`);
    
    // Release capacity
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