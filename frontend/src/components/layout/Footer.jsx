// /components/layout/Footer.jsx
/**
 * Footer.jsx
 * * The main footer component displayed at the bottom of the application.
 * * Contains brand information, navigation links, support resources, and copyright details.
 */

import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                
                {/* Top Section: Grid Layout */}
                <div style={styles.grid}>
                    
                    {/* Column 1: Brand Info */}
                    <div style={styles.column}>
                        <h3 style={styles.brandTitle}>Inventory Management System</h3>
                        <p style={styles.brandDesc}>
                            Inventory Management for logistics and warehousing.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div style={styles.column}>
                        <h4 style={styles.columnHeader}>Navigation</h4>
                        <div style={styles.linkStack}>
                            <Link to="/" style={styles.link}>Dashboard</Link>
                            <Link to="/warehouses" style={styles.link}>Warehouses</Link>
                            <Link to="/inventory" style={styles.link}>Inventory Control</Link>
                        </div>
                    </div>

                    {/* Column 3: Support */}
                    <div style={styles.column}>
                        <h4 style={styles.columnHeader}>Support</h4>
                        <div style={styles.linkStack}>
                            <a 
                                href="https://github.com/GGabriel007/inventory-management" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={styles.textLink}
                            >
                                Documentation
                            </a>
                            <a 
                                href="mailto:gramirez@skillstorm.com" 
                                style={styles.textLink}
                            >
                                Report a Bug
                            </a>
                        </div>
                    </div>

                </div>

                {/* Divider Line */}
                <div style={styles.divider}></div>

                {/* Bottom Section: Copyright */}
                <div style={styles.bottomBar}>
                    <span>By Gabriel Gonzalez from ©{currentYear} SkillStorm </span>
                    <span style={styles.version}>v1.0.0 (Demo)</span>
                </div>

            </div>
        </footer>
    );
}

// --- Styles ---
const styles = {
    footer: {
        backgroundColor: "#1976d2", 
        color: "#ffffffff", 
        padding: "40px 0 20px 0",
        marginTop: "auto",
        fontSize: "0.9rem",
        borderTop: "1px solid #ffffffff",
    },
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "40px",
        marginBottom: "30px",
    },
    column: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    brandTitle: {
        color: "#fff",
        fontSize: "1.2rem",
        fontWeight: "700",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    brandDesc: {
        lineHeight: "1.6",
        color: "#ffffffff",
        margin: 0,
        maxWidth: "300px",
    },
    columnHeader: {
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "600",
        margin: "0 0 5px 0",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    linkStack: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    link: {
        color: "#ffffffff",
        textDecoration: "none",
        transition: "color 0.2s",
        cursor: "pointer",
        width: "fit-content",
        ":hover": { color: "#fff" }
    },
    textLink: {
        cursor: "pointer",
        color: "#ffffffff",
        textDecoration: "none"
        
    },
    statusOnline: {
        color: "#10b981", 
        fontWeight: "bold",
    },
    divider: {
        height: "1px",
        backgroundColor: "#6da5ffff", 
        marginBottom: "20px",
    },
    bottomBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#ffffffff",
        fontSize: "0.85rem",
    },
    version: {
        fontFamily: "monospace",
        backgroundColor: "#769ae8ff",
        padding: "2px 6px",
        borderRadius: "4px",
    }
};