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

export const createWarehouse = async (req, res) => {
    try {
        const warehouse = await createWarehouseService(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message});
    }
};

export const getWarehouses = async (req, res) => {
    try {
        const warehouses = await getAllWarehousesService();
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

export const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await getWarehouseByIdService(req.params.id);
        res.json(warehouse);
    } catch (error) {
        res.status(404).json({ error: error.message});
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

export const deleteWarehouse = async (req, res) => {
    try {
        await deleteWarehouseService(req.params.id);
        res.json({ message: "Warehouse deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: error.message});
    }
};
