/**
 * inventoryController.js
 * * HTTP Request Handler for Inventory Operations.
 * * This layer is responsible for:
 *  Extracting data from Express Request objects (body, params, query).
 *  Calling the appropriate Business Service.
 *  Sending the formatted HTTP Response (JSON, Status Codes).
 *  Passing errors to the global error handling middleware.
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
        // req.body contains name, quantity, warehouseId, description
        // SKU is NOT here, it is generated in the service
        const item = await createInventoryItemService(req.body);
        
        // Respond with 201 Created and the new item (which includes the SKU)
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