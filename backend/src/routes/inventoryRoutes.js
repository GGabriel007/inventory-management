/*
    inventoryRoutes.js 
    CRUD operations for inventory items + transfer endpoint

    Inventory Routes
    POST /api/inventory -> add new item (check warehouse capacity)
    GET /api/inventory -> list all items with filters 
    GET /api/inventory -> get item details
    PUT /api/inventory/:id update item
    DELETE /api/inventory/:id -> delete item
    POST /api/inventory/transfer -> transfer item between warehouses
*/

import express from "express";
import {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem
} from "../controllers/inventoryController.js";

const router = express. Router();

router.post("/", createItem);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;