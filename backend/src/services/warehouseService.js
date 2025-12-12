/**
 * warehouseService.js
 * * Business Logic Layer for Warehouse Operations.
 * * This layer acts as the bridge between the controllers and the database repositories.
 * * Key Responsibilities:
 * 1. Data Sanitization (ensuring read-only fields like 'currentCapacity' aren't manually edited).
 * 2. Error Handling (throwing clean errors if warehouses aren't found).
 * 3. Business Rule Enforcement.
 */

import {
    createWarehouse,
    findWarehouseById,
    findAllWarehouses,
    updateWarehouse,
    deleteWarehouse,
} from "../repositories/warehouseRepository.js";


/**
 * Creates a new warehouse entity.
 * * Enforces the rule that 'currentCapacity' must start at 0 (or default)
 * and cannot be manually set during creation to prevent data mismatches.
 */
export const createWarehouseService = async (data) => {
    delete data.currentCapacity;
    
    // Validation or business rules 
    return await createWarehouse(data);
};

// Retrieves a single warehouse by its ID.
export const getAllWarehousesService = async () => {
    return await findAllWarehouses();
};

export const getWarehouseByIdService = async (id) => {
    const warehouse = await findWarehouseById(id);
    if (!warehouse) throw new Error ("Warehouse not found");
    return warehouse;
};


/**
 * Updates an existing warehouse's details (e.g., Name, Location, Max Capacity).
 * * STRICT RULE: 'currentCapacity' cannot be updated via this endpoint. 
 * Capacity is a calculated value managed by inventory movements only.
 * Attempting to send 'currentCapacity' will throw an error to alert the API consumer.
 */
export const updateWarehouseService = async (id, data) => {
     
    if("currentCapacity" in data) {
        delete data.currentCapacity;
        throw new Error("currentCapacity cannot be updated directly. It is managed automatically by inventory changes.")

    }
    
    const warehouse = await updateWarehouse(id, data);
    if (!warehouse) throw new Error("Warehouse not found");
    return warehouse;
};

/**
 * Deletes a warehouse from the system.
 * * Note: Ideally, this should also check if the warehouse is empty before deletion 
 * (handled in frontend or separate validation logic).
 */
export const deleteWarehouseService = async (id) => {
    const deleted = await deleteWarehouse(id);
    if (!deleted) throw new Error("Warehouse not found");
    return deleted;
};

