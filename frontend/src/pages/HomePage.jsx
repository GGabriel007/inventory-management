// /pages/HomePage.jsx
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    return(
        <div style={styles.pageContainer}>
            
            {/* 1. Hero Section */}
            <div style={styles.heroSection}>
                <h1 style={styles.heroTitle}>Inventory Management System</h1>
                <p style={styles.heroSubtitle}>
                    Streamline logistics, track stock levels in real time, and manage multiple warehouses from one central application.
                </p>
            </div>

            {/* 2. Main Navigation Cards */}
            <div style={styles.cardGrid}>
                
                {/* Warehouse Card */}
                <div style={styles.card} onClick={() => navigate("/warehouses")}>
                    <div style={styles.iconContainer}>W</div>
                    <h2 style={styles.cardTitle}>Manage Warehouses</h2>
                    <p style={styles.cardDesc}>
                        View capacity, create new locations, and monitor storage limits.
                    </p>
                    <button style={styles.cardButton}>Go to Warehouses</button>
                </div>

                {/* Inventory Card */}
                <div style={styles.card} onClick={() => navigate("/inventory")}>
                    <div style={styles.iconContainer}>I</div>
                    <h2 style={styles.cardTitle}>Track Inventory</h2>
                    <p style={styles.cardDesc}>
                        Search items, manage stock quantities, and transfer products between locations.
                    </p>
                    <button style={styles.cardButton}>View Inventory</button>
                </div>

            </div>

            {/* 3. Feature Highlights (Visual Filler) */}
            <div style={styles.featuresSection}>
                <div style={styles.featureItem}>
                    <span style={styles.check}></span> Real time Capacity Tracking
                </div>
                <div style={styles.featureItem}>
                    <span style={styles.check}></span> Low Stock Alerts
                </div>
                <div style={styles.featureItem}>
                    <span style={styles.check}></span> Warehouse Transfers
                </div>
            </div>

        </div>
    );
}

// --- Professional Styles ---
const styles = {
    pageContainer: {
        minHeight: "85vh", 
        background: "linear-gradient(to bottom, #f0f4f8, #ffffff)", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 20px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#333",
    },
    
    // Hero
    heroSection: {
        textAlign: "center",
        marginBottom: "50px",
        maxWidth: "700px",
    },
    heroTitle: {
        fontSize: "3rem",
        color: "#1a1a1a",
        marginBottom: "15px",
        fontWeight: "800",
        letterSpacing: "-0.5px",
    },
    heroSubtitle: {
        fontSize: "1.2rem",
        color: "#6b7280",
        lineHeight: "1.6",
    },

    // Grid
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
        width: "100%",
        maxWidth: "900px",
        marginBottom: "60px",
    },
    
    // Cards
    card: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "40px 30px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        textAlign: "center",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        border: "1px solid #eaeaea",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ':hover': {
            transform: "translateY(-5px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }
    },
    iconContainer: {
        fontSize: "3rem",
        marginBottom: "20px",
        backgroundColor: "#f0f9ff",
        width: "80px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
    },
    cardTitle: {
        fontSize: "1.5rem",
        color: "#1f2937",
        marginBottom: "10px",
        fontWeight: "700",
    },
    cardDesc: {
        color: "#6b7280",
        fontSize: "1rem",
        marginBottom: "25px",
        lineHeight: "1.5",
    },
    cardButton: {
        padding: "10px 20px",
        backgroundColor: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
        marginTop: "auto", 
    },

    // Features Footer
    featuresSection: {
        display: "flex",
        gap: "40px",
        flexWrap: "wrap",
        justifyContent: "center",
        paddingTop: "40px",
        borderTop: "1px solid #eaeaea",
        width: "100%",
        maxWidth: "800px",
    },
    featureItem: {
        fontSize: "1rem",
        color: "#555",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    check: {
        color: "#059669", 
        fontWeight: "bold",
        fontSize: "1.2rem",
    }
};