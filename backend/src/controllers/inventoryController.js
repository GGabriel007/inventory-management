/*
    inventoryController.js 
    all inventory logic, including edge cases

*/

import InventoryItem from "../models/InventoryItem.js";

export const createItem = async (req, res) => {
    try {
        const item = await InventoryItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getItems = async (req, res) => {
    try {
        const items = await InventoryItem.find().populate("warehouseId");
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getItemById = async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id).populate("warehouseId");
        if (!item) return res.status(404).json({ error: "Item not found" });

        res.json(item);
    } catch (error) {
        res.status(400).json({ error: "Invalid ID format"});
    }
};

export const updateItem = async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new : true, runValidators: true}
        );

        if (!item) return res.status(404).json({ error: "Item not found" });

        res.json(item);
    } catch (error) {
        res.status(400).json({ error: error.message});
    }
};

export const deleteItem = async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);

        if (!item)
            return res.status(404).json({ error: "Item not found"});

        await item.deleteOne();     // capacity should update in pre-delete hook

        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};