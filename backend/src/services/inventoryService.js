import {
    createItem,
    findItemId,
    updateItem,
    deleteItem,
    findItemsByWarehouse,
    findDuplicateSKU,
    findAllItems
}   from "../repositories/inventoryRepository.js";

import { findWarehouseById } from "../repositories/warehouseRepository.js";

/*
    CREATE ITEM
*/

export const createInventoryItemService = async (data) => {
    const { sku, warehouse, quantity } = data;


    // Check warehouse exists
    const warehouseDoc = await findWarehouseById(warehouse);
    if (!warehouseDoc) throw new Error("Warehouse not found");

    // Check SKU duplication
    const duplicate = await findDuplicateSKU(sku, warehouse);
    if (duplicate)
        throw new Error("Duplicate SKU in the same warehouse is not allowed.");

    // Capacity check
    if (warehouseDoc.currentCapacity + quantity > warehouseDoc.maxCapacity) {
        throw new Error("Warehouse does not have enough space.");
    }

    // Create Item
    const item = await createItem(data);

    // Increase warehouse capacity
    warehouseDoc.currentCapacity += quantity;
    await warehouseDoc.save();

    return item;
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

    if(data.sku) {
        const existing = await findDuplicateSKU(data.sku, targetWarehouseId ,id);
        if (existing) {
            throw new Error(`SKU "${data.sku}" already exists in this warehouse.`);
        }
    }

    /*
        CAPACITY CALCULATION
    */
   const oldQty = item.quantity;
   const newQty = data.quantity ?? item.quantity;

   const qtyDifference = newQty - oldQty;

// If changing warhouses
    if (data.warehouse && data.warehouse !== item.warehouse) {
        // Removing from old warehouse
        oldWarehouse.currentCapacity -= oldQty;
        await oldWarehouse.save();

        // Add to new warehouse (check capacity)
        if (newWarehouse.currentCapacity + newQty > newWarehouse.maxCapacity){
            throw new Error("New warehouse does not have enough space.");
        }

        newWarehouse.currentCapacity += newQty;
        await newWarehouse.save();

    } else {
        // Same wahouse -> only move difference
        if (oldWarehouse.currentCapacity + qtyDifference > oldWarehouse.maxCapacity) {
            throw new Error ("Warehouse does not have enough space.");
        }

        oldWarehouse.currentCapacity += qtyDifference;
        await oldWarehouse.save();
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
    
    const warehouse = await findWarehouseById(item.warehouse);

    // Subtract quantity from warehouse
    warehouse.currentCapacity -+ item.quantity;
    if (warehouse.currentCapacity < 0) warehouse.currentCapacity = 0;
    await warehouse.save();

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