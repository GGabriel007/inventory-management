/* backend/src/models/Warehouse.js */
/**
 * Warehouse.js
 * * Mongoose Schema for Warehouses.
 * * Defines the structure for storage locations including capacity constraints.
 * * Includes atomic static methods for safe capacity management.
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
        code: {
            type: String,
            unique: true,
            sparse: true 
        },
        currentCapacity: {
            type: Number,
            default: 0,
        },
        inventoryCounter: { 
            type: Number, 
            default: 0 
        },
    },
    {
        timestamps: true,
    }
);

// Prevent two warehouses with same name & location
warehouseSchema.index({ name: 1, location: 1}, { unique: true});

/**
 * Pre-Validate Hook: Enforce Capacity Limits
 * * Ensures that 'currentCapacity' never exceeds 'maxCapacity' before any save operation.
 * This acts as a database-level safety net.
 */
warehouseSchema.pre("validate", async function () {
    if (this.currentCapacity > this.maxCapacity) {
        throw new Error(
            `currentCapacity (${this.currentCapacity}) exceeds maxCapacity (${this.maxCapacity})`
        );
    }
});

/**
 * Atomically increases the current capacity of a warehouse.
 * * Validates that the increase will not exceed the maximum limit.
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
 * Atomically decreases the current capacity of a warehouse.
 * * Validates that the decrease will not drop below zero.
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