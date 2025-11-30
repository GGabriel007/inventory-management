import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Warehouse from "../src/models/Warehouse.js";

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    const w = await Warehouse.create({ name: "Test WH1", location: "Germantown", maxCapacity: 200, currentCapacity: 2});
    console.log("created:", w);

    const inc = await Warehouse.increaseCapacity(w._id, 25);
    console.log("after increase:", inc.currentCapacity);
    
    const dec = await Warehouse.decreaseCapacity(w._id, 1);
    console.log("after decrease:", dec.currentCapacity);
    await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });