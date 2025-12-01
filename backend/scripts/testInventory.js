import mongoose from "mongoose";
import dotenv from "dotenv";
import Warehouse from "../src/models/Warehouse.js";
import InventoryItem from "../src/models/InventoryItem.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        // Creating a test warehouse
        const warehouse = await Warehouse.create({
            name: "Test Warehouse A",
            location: "Baltimore",
            maxCapacity: 110,
            currentCapacity: 0
        });
        console.log("Created warehouse:" , warehouse);

        // Add an inventory item
        const item1 = await InventoryItem.create({
            name: "Laptop",
            sku: "LT-123",
            description: "Dell XPS 13",
            quantity: 10,
            warehouseId: warehouse._id,
            storageLocation: "Aisle 1, Shelf A"
        });
        console.log("Created inventory item:", item1);

        // Attemp to add a duplicate SKU in the same warehouse
        try {
            const itemDuplicate = await InventoryItem.create({
                name: "Laptop Duplicate",
                sku: "LT-123",
                description: "Another laptop",
                quantity: 5,
                warehouseId: warehouse._id,
                storageLocation: "Aisle 1, Shelf B"
            });

        } catch (err) {
            console.error("Duplicate SKU prevented:", err.message);
        }

        // Add a SKU with same value in a different warehouse (should succeed)
        const warehouseB = await Warehouse.create({
            name: "Test Warehouse B",
            location: "DC",
            maxCapacity: 50,
            currentCapacity: 0
        });

        const item2 = await InventoryItem.create({
            name: "Laptop Warehouse B",
            sku: "LT-123",  // Same SKU but different warehouse
            description: "Same SKU different warehouse",
            quantity: 5,
            warehouseId: warehouseB._id,
            storageLocation: "Aisle 2, Shelf A"

        });
        console.log("Created item in different warehouse:", item2);


        // Reduce item quantity
        await InventoryItem.reduceQuantity(item1._id, 5);
        const updatedItem1 = await InventoryItem.findById(item1._id);
        const updatedWarehouse = await Warehouse.findById(warehouse._id);

        console.log("Updated item quantity:", updatedItem1.quantity);
        console.log("Updated warehouse capacity:", updatedWarehouse.currentCapacity);


        console.log("Test script completed successfully.");
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }   
}

run();