/**
 * inventoryController.js
 * 
 *  Only handles express req/res and passes logic to services
 * 
 */

import {
    createInventoryItemService,
    getAllInventoryItemsService,
    getInventoryItemService,
    updateInventoryItemService,
    deleteInventoryItemService,
    getItemsByWarehouseService
} from "../services/inventoryService.js";

export const createItem = async (req, res, next) => {
    try {
        const item = await createInventoryItemService(req.body);
        res.status(201).json(item);
    } catch(error) {
        next(error);     
    }
};

export const getItems = async (req, res, next) => {
    try {
        const items = await getAllInventoryItemsService();
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
        await deleteInventoryItemService(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        next(error);
    }
};


export const getItemsByWarehouse = async (req, res, next) => {
    try {
        const items = await getItemsByWarehouseService(req.params.warehouseId);
        res.json(items);
    }   catch (error) {
        next(error);
    }
};


