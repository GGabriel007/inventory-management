import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

export default function WarehousePage() {
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        axiosClient.get("/warehouses")
            .then(res => setWarehouses(res.data))
            .catch(err => console.error(err));
    },  []);

    return (
        <div>
            <h1>Warehouses</h1>

            {warehouses.map(w => (
            <Link
                key={w._id} // or w.id if _id doesn't exist
                to={`/warehouses/${w._id}`}
                style={{ textDecoration: "none" }}
            >
                <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                <h3>{w.name}</h3>
                <p><b>Location:</b> {w.location}</p>
                <p><b>Capacity:</b> {w.currentCapacity} / {w.maxCapacity}</p>
                </div>
            </Link>
            ))}
        </div>
    );
}