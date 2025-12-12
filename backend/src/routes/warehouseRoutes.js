/*
    warehouseRoutes.js 
    CRUD operations for warehouses

    Warehouse Routes
    POST /api/warehouses -> add new warehouse
    GET /api/warehouses -> get all warehouses
    GET /api/warehouses/:id -> get warehouse details
    PUT /api/warehouses/:id -> update warehouse
    DELETE /api/warehouses/:id -> delete warehouse
    GET    /api/warehouses/:id/inventory
*/

// Import inventory controller to handle nested resource request
import { getItemsByWarehouse } from "../controllers/inventoryController.js";

import express from "express";
import {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
} from "../controllers/warehouseController.js";

const router = express.Router();

router.post("/", createWarehouse);
router.get("/", getWarehouses);
router.get("/:id", getWarehouseById);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

router.get("/:warehouseId/inventory", getItemsByWarehouse);
export default router;