/* backend/src/models/Warehouse.js */

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

// 🚨 UPDATED: Async Validation Hook (No 'next' param)
warehouseSchema.pre("validate", async function () {
    if (this.currentCapacity > this.maxCapacity) {
        throw new Error(
            `currentCapacity (${this.currentCapacity}) exceeds maxCapacity (${this.maxCapacity})`
        );
    }
});

/**
 * Atomically increase currentCapacity by qty.
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