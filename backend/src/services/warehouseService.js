import {
    createWarehouse,
    findWarehouseById,
    findAllWarehouses,
    updateWarehouse,
    deleteWarehouse,
} from "../repositories/warehouseRepository.js";

export const createWarehouseService = async (data) => {
    delete data.currentCapacity;
    
    // Validation or business rules 
    return await createWarehouse(data);
};

export const getAllWarehousesService = async () => {
    return await findAllWarehouses();
};

export const getWarehouseByIdService = async (id) => {
    const warehouse = await findWarehouseById(id);
    if (!warehouse) throw new Error ("Warehouse not found");
    return warehouse;
};


export const updateWarehouseService = async (id, data) => {
    
    
    if("currentCapacity" in data) {
        delete data.currentCapacity;
        throw new Error("currentCapacity cannot be updated directly. It is managed automatically by inventory changes.")

    }
    
    const warehouse = await updateWarehouse(id, data);
    if (!warehouse) throw new Error("Warehouse not found");
    return warehouse;
};

export const deleteWarehouseService = async (id) => {
    const deleted = await deleteWarehouse(id);
    if (!deleted) throw new Error("Warehouse not found");
    return deleted;
};

