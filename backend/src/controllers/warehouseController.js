/**
 * warehouseController.js
 * * HTTP Request Handler for Warehouse Operations.
 * * This file acts as the interface between the Express API routes and the business logic services.
 * * It handles:
 *  Receiving HTTP requests (GET, POST, PUT, DELETE).
 *  Extracting data from the request body or parameters.
 *  Calling the appropriate Service function.
 *  Sending back the correct HTTP status codes and JSON responses.
 */

import {
    createWarehouseService,
    getAllWarehousesService,
    getWarehouseByIdService,
    updateWarehouseService,
    deleteWarehouseService
} from "../services/warehouseService.js";

/**
 * Creates a new warehouse.
 * * Calls the service to create a warehouse record.
 */
export const createWarehouse = async (req, res, next) => {
    try {
        const warehouse = await createWarehouseService(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        next(error);
    }
};

// Retrieves a list of all warehouses.
export const getWarehouses = async (req, res) => {
    try {
        const warehouses = await getAllWarehousesService();
        res.status(200).json(warehouses);
    } catch (error) {
        next(error);
    }
};

// Returns the warehouse object if found.
export const getWarehouseById = async (req, res, next) => {
    try {
        const warehouse = await getWarehouseByIdService(req.params.id);
        res.json(warehouse);
    } catch (error) {
        next(error);
    }
};

// Updates an existing warehouse
export const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await updateWarehouseService(req.params.id, req.body);
        res.json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message});
    }
};

//  Deletes a warehouse
export const deleteWarehouse = async (req, res, next) => {
    try {
        await deleteWarehouseService(req.params.id);
        res.json({ message: "Warehouse deleted successfully" });
    } catch (error) {
        next(error);
    }
};
