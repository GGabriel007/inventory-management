/**
 * inventoryController.js
 * 
 *  Only handles express req/res and passes logic to services
 * 
 */

import {
    createInventoryItemService,
    getInventoryItemService,
    updateInventoryItemService,
    deleteInventoryItemService,
    getItemsByWarehouseService
} from "../services/inventoryService.js";

import InventoryItem from "../models/InventoryItem.js";

export const createItem = async (req, res, next) => {
    try {
        const item = await createInventoryItemService(req.body);
        res.status(201).json(item);
    } catch(error) {
        next(error);       // send to error handler
    }
};

export const getItems = async (req, res, next) => {
    try {
        const items = await InventoryItem.find().populate("warehouse");
        res.json(items);
    }   catch(error) {
        next(error);
    }
};

export const getItemById = async (req, res, next) => {
    try {
        const item = await getInventoryItemService(req.params.id);
        res.json(item);
    } catch (error) {
        next(error);
    }
};

export const updateItem = async (req, res, next) => {
    try {
        const item = await updateInventoryItemService(req.params.id, req.body);
        res.json(item);
    } catch(error) {
        next(error);
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const message = await deleteInventoryItemService(req.params.id);
        res.json({ message: "Item deleted successfully"});
    } catch (error) {
        next(error);
    }
};

// Get items by Warehouse ID
export const getItemsByWarehouse = async (req, res, next) => {
    try {
        const items = await getItemsByWarehouseService(req.params.warehouseId);
        res.json(items);
    }   catch (error) {
        next(error);
    }
};


