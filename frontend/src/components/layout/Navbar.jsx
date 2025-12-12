// /components/layout/Navbar.jsx

/**
 * Navbar.jsx
 * * The main navigation bar component.
 * * Handles routing between Dashboard, Warehouses, and Inventory pages.
 * * Includes logic to highlight the active link based on the current URL path.
 */


import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
    const location = useLocation();

    // Helper to style links based on whether they are active
    const getLinkStyle = (path) => {
        // Exact match for home, partial match for other sections
        const isActive = path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(path);

        return isActive ? styles.linkActive : styles.link;
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                
                {/* BRAND / LOGO */}
                <Link to="/" style={styles.brand}>
                    <span style={styles.icon}>SkillStorm</span> 
                     <span style={styles.brandSubtitle}>Inventory Management System</span>
                </Link>

                {/* NAVIGATION LINKS */}
                <div style={styles.navLinks}>
                    <Link to="/" style={getLinkStyle("/")}>
                        Dashboard
                    </Link>
                    <Link to="/warehouses" style={getLinkStyle("/warehouses")}>
                        Warehouses
                    </Link>
                    <Link to="/inventory" style={getLinkStyle("/inventory")}>
                        Inventory
                    </Link>
                </div>

            </div>
        </nav>
    );
}

// --- Styles ---
const styles = {
    navbar: {
        backgroundColor: "#1976d2", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
    },
    container: {
        maxWidth: "1200px", 
        margin: "0 auto",
        padding: "0 20px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    brand: {
        color: "white",
        textDecoration: "none",
        fontSize: "1.25rem",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    brandSubtitle: {
        fontWeight: "300",
        opacity: 0.8,
        fontSize: "1rem",
        marginLeft: "2px",
    },
    icon: {
        fontSize: "1.5rem",
    },
    navLinks: {
        display: "flex",
        gap: "30px",
    },
    
    link: {
        color: "rgba(255, 255, 255, 0.75)", 
        textDecoration: "none",
        fontSize: "0.95rem",
        fontWeight: "500",
        transition: "color 0.2s, opacity 0.2s",
        padding: "5px 0",
        borderBottom: "2px solid transparent",
    },
    
    linkActive: {
        color: "white",
        textDecoration: "none",
        fontSize: "0.95rem",
        fontWeight: "600",
        padding: "5px 0",
        borderBottom: "2px solid white",
    },
};