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

export const getAllInventoryItemsService  = async () => {
    return await findAllItems();
};

export const getInventoryItemService = async (id) => {
    const item = await findItemId(id);
    if (!item) throw new Error("Item not found");
    return item;

};

export const updateInventoryItemService = async (id, data) => {
    const item = await findItemId(id);
    if (!item) throw new Error("Item not found");

    const warehouseId = data.warehouse || item.warehouse; 

    if(data.sku) {
        const existing = await findDuplicateSKU(data.sku, data.warehouse,id);
        if (existing) {
            throw new Error(`SKU "${data.sku}" already exists in this warehouse.`);
        }
    }
    
    Object.assign(item, data);
    await item.save();
    
    return item;
};

export const deleteInventoryItemService = async (id) => {
    const item = await deleteItem(id);
    if (!item) throw new Error("Item not found");
    return item;
};

export const getItemsByWarehouseService = (warehouseId) => {
    findItemsByWarehouse(warehouseId);
};