/*
    warehouseController.js
    Only handles express req/res and passes logic to services
*/

import {
    createWarehouseService,
    getAllWarehousesService,
    getWarehouseByIdService,
    updateWarehouseService,
    deleteWarehouseService
} from "../services/warehouseService.js";

export const createWarehouse = async (req, res, next) => {
    try {
        const warehouse = await createWarehouseService(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        next(error);
    }
};

export const getWarehouses = async (req, res) => {
    try {
        const warehouses = await getAllWarehousesService();
        res.status(200).json(warehouses);
    } catch (error) {
        next(error);
    }
};

export const getWarehouseById = async (req, res, next) => {
    try {
        const warehouse = await getWarehouseByIdService(req.params.id);
        res.json(warehouse);
    } catch (error) {
        next(error);
    }
};

export const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await updateWarehouseService(req.params.id, req.body);
        res.json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message});
    }
};

export const deleteWarehouse = async (req, res, next) => {
    try {
        await deleteWarehouseService(req.params.id);
        res.json({ message: "Warehouse deleted successfully" });
    } catch (error) {
        next();
    }
};
