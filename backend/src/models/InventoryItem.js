/**
 * InventoryItem.js
 * * Mongoose Schema for Inventory Items.
 * * Defines the structure of inventory records stored in the database.
 * * Includes pre-save middleware to enforce SKU uniqueness within a warehouse scope.
 */

import mongoose from "mongoose";


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

        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true
        },

        storageLocation: {
            type: String,
            default: ""
        }    
    },
    { timestamps: true }
);

/**
 * Pre-Save Hook: Enforce Unique SKU per Warehouse
 * * Before saving, this hook checks if an item with the same SKU already exists
 * in the target warehouse. If found, it throws an error to prevent duplication.
 */
inventorySchema.pre("save", async function () {

    const item = this;

    // Only check if SKU or Warehouse has changed
    if (!item.isModified('sku') && !item.isModified('warehouse')) {
        return; 
    }

    const duplicate = await mongoose.models.InventoryItem.findOne({
        sku: item.sku,
        warehouse: item.warehouse,
        _id: { $ne: item._id }
    });

    if (duplicate) {
        throw new Error(
            `SKU "${item.sku}" already exists in this warehouse. Duplicate not allowed.`
        );
    }
});


const InventoryItem = mongoose.model("InventoryItem", inventorySchema);
export default InventoryItem;