import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav style={{ 
            background: "#57cfedff",
            padding: "10px",
            color: "#fff",
            display: "flex",
            gap: "20px" 
            }}>
            <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
            <Link to="/warehouses" style={{ color: "#fff", textDecoration: "none" }}>Warehouses</Link>
            <Link to="/inventory" style={{ color: "#fff", textDecoration: "none" }}>Inventory</Link>
            <Link to="/about" style={{ color: "#fff", textDecoration: "none" }}>About</Link>
        </nav>
    );
}
