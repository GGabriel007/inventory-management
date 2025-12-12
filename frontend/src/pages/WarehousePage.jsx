// /pages/WarehousePage.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";

export default function WarehousePage() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axiosClient.get("/warehouses")
            .then(res => {
                setWarehouses(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Helper: Determine color based on how full the warehouse is
    const getProgressBarColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage >= 90) return "#d9534f"; // Red (Critical)
        if (percentage >= 75) return "#f0ad4e"; // Yellow (Warning)
        return "#5cb85c"; // Green (Good)
    };

    if (loading) return <div style={styles.loadingState}>Loading warehouses...</div>;

    return (
        <div style={styles.pageContainer}>
            
            {/* Page Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Warehouses</h1>
                    <p style={styles.subtitle}>Overview of all storage locations and capacity.</p>
                </div>
                <button 
                    style={styles.addButton} 
                    onClick={() => navigate("/warehouses/new")}
                >
                    + Add Warehouse
                </button>
            </div>

            {/* Warehouse Grid */}
            <div style={styles.grid}>
                {warehouses.length === 0 ? (
                    <div style={styles.emptyState}>
                        <h3>No warehouses found</h3>
                        <p>Get started by creating your first storage location.</p>
                    </div>
                ) : (
                    warehouses.map(w => {
                        // Calculate percentage for width, capped at 100%
                        const percentage = Math.min((w.currentCapacity / w.maxCapacity) * 100, 100);
                        const barColor = getProgressBarColor(w.currentCapacity, w.maxCapacity);

                        return (
                            <Link
                                key={w._id || w.id}
                                to={`/warehouses/${w._id || w.id}`}
                                style={styles.cardLink}
                            >
                                <div style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <h3 style={styles.cardTitle}>{w.name}</h3>
                                        <span style={styles.locationBadge}>{w.location}</span>
                                    </div>

                                    <div style={styles.cardBody}>
                                        <div style={styles.capacityLabel}>
                                            <span>Capacity Usage</span>
                                            <span style={{fontWeight: '600', color: barColor}}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={styles.progressTrack}>
                                            <div style={{
                                                ...styles.progressBar,
                                                width: `${percentage}%`,
                                                backgroundColor: barColor
                                            }}></div>
                                        </div>

                                        <div style={styles.statsRow}>
                                            <span><strong>{w.currentCapacity}</strong> Used</span>
                                            <span style={styles.divider}>/</span>
                                            <span><strong>{w.maxCapacity}</strong> Max</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// --- Professional CSS-in-JS ---
const styles = {
    pageContainer: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#333",
    },
    loadingState: {
        textAlign: "center",
        padding: "50px",
        color: "#666",
        fontSize: "1.2rem",
    },
    // Header Section
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
        flexWrap: "wrap",
        gap: "20px",
    },
    title: {
        fontSize: "2.5rem",
        margin: "0 0 5px 0",
        color: "#1a1a1a",
    },
    subtitle: {
        color: "#6b7280",
        margin: 0,
        fontSize: "1.1rem",
    },
    addButton: {
        backgroundColor: "#1976d2",
        color: "white",
        border: "none",
        padding: "12px 24px",
        borderRadius: "8px",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(25, 118, 210, 0.2)",
        transition: "background 0.2s",
    },
    
    // Grid Layout
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "25px",
    },
    emptyState: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "60px",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        border: "1px dashed #d1d5db",
        color: "#6b7280",
    },

    // Card Styles
    cardLink: {
        textDecoration: "none",
        color: "inherit",
        display: "block",
    },
    card: {
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        ":hover": { // Note: Inline styles don't support pseudo-classes directly like CSS, but this is conceptual
            transform: "translateY(-4px)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }
    },
    cardHeader: {
        padding: "20px",
        borderBottom: "1px solid #f3f4f6",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        backgroundColor: "#fff",
    },
    cardTitle: {
        margin: 0,
        fontSize: "1.25rem",
        color: "#111827",
    },
    locationBadge: {
        fontSize: "0.85rem",
        color: "#6b7280",
        backgroundColor: "#f3f4f6",
        padding: "4px 8px",
        borderRadius: "6px",
        whiteSpace: "nowrap",
        marginLeft: "10px",
    },
    cardBody: {
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    
    // Capacity Visuals
    capacityLabel: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.9rem",
        color: "#4b5563",
        marginBottom: "5px",
    },
    progressTrack: {
        width: "100%",
        height: "10px",
        backgroundColor: "#e5e7eb",
        borderRadius: "5px",
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        transition: "width 0.5s ease",
        borderRadius: "5px",
    },
    statsRow: {
        display: "flex",
        alignItems: "center",
        fontSize: "0.9rem",
        color: "#374151",
        marginTop: "5px",
    },
    divider: {
        margin: "0 8px",
        color: "#9ca3af",
    },
};