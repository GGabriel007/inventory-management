/* 
    backend/src/models/Warehouse.js
    Fields

    name -> String, required
    location -> String, required
    Maxcapacity -> Number, required (max capacity)
    currentCapacity -> Number, default 0 (to track how full the warehouse is)
    createdAt -> Date, default now

    - When creating a warehouse, set name, location, and maxCapacity, currentCapacity will default to 0.
    - When adding iventory items, call Warehouse.increaseCapacity(warehouseId, qty) after validating 
      item creation (or as part of a transaction/sequence) to ensure atomic updates and capacity checks.
    - When removing items or transferring out, call Warehouse.decreaseCapacity(warehouseId, qty).

*/

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const warehouseSchema = new Schema (
    {
        name: {
            type: String,
            required: [true, "Warehouse name is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Warehouse location is required"],
            trim: true,
        },
        maxCapacity: {
            type: Number,
            required: [true, "Max capacity is required"],
            min: [0, "Max capacity cannot be negative"],
        },
        // currentCapacity tracks the total quantity stored.
        // Keep it updated via controller logic 
        currentCapacity: {
            type: Number,
            default: 0,
            immutable: true,
        },
        meta: {
            // optional free-form metadata if I want like manage, phone etc.
            manager: { type: String, trim: true},
            notes: { type: String, trim: true},
        },
    },
    {
        timestamps: true,
    }
);

// Prevent two warehouses with same name & location
warehouseSchema.index({ name: 1, location: 1}, { unique: true});

// Validation: ensure currentCapacity never exceeds maxCapacity
warehouseSchema.pre("validate", function (){
    if (this.currentCapacity > this.maxCapacity) {
        return next (
            new Error (
                `currentCapacity (${this.currentCapacity}) exceeds maxCapacity (${this.maxCapacity})`
            )
        );
    }
});

/**
 * Atomically increase currentCapacity by qty.
 * Throws an error if it would exceed maxCapacity.
 * 
 * Usage in controllers:
 * await Warehouse.increaseCapacity(warehouseId, qtyToAdd);
 * 
 */

warehouseSchema.statics.increaseCapacity = async function (warehouseId, amount) {
    if(amount <= 0) {
        throw new Error("Amount must be positive");
    }

    const warehouse = await this.findById(warehouseId);
    if(!warehouse) throw new Error("Warehouse not found");

    if (warehouse.currentCapacity + amount > warehouse.maxCapacity) {
        throw new Error("Cannot exceed max capacity");
    }

    warehouse.currentCapacity += amount;
    return warehouse.save();
    
};

/**
 * Atomically decrease currentCapacity by qty.
 * Throws an error if it would go below zero.
 * 
 */

warehouseSchema.statics.decreaseCapacity = async function (warehouseId, amount) {
    if(amount <= 0) {
        throw new Error("Amount must be positive");
    }

    const warehouse = await this.findById(warehouseId);
    if(!warehouse) throw new Error("Warehouse not found");

    if (warehouse.currentCapacity - amount < 0) {
        throw new Error("Cannot go below zero");
    }

    warehouse.currentCapacity -= amount;
    return warehouse.save();
};

const Warehouse = model("Warehouse", warehouseSchema);
export default Warehouse;