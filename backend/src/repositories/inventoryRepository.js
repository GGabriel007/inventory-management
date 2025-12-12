/**
 * inventoryRepository.js 
 * 
 * Repositories should only interact with the databse, nothing else.
 */

import InventoryItem from "../models/InventoryItem.js";
import Warehouse from "../models/Warehouse.js";

// Create
export const createItem = async (data) => 
    await InventoryItem.create(data);

// Read
export const findItemId = async (id) => 
    await InventoryItem.findById(id);

export const findItemById = async (id) => 
    await InventoryItem.findById(id).populate('warehouse');

export const findItemsByWarehouse = async (warehouseId) => 
    await InventoryItem.find({ warehouse: warehouseId });

export const findAllItems = async () => 
    await InventoryItem.find().populate("warehouse");

// Update
export const updateItem = async (id, data) => 
    await InventoryItem.findByIdAndUpdate(id, data, { new: true });

// Delete
export const deleteItem = async (id) => 
    await InventoryItem.findByIdAndDelete(id);

// Check for duplicate SKU 
export const findDuplicateSKU = async (sku, warehouseId, excludeId = null) =>
    await InventoryItem.findOne({
        sku,
        warehouse: warehouseId,
        ...(excludeId ? { _id: { $ne: excludeId } }: {}),
    });

export const countItemsByWarehouse = async (warehouseId) => {
    // Assuming 'InventoryItem' model has a field 'warehouse' referencing the warehouse ID
    return await InventoryItem.countDocuments({ warehouse: warehouseId });
};