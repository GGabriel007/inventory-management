import { Link } from "react-rouoter-dom";

export default function Navbar() {
    return (
        <nav style={{ padding: "10px", background: "#eee"}}>
            <Link to="/">Warehouses</Link> | {" "}
            <Link to="/inventory">Inventory</Link>
        </nav>
    );
}
