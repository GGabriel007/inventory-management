/**
 * inventoryRepository.js 
 * 
 * Repositories should only interact with the databse, nothing else.
 */

import InventoryItem from "../models/InventoryItem.js";
import Warehouse from "../models/Warehouse.js";

export const createItem = (data) => InventoryItem.create(data);

export const findItemId = (id) => InventoryItem.findById(id);

export const findItemsByWarehouse = (warehouseId) => 
    InventoryItem.find({ warehouse: warehouseId });

export const updateItem = (id, data) => 
    InventoryItem.findByIdAndUpdate(id, data, { new: true });

export const deleteItem = (id) => InventoryItem.findByIdAndDelete(id);

export const findDuplicateSKU = (sku, WarehouseId, excludeId) =>
    InventoryItem.findOne({
        sku,
        warehouse: warehouseId,
        _id: { $ne: exlucdeId },
    });