/*
    Fields
        warehouse -> ObjectId -> references Warehouse
        name -> String, required 
        sku -> String, required, unique per warehouse
        description -> String
        quantity -> Number, required
        category
        storageLocation -> String
        createdAt -> Date, default now 

    Edge Cases to Consider:
        Ensure quantity + warehouse.currenty <= warehouse.capacity
        Handle duplicate sku for the same warehouse

*/

import mongoose from "mongoose";
import Warehouse from "./Warehouse.js";

const inventorySchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: true,
            trim: true
        },

        sku: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        quantity: {
            type: Number,
            required: true,
            min: [0, "Quantity cannot be negative"]
        },

        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true
        },

        storageLocation: {
            // Ex "Aisle 3, Shelf B"
            type: String,
            default: ""
        }    
    },
    { timestamps: true }
);

/*
    PRE-SAVE: Prevent duplicate SKU inside same warehouse
*/

inventorySchema.pre("save", async function () {

    const item = this;

    const duplicate = await mongoose.models.InventoryItem.findOne({
        sku: item.sku,
        warehouseId: item.warehouseId,
        _id: { $ne: item._id }
    });

    if (duplicate) {
        throw new Error(
                `SKU "${item.sku}" already exists in this warehouse. Duplicate not allowed.`
            
        );
    }

    

});

/*
    PRE-SAVE: Adjust Warehouse capacity when quantity changes
*/

inventorySchema.pre("save", async function () {
    const item = this;

    // Detect if this is a new item or an update
    const isNew = item.isNew;

    const oldItem = !isNew
        ? await mongoose.models.InventoryItem.findById(item._id)
        : null;

    const qtyDifference = isNew
        ? item.quantity     // adding all qty
        : item.quantity - oldItem.quantity;

    // If no capacity change, skip
    if (qtyDifference === 0 ) return;

    // Get warehouse
    const warehouse = await Warehouse.findById(item.warehouseId);
    if (!warehouse) {
        throw new Error("Warehouse not found");
    }

    // Check capacity
    if (warehouse.currentCapacity + qtyDifference > warehouse.maxCapacity) {
        throw new Error(
                `Not enough space in warehouse. Adding ${qtyDifference} items exceeds max capacity. `
        );
    }

    // Apply capacity change
    warehouse.currentCapacity += qtyDifference;
    await warehouse.save();

});

/*
    STATIC METHOD: Reduce quantity (and capacity)
*/

inventorySchema.statics.reduceQuantity = async function (itemId, amount) {
    if (amount <= 0) throw new Error ("Amount must be positive");

    const item = await this.findById(itemId);
    if (!item) throw new Error ("Item not found");

    if (item.quantity < amount)
        throw new Error("Not enough items in stock to remove");

    item.quantity -= amount;

    // Update warehouse capacity
    const warehouse = await Warehouse.findById(item.warehouseId);
    warehouse.currentCapacity -= amount;
    await warehouse.save();

    return item.save();
};

const InventoryItem = mongoose.model("InventoryItem", inventorySchema);
export default InventoryItem;

