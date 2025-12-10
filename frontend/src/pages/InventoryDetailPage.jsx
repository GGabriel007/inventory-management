// /pages/InventoryDetailPage.js
// Item details + Edit + Delete

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function InventoryDetailPage() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchItem() {
            try {
                const response = await axiosClient.get(`/inventory/${id}`);
                setItem(response.data);
            } catch (error) {
                console.error("Error fetching inventory item:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchItem();
    }, [id]);

    if (loading) return <h2>Loading inventory item...</h2>;
    if (!item) return <h2>Inventory item not found.</h2>;

    return (
        <div>
            <h1>Inventory Item Details</h1>

            <h2>{item.name}</h2>

            <p> this is the sku {item.sku}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Warehouse:</strong> {item.warehouseName}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>ID:</strong> {item.id}</p>
        </div>
    );
}
