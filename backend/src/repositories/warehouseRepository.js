/**
 * warehouseRepository.js 
 * 
 * Repositories should only interact with the databse, nothing else.
 */

import Warehouse from "../models/Warehouse.js";

export const createWarehouse = (date) => Warehouse.create(data);

export const findWarehouseById = (id) => Warehouse.findById(id);

export const findAllWarehouses = () => Warehouse.find();

export const updateWarehouse = (id, data) => 
    Warehouse.findByIdAndUpdate(id, data, { new: true});

export const deleteWarehouse = (id) => Warehouse.findByIdAndDelete(id);

export const incrementCapacity = (warehouseId, amount) => 
    Warehouse.findByIdAndUpdate(
        warehouseId,
        { $inc: { currentCapacity: amount } },
        { new: true}
    );

    