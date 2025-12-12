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
*/

import mongoose from "mongoose";

// Note: Warehouse import is not needed here anymore as capacity logic is in the Service.

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

/*
    PRE-SAVE: Prevent duplicate SKU inside same warehouse
    FIX: Removed 'next' parameter. using async/throw pattern.
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
        // In async middleware, simply throwing an error stops the save
        throw new Error(
            `SKU "${item.sku}" already exists in this warehouse. Duplicate not allowed.`
        );
    }
});

// ---------------------------------------------------------
// 🚨 NOTE: Capacity logic is intentionally removed from here.
// The Service layer (inventoryService.js) handles capacity.
// ---------------------------------------------------------

const InventoryItem = mongoose.model("InventoryItem", inventorySchema);
export default InventoryItem;