/**
 * warehouseRepository.js 
 * * Data Access Layer for Warehouses.
 * Handles direct interactions with the Warehouse Mongoose model.
 * Includes atomic operations for capacity management and sequence counters.
 */

import Warehouse from "../models/Warehouse.js";

// --- CRUD OPERATIONS ---

export const createWarehouse = (data) => Warehouse.create(data);

export const findAllWarehouses = () => Warehouse.find();

export const findWarehouseById = (id) => Warehouse.findById(id);


export const updateWarehouse = (id, data) => 
    Warehouse.findByIdAndUpdate(id, data, { new: true});

export const deleteWarehouse = (id) => Warehouse.findByIdAndDelete(id);

// --- ATOMIC OPERATIONS ---

/**
 * Atomically updates the current capacity of a warehouse.
 * * Uses MongoDB's `$inc` operator to ensure thread-safety during concurrent updates.
 * Passing a negative 'amount' will decrease the capacity.
*/
export const incrementCapacity = (warehouseId, amount) => 
    Warehouse.findByIdAndUpdate(
        warehouseId,
        { $inc: { currentCapacity: amount } },
        { new: true }
    );


/**
 * Atomically increments the inventory counter for SKU generation.
 * * This function is critical for generating unique, sequential SKUs (e.g., WH-0001, WH-0002).
 * It finds the warehouse, increments its internal counter by 1, and returns the new value
 * in a single atomic operation to prevent race conditions.
*/
export const findAndIncrementInventoryCounter = async (warehouseId) => {
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
        warehouseId,
        { $inc: { inventoryCounter: 1 } }, 
        { new: true, select: 'code inventoryCounter' } 
    );

    if (!updatedWarehouse) {
        throw new Error(`Warehouse with ID ${warehouseId} not found.`);
    }

    return updatedWarehouse;
};