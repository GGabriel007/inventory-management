/**
 * warehouseRepository.js 
 * 
 * Repositories should only interact with the databse, nothing else.
 */

import Warehouse from "../models/Warehouse.js";

export const createWarehouse = (data) => Warehouse.create(data);

export const findAllWarehouses = () => Warehouse.find();

export const findWarehouseById = (id) => Warehouse.findById(id);


export const updateWarehouse = (id, data) => 
    Warehouse.findByIdAndUpdate(id, data, { new: true});

export const deleteWarehouse = (id) => Warehouse.findByIdAndDelete(id);

export const incrementCapacity = (warehouseId, amount) => 
    Warehouse.findByIdAndUpdate(
        warehouseId,
        { $inc: { currentCapacity: amount } },
        { new: true}
    );

    