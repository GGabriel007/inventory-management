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


/*
    CREATE ITEM
*/
export const createItem = async (req, res, next) => {
    try {
        const item = await createInventoryItemService(req.body);
        res.status(201).json(item);
    } catch(error) {
        next(error);     
    }
};

/*
    GET ALL ITEMS
*/
export const getItems = async (req, res, next) => {
    try {
        const items = await getAllInventoryItemsService();
        res.json(items);
    }  catch(error) {
        next(error);
    }
};


/*
    GET ITEM BY ID
*/
export const getItemById = async (req, res, next) => {
    try {
        const item = await getInventoryItemService(req.params.id);
        res.json(item);
    } catch (error) {
        next(error);
    }
};

/*
    UPDATE ITEM
*/
export const updateItem = async (req, res, next) => {
    try {
        const item = await updateInventoryItemService(req.params.id, req.body);
        res.json(item);
    } catch(error) {
        next(error);
    }
};


/*
    DELETE ITEM
*/
export const deleteItem = async (req, res, next) => {
    try {
        await deleteInventoryItemService(req.params.id);
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        next(error);
    }
};


/*
    GET ITEMS BY WAREHOUSE
*/
export const getItemsByWarehouse = async (req, res, next) => {
    try {
        if(!req.params.warehouseId) {
            return res
                .status(400)
                .json({ error: "warehouseId parameter is required"});
        }

        const items = await getItemsByWarehouseService(req.params.warehouseId);
        res.json(items);
    }   catch (error) {
        next(error);
    }
};


