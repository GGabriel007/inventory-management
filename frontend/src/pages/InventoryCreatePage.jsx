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
    const [loading, setLoading] = useState(false);
    
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
                const res = await axiosClient.get(`/warehouses/${warehouseId}`); 
                setWarehouseName(res.data.name);
            } catch (err) {
                console.error("Error fetching warehouse:", err);
                setWarehouseName("Unknown Warehouse");
                toast.error("Could not verify warehouse details.");
            }
        };

        if (warehouseId) loadWarehouse();
    }, [warehouseId]);

    const handleChange = (e) => {
        setItemData({ ...itemData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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

            // Navigate to the details page of the new item
            navigate(`/inventory/${newItemId}`);
            
        } catch (err) {
            console.error("Error creating item:", err);
            
            let errorMessage = 'An unexpected error occurred.';

            if (err.response && err.response.data) {
                if (typeof err.response.data === 'string' && err.response.data.includes('Warehouse does not have enough space')) {
                    errorMessage = "Error: Warehouse capacity exceeded. Try reducing quantity.";
                } else if (typeof err.response.data === 'string' && err.response.data.includes('Duplicate SKU')) {
                    errorMessage = "Error: SKU already exists in this warehouse.";
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            } else {
                errorMessage = "Network Error: Could not connect to server.";
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageBackground}>
            <div style={styles.card}>
                
                {/* Header Section */}
                <div style={styles.header}>
                    <h1 style={styles.title}>New Item</h1>
                    <p style={styles.subtitle}>Enter the details for the new inventory item.</p>
                </div>

                {/* Warehouse Context Box */}
                <div style={styles.contextBox}>
                    <span style={styles.contextLabel}>Assigning to Warehouse:</span>
                    <strong style={styles.contextValue}>{warehouseName}</strong>
                    <span style={styles.contextId}>ID: {warehouseId}</span>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* Item Name */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Item Name <span style={styles.required}>*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={itemData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Wireless Mouse, Steel Beam, etc."
                            style={styles.input}
                        />
                    </div>
                
                    {/* Quantity & Storage Location Row */}
                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Quantity <span style={styles.required}>*</span></label>
                            <input
                                type="number"
                                name="quantity"
                                value={itemData.quantity}
                                onChange={handleChange}
                                min="1" 
                                required
                                placeholder="0"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Storage Location</label>
                            <input
                                type="text"
                                name="storageLocation"
                                value={itemData.storageLocation}
                                onChange={handleChange}
                                placeholder="e.g. Aisle 3, Shelf B"
                                style={styles.input}
                            />
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={itemData.description}
                            onChange={handleChange}
                            placeholder="Add optional details about this item..."
                            rows="3"
                            style={styles.textarea}
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={styles.buttonGroup}>
                        <button 
                            type="button"
                            onClick={() => navigate("/inventory")}
                            style={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={loading ? styles.buttonDisabled : styles.button}
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Professional Styles ---
const styles = {
    pageBackground: {
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", 
        paddingTop: "60px",
        paddingBottom: "60px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    card: {
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: "600px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: "40px",
        border: "1px solid #eaeaea",
    },
    header: {
        marginBottom: "30px",
        textAlign: "center",
    },
    title: {
        fontSize: "28px",
        color: "#1a1a1a",
        margin: "0 0 10px 0",
        fontWeight: "700",
    },
    subtitle: {
        color: "#666",
        fontSize: "16px",
        margin: 0,
    },
    contextBox: {
        backgroundColor: "#e3f2fd", 
        padding: "15px 20px",
        borderRadius: "8px",
        marginBottom: "30px",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        border: "1px solid #bbdefb",
    },
    contextLabel: {
        color: "#0d47a1",
        fontSize: "0.9rem",
    },
    contextValue: {
        color: "#1565c0",
        fontSize: "1rem",
        flexGrow: 1,
    },
    contextId: {
        fontSize: "0.8rem",
        color: "#546e7a",
        fontFamily: "monospace",
        backgroundColor: "rgba(255,255,255,0.5)",
        padding: "2px 6px",
        borderRadius: "4px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    row: {
        display: "flex",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: "8px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        letterSpacing: "0.3px",
    },
    required: {
        color: "#d9534f",
    },
    input: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "16px",
        outline: "none",
        transition: "all 0.2s",
        backgroundColor: "#f9fafb",
    },
    textarea: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "16px",
        outline: "none",
        resize: "vertical",
        transition: "all 0.2s",
        backgroundColor: "#f9fafb",
        fontFamily: "inherit",
    },
    buttonGroup: {
        display: "flex",
        gap: "15px",
        marginTop: "10px",
    },
    button: {
        flex: 1,
        padding: "14px",
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "background 0.2s",
        boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
    },
    buttonDisabled: {
        flex: 1,
        padding: "14px",
        background: "#90caf9",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "not-allowed",
        fontWeight: "600",
        fontSize: "16px",
    },
    cancelButton: {
        flex: 1,
        padding: "14px",
        background: "#fff", 
        color: "#555",
        border: "1px solid #ccc",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "background 0.2s",
    },
};