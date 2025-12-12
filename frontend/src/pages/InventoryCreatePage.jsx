// /pages/InventoryCreatePage.jsx
// Add new inventory item

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import toast from 'react-hot-toast';


export default function InventoryCreatePage() { 
    const { warehouseId } = useParams();
    const navigate = useNavigate();

    const [warehouseName, setWarehouseName] = useState("Loading...");
    const [itemData, setItemData] = useState({
        name: "",
        sku: "",
        description: "",
        quantity: "",
        storageLocation: "",
        warehouse: warehouseId
    });

    // Fetch the warehouse name to display on the form
    useEffect(() => {
        const loadWarehouse = async () => {
            try {
                // NOTE: Using window.fetch, consider moving to axiosClient for consistency
                const res = await axiosClient.get(`/warehouses/${warehouseId}`); 
                setWarehouseName(res.data.name);
            } catch (err) {
                console.error("Error fetching warehouse:", err);
                setWarehouseName("Not Found");
            }
        };

        loadWarehouse();
    }, [warehouseId]);

    const handleChange = (e) => {
        setItemData({ ...itemData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name: itemData.name,
            sku: itemData.sku,
            description: itemData.description,
            quantity: Number(itemData.quantity),
            warehouse: warehouseId, 
            storageLocation: itemData.storageLocation,
        };

        try {
            const res = await axiosClient.post("/inventory", payload);
            const newItemId = res.data._id || res.data.id;

            toast.success(`${payload.name} created successfully!`, {
                duration: 3000, 
            });

            navigate(`/inventory/${newItemId}`);
            
        } catch (err) {
    console.error("Error creating item:", err);
    
    let errorMessage = 'An unexpected error occurred.';

    // Check if the server provided a response object
    if (err.response && err.response.data) {
        
        // 1. Check for the CAPACTIY error
        if (typeof err.response.data === 'string' && err.response.data.includes('Warehouse does not have enough space')) {
            errorMessage = "Error: Warehouse does not have enough space. Try reducing the quantity.";
        } 
        
        // 🚨 NEW: Check for the DUPLICATE SKU error
        else if (typeof err.response.data === 'string' && err.response.data.includes('Duplicate SKU in the same warehouse is not allowed')) {
            // Provide the specific, user-friendly message you requested
            errorMessage = "Error: The SKU you entered already exists in this warehouse. Please use a unique SKU.";
        }
        
        // OPTIONAL: Fallback for generic server error (like the 500 status code)
        else if (err.response.data.message) {
            errorMessage = `Failed to create item: ${err.response.data.message}`;
        } else if (err.response.status === 500) {
            errorMessage = `A server error occurred (Code 500). Please check your input.`;
        }
        
    } else {
        errorMessage = `Network Error: Could not connect to the server.`;
    }

    // Display the specific error message to the user
    toast.error(errorMessage);
}
    };

    return (
        <div style={styles.container}>
            <h1>Add Inventory Item</h1>
            {/* Show the Warehouse Name and the ID the item will be assigned to */}
            <h3>
                Warehouse: {warehouseName} 
                <span style={{ fontSize: '0.8em', color: '#666' }}><br/> ID: {warehouseId}</span>
            </h3>

            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* Name (Required by your state/form, though not explicitly in your backend list) */}
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={itemData.name}
                    onChange={handleChange}
                    required
                />
            
                {/* Quantity (Required, non-negative) */}
                <label>Quantity (Required, Min 1):</label>
                <input
                    type="number"
                    name="quantity"
                    value={itemData.quantity}
                    onChange={handleChange}
                    min="1" 
                    required
                />
                
                {/* Storage Location (Optional) */}
                <label>Storage Location (Optional):</label>
                <input
                    type="text"
                    name="storageLocation"
                    value={itemData.storageLocation}
                    onChange={handleChange}
                />
                
                {/* Description (Optional) */}
                <label>Description (Optional):</label>
                <textarea
                    name="description"
                    value={itemData.description}
                    onChange={handleChange}
                />
                
                <button type="submit" style={styles.button}>
                    Create Item
                </button>

                <button 
                    type="button"
                    onClick={() => navigate("/inventory")}
                    style={styles.cancelButton}
                    >
                        Cancel
                    </button>
            </form>
        </div>
    );
};

const styles = {


    container: {
        maxWidth: "600px",
        margin: "30px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    button: {
        padding: "10px",
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },
    cancelButton: {
        padding: "10px",
        background: "#6c757d", 
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },
};
