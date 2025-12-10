// /pages/InventoryPage.jsx
// List inventory items across all warehouses

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInventory() {
            try {
                const response = await axiosClient.get("/inventory");
                setInventory(response.data);
            } catch (error) {
                console.error("Error fetching inventory:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchInventory();
    }, []);

    if (loading) return <h2>Loading inventory...</h2>;

    return (
        <div>
            <h1>Inventory List</h1>

            {inventory.length === 0 ? (
                <p>No inventory items found.</p>
            ) : (
                inventory.map((item) => (
                    <div key={item._id} style={{ marginBottom: "20px" }}>
                        <Link to={`/inventory/${item._id}`}>
                            <h3>{item.name}</h3>
                        </Link>

                        <p><strong>Quantity:</strong> {item.quantity}</p>
                        <p><strong>Warehouse:</strong> {item.warehouseName}</p>
                    </div>
                ))
            )}
        </div>
    );
}
