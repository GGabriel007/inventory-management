/**
 * inventoryRepository.js
 * * Data Access Layer for Inventory Items.
 * This file handles direct database interactions using Mongoose models.
 * It abstracts the database logic away from the Service layer.
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

/**
 * Checks if a specific SKU already exists within a target warehouse.
 * * This query is dynamic:
 * 1. If `excludeId` is provided (during an update), it ensures the SKU is unique 
 * BUT ignores the item currently being updated (so it doesn't flag itself).
 * 2. If `excludeId` is null (during creation), it simply checks if the SKU exists.
 */
export const findDuplicateSKU = async (sku, warehouseId, excludeId = null) =>
    await InventoryItem.findOne({
        sku,
        warehouse: warehouseId,
        ...(excludeId ? { _id: { $ne: excludeId } }: {}),
    });

export const countItemsByWarehouse = async (warehouseId) => {
    return await InventoryItem.countDocuments({ warehouse: warehouseId });
};