import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";



/*
    server.js
    Handles:
    Express app
    Middleware (cors, express.json)
    MongoDB connection
    Base route / -> test server
*/

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("Backend API is running!");
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/warehouses", warehouseRoutes);
app.use("/inventory", inventoryRoutes);

process.setMaxListeners(20);