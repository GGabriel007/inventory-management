// /pages/WarehouseDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

// --- COMPONENT: Professional Delete Modal ---
function DeleteConfirmationModal({ warehouseName, onCancel, onConfirm }) {
    const [input, setInput] = useState("");

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.container}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>⚠️ Delete Warehouse</h3>
                </div>
                
                <div style={modalStyles.body}>
                    <p style={modalStyles.text}>
                        This action is <strong>irreversible</strong>.
                    </p>
                    <p style={modalStyles.instruction}>
                        Type <strong>{warehouseName}</strong> below to confirm.
                    </p>
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={warehouseName}
                        style={modalStyles.input}
                        autoFocus
                    />
                </div>

                <div style={modalStyles.footer}>
                    <button onClick={onCancel} style={modalStyles.btnCancel}>Cancel</button>
                    <button 
                        onClick={() => onConfirm(input)}
                        disabled={input !== warehouseName}
                        style={input === warehouseName ? modalStyles.btnDelete : modalStyles.btnDeleteDisabled}
                    >
                        Permanently Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function WarehouseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        async function fetchWarehouse() {
            try {
                const response = await axiosClient.get(`/warehouses/${id}`);
                setWarehouse(response.data);
            } catch (error) {
                console.error("Error fetching warehouse:", error);
                toast.error("Could not load warehouse data.");
            } finally {
                setLoading(false);
            }
        }
        fetchWarehouse();
    }, [id]);

    // 1. Initial Check: User clicks "Delete" button
    const handleInitialDeleteClick = () => {
        // 🚨 VALIDATION: Check if warehouse is empty
        if (warehouse.currentCapacity > 0) {
            toast.error(
                `Cannot delete warehouse! It contains ${warehouse.currentCapacity} items. Please transfer or remove them first.`,
                { duration: 5000, icon: '🚫' }
            );
            return;
        }

        // If empty, proceed to show confirmation toast
        openDeleteToast();
    };

    // 2. Final Action: Executed after modal confirmation
    const handleDelete = async (inputName) => {
        if (inputName !== warehouse.name) {
            toast.error("Name mismatch. Deletion cancelled.");
            return;
        }
        try {
            await axiosClient.delete(`/warehouses/${id}`);
            toast.success("Warehouse deleted successfully.");
            navigate("/warehouses");
        } catch (error) {
            console.error("Error deleting warehouse:", error);
            const msg = error.response?.data?.message || "Failed to delete warehouse.";
            toast.error(msg);
        }
    };

    const openDeleteToast = () => {
        toast((t) => (
            <div style={{minWidth: '250px'}}>
                <strong>Delete {warehouse.name}?</strong>
                <p style={{margin: '5px 0 10px 0', fontSize: '0.9rem', color: '#666'}}>
                    Are you sure you want to proceed?
                </p>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <button onClick={() => toast.dismiss(t.id)} style={styles.toastBtnCancel}>
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            setShowDeleteModal(true);
                        }}
                        style={styles.toastBtnConfirm}
                    >
                        Continue
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    // Helper: Calculate progress bar color
    const getCapacityColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage >= 90) return "#d9534f"; // Red (Critical)
        if (percentage >= 75) return "#f0ad4e"; // Yellow (Warning)
        return "#5cb85c"; // Green (Good)
    };

    if (loading) return <div style={styles.loading}>Loading warehouse details...</div>;
    if (!warehouse) return <div style={styles.loading}>Warehouse not found.</div>;

    const capacityPercentage = Math.min((warehouse.currentCapacity / warehouse.maxCapacity) * 100, 100);
    const progressBarColor = getCapacityColor(warehouse.currentCapacity, warehouse.maxCapacity);

    return (
        <div style={styles.pageContainer}>
            {/* 1. Navigation */}
            <div style={styles.topBar}>
                <button style={styles.backButton} onClick={() => navigate("/warehouses")}>
                     Back to Warehouses
                </button>
            </div>

            {/* 2. Main Card */}
            <div style={styles.card}>
                
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>{warehouse.name}</h1>
                        <div style={styles.locationBadge}>
                         {warehouse.location}
                        </div>
                    </div>
                    <div style={styles.headerActions}>
                         <button 
                            onClick={() => navigate(`/warehouses/${id}/edit`)}
                            style={styles.btnEdit}
                        >
                         Edit Details
                        </button>
                    </div>
                </div>

                <hr style={styles.divider} />

                {/* Body Content */}
                <div style={styles.gridContainer}>
                    
                    {/* Left Col: Capacity Visuals */}
                    <div style={styles.column}>
                        <h3 style={styles.sectionTitle}>Capacity Utilization</h3>
                        
                        <div style={styles.capacityBox}>
                            <div style={styles.capacityHeader}>
                                <span style={styles.capacityText}>
                                    <strong>{warehouse.currentCapacity}</strong> / {warehouse.maxCapacity} Units
                                </span>
                                <span style={{fontWeight: 'bold', color: progressBarColor}}>
                                    {capacityPercentage.toFixed(1)}% Full
                                </span>
                            </div>
                            
                            {/* Progress Bar Track */}
                            <div style={styles.progressTrack}>
                                {/* Progress Bar Fill */}
                                <div style={{
                                    ...styles.progressFill,
                                    width: `${capacityPercentage}%`,
                                    backgroundColor: progressBarColor
                                }}></div>
                            </div>
                        </div>

                        <div style={styles.metaGroup}>
                            <label style={styles.label}>Inventory Counter</label>
                            <span style={styles.value}>{warehouse.inventoryCounter} Items Tracked</span>
                        </div>
                    </div>

                    {/* Right Col: System Data */}
                    <div style={styles.column}>
                        <h3 style={styles.sectionTitle}>System Information</h3>
                        
                        <div style={styles.metaGroup}>
                            <label style={styles.label}>Warehouse ID</label>
                            <code style={styles.code}>{warehouse._id}</code>
                        </div>

                        <div style={styles.metaGroup}>
                            <label style={styles.label}>Created Date</label>
                            <span style={styles.value}>
                                {new Date(warehouse.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <div style={styles.metaGroup}>
                            <label style={styles.label}>Last Updated</label>
                            <span style={styles.value}>
                                {new Date(warehouse.updatedAt).toLocaleDateString()}
                            </span>
                        </div>

                        <div style={{marginTop: 'auto', paddingTop: '20px'}}>
                            {/* 🚨 UPDATED DELETE BUTTON: Calls the validation function first */}
                            <button onClick={handleInitialDeleteClick} style={styles.btnDeleteLink}>
                             Delete this Warehouse
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Modal Injection */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    warehouseName={warehouse.name}
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}

// --- STYLES ---
const styles = {
    pageContainer: {
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#333",
    },
    loading: {
        textAlign: "center",
        padding: "50px",
        color: "#666",
        fontSize: "1.2rem",
    },
    topBar: { marginBottom: "20px" },
    backButton: {
        background: "none",
        border: "none",
        color: "#1976d2",
        cursor: "pointer",
        fontSize: "1rem",
        padding: 0,
        fontWeight: "500",
    },
    card: {
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: "40px",
        border: "1px solid #eaeaea",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "20px",
    },
    title: {
        margin: "0 0 8px 0",
        fontSize: "2rem",
        color: "#1a1a1a",
    },
    locationBadge: {
        display: "inline-block",
        backgroundColor: "#f3f4f6",
        color: "#4b5563",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "0.9rem",
        fontWeight: "500",
    },
    headerActions: { display: "flex", gap: "10px" },
    btnEdit: {
        padding: "10px 20px",
        backgroundColor: "#f0ad4e",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.9rem",
    },
    divider: {
        border: "0",
        borderTop: "1px solid #eee",
        margin: "0 0 30px 0",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "50px",
    },
    column: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    sectionTitle: {
        fontSize: "1.1rem",
        color: "#1976d2",
        marginBottom: "10px",
        borderBottom: "2px solid #e3f2fd",
        paddingBottom: "5px",
        display: "inline-block",
        width: "fit-content",
    },
    capacityBox: {
        backgroundColor: "#f9fafb",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
    },
    capacityHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px",
        fontSize: "0.95rem",
    },
    progressTrack: {
        height: "12px",
        width: "100%",
        backgroundColor: "#e5e7eb",
        borderRadius: "6px",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        transition: "width 0.5s ease",
    },
    metaGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    label: {
        fontSize: "0.8rem",
        textTransform: "uppercase",
        color: "#888",
        fontWeight: "700",
        letterSpacing: "0.5px",
    },
    value: {
        fontSize: "1rem",
        fontWeight: "500",
    },
    code: {
        fontFamily: "monospace",
        backgroundColor: "#f4f4f4",
        padding: "4px 8px",
        borderRadius: "4px",
        color: "#555",
        width: "fit-content",
    },
    btnDeleteLink: {
        background: "none",
        border: "none",
        color: "#d9534f",
        cursor: "pointer",
        textDecoration: "underline",
        fontSize: "0.9rem",
        padding: 0,
    },
    // Toast Button Styles
    toastBtnCancel: {
        border: '1px solid #ccc',
        background: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    toastBtnConfirm: {
        border: 'none',
        background: '#d9534f',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

// --- MODAL STYLES ---
const modalStyles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    container: {
        backgroundColor: "white",
        width: "100%",
        maxWidth: "450px",
        borderRadius: "12px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        overflow: "hidden",
    },
    header: {
        backgroundColor: "#fee2e2",
        padding: "20px 25px",
        borderBottom: "1px solid #fecaca",
    },
    title: {
        margin: 0,
        color: "#991b1b",
        fontSize: "1.25rem",
    },
    body: {
        padding: "25px",
    },
    text: {
        color: "#4b5563",
        marginBottom: "15px",
        lineHeight: "1.5",
    },
    instruction: {
        marginBottom: "10px",
        color: "#111827",
    },
    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "1rem",
        boxSizing: "border-box",
    },
    footer: {
        padding: "15px 25px",
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
    },
    btnCancel: {
        padding: "8px 16px",
        backgroundColor: "white",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        color: "#374151",
        cursor: "pointer",
        fontWeight: "500",
    },
    btnDelete: {
        padding: "8px 16px",
        backgroundColor: "#dc2626",
        border: "none",
        borderRadius: "6px",
        color: "white",
        cursor: "pointer",
        fontWeight: "600",
    },
    btnDeleteDisabled: {
        padding: "8px 16px",
        backgroundColor: "#fca5a5",
        border: "none",
        borderRadius: "6px",
        color: "white",
        cursor: "not-allowed",
        fontWeight: "600",
    },
};