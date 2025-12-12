// /pages/InventoryDetailPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast"; 

/**
 * InventoryDetailPage.jsx
 * * Displays comprehensive details for a specific inventory item.
 * * Features:
 *  Fetches item data by ID from the API.
 *  Handles data population issues (e.g., if warehouse details are missing).
 *  Visualizes stock status (Green/Yellow/Red) based on quantity thresholds.
 *  Shows timestamps and system metadata.
 */

export default function InventoryDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchItem() {
            try {
                // 1. Fetch the Inventory Item
                const itemResponse = await axiosClient.get(`/inventory/${id}`);
                let itemData = itemResponse.data;

                // 2. ROBUST WAREHOUSE CHECK
                const isWarehouseIncomplete = 
                    itemData.warehouse && 
                    (typeof itemData.warehouse === 'string' || !itemData.warehouse.name);

                if (isWarehouseIncomplete) {
                    try {
                        // Determine the ID safely
                        const warehouseId = typeof itemData.warehouse === 'string' 
                            ? itemData.warehouse 
                            : itemData.warehouse?._id;

                        if (warehouseId) {
                            // Fetch full warehouse details
                            const warehouseResponse = await axiosClient.get(`/warehouses/${warehouseId}`);
                            // Replace the partial info with the full warehouse object
                            itemData = { ...itemData, warehouse: warehouseResponse.data };
                        }
                    } catch (whError) {
                        console.error("Could not fetch warehouse details separately", whError);
                    }
                }

                setItem(itemData);

            } catch (error) {
                console.error("Error fetching inventory item:", error);
                toast.error("Could not load item details.");
            } finally {
                setLoading(false);
            }
        }

        fetchItem();
    }, [id]);

    // --- Helper for Status Colors ---
    const getStockStatus = (qty) => {
        // 1. Critical Level (Less than 50) -> RED
        if (qty < 50) {
            return { label: "Critical Stock", color: "#d9534f", bg: "#fde8e8" }; 
        }
        
        // 2. Warning Level (Less than 150) -> YELLOW
        if (qty < 150) {
            return { label: "Low Stock", color: "#f0ad4e", bg: "#fcf8e3" }; 
        }

        // 3. Good Level (150 and above) -> GREEN
        return { label: "In Stock", color: "#5cb85c", bg: "#dff0d8" }; 
    };

    if (loading) return <div style={styles.loadingContainer}>Loading item details...</div>;
    if (!item) return <div style={styles.loadingContainer}>Item not found.</div>;

    const status = getStockStatus(item.quantity);

    // Safety fallback
    const warehouseName = item.warehouse?.name || "Unknown Warehouse";
    const warehouseLocation = item.warehouse?.location || "Location not available";

    return (
        <div style={styles.pageContainer}>
            {/* 1. Top Navigation Bar */}
            <div style={styles.topBar}>
                <button style={styles.backButton} onClick={() => navigate("/inventory")}>
                     Back to Inventory
                </button>
            </div>

            {/* 2. Main Content Card */}
            <div style={styles.card}>
                
                {/* Card Header */}
                <div style={styles.cardHeader}>
                    <div>
                        <h1 style={styles.title}>{item.name}</h1>
                        <span style={styles.skuBadge}>SKU: {item.sku}</span>
                    </div>
                </div>

                <hr style={styles.divider} />

                {/* Card Body: Info Grid */}
                <div style={styles.gridContainer}>
                    
                    {/* Left Column */}
                    <div style={styles.infoColumn}>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Quantity Status</label>
                            <div style={{ 
                                ...styles.statusBox, 
                                color: status.color, 
                                backgroundColor: status.bg, 
                                borderColor: status.color 
                            }}>
                                <span style={styles.bigQty}>{item.quantity}</span>
                                <span style={styles.statusLabel}>{status.label}</span>
                            </div>
                        </div>

                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Warehouse Location</label>
                            <div style={styles.warehouseBox}>
                                <strong>{warehouseName}</strong>
                                <br />
                                <span style={{fontSize: '0.9em', color: '#666'}}>
                                    {warehouseLocation}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={styles.infoColumn}>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Description</label>
                            <p style={styles.description}>
                                {item.description || "No description provided for this item."}
                            </p>
                        </div>

                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Storage Location (Shelf/Bin)</label>
                            <p style={styles.value}>
                                {item.storageLocation || "Not Assigned"}
                            </p>
                        </div>

                        <div style={styles.infoGroup}>
                            <label style={styles.label}>System ID</label>
                            <code style={styles.codeValue}>{item._id}</code>
                        </div>
                        
                        <div style={styles.timestampContainer}>
                            <small>Created: {new Date(item.createdAt).toLocaleDateString()}</small>
                            <br/>
                            <small>Last Updated: {new Date(item.updatedAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Internal CSS Styles ---
const styles = {
    pageContainer: {
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#333",
    },
    loadingContainer: {
        textAlign: "center",
        marginTop: "50px",
        fontSize: "1.2em",
        color: "#666",
    },
    topBar: {
        marginBottom: "20px",
    },
    backButton: {
        background: "none",
        border: "none",
        color: "#1976d2",
        cursor: "pointer",
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        padding: 0,
    },
    card: {
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        padding: "30px",
        border: "1px solid #eaeaea",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "20px",
    },
    title: {
        margin: "0 0 10px 0",
        fontSize: "2rem",
        color: "#1a1a1a",
    },
    skuBadge: {
        display: "inline-block",
        background: "#f3f4f6",
        color: "#555",
        padding: "4px 10px",
        borderRadius: "4px",
        fontSize: "0.9rem",
        fontWeight: "600",
        fontFamily: "monospace",
        border: "1px solid #e5e7eb",
    },
    divider: {
        border: "0",
        borderTop: "1px solid #eee",
        margin: "25px 0",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1.5fr", 
        gap: "40px",
    },
    infoColumn: {
        display: "flex",
        flexDirection: "column",
        gap: "25px",
    },
    infoGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        textTransform: "uppercase",
        fontSize: "0.75rem",
        fontWeight: "bold",
        color: "#888",
        letterSpacing: "0.5px",
    },
    statusBox: {
        padding: "15px",
        borderRadius: "6px",
        border: "1px solid",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    bigQty: {
        fontSize: "2.5rem",
        fontWeight: "bold",
        lineHeight: "1",
    },
    statusLabel: {
        marginTop: "5px",
        fontWeight: "600",
    },
    warehouseBox: {
        background: "#f9fafb",
        padding: "15px",
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
    },
    description: {
        lineHeight: "1.6",
        color: "#444",
        fontSize: "1rem",
        margin: 0,
    },
    value: {
        fontSize: "1rem",
        fontWeight: "500",
        margin: 0,
    },
    codeValue: {
        background: "#f4f4f4",
        padding: "4px 8px",
        borderRadius: "4px",
        fontFamily: "monospace",
        color: "#666",
        width: "fit-content",
    },
    timestampContainer: {
        marginTop: "auto",
        paddingTop: "20px",
        borderTop: "1px solid #eee",
        color: "#999",
        fontSize: "0.85rem",
    }
};