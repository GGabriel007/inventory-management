import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

// Warehouse details + Edit + Delete

export default function WarehouseDetailPage() {
    const { id } = useParams();
    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWarehouse() {
            try {
                const response = await axiosClient.get(`/warehouses/${id}`);
                setWarehouse(response.data);
            } catch (error) {
                console.error("Error fetching warehouse:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWarehouse();
    }, [id]);

    if (loading) return <h2>Loading warehouse...</h2>;
    if (!warehouse) return <h2>Warehouse not found.</h2>;

    return (
        <div>
            <h1>Warehouse Details</h1>

            <h2>{warehouse.name}</h2>
            <p><strong>Location:</strong> {warehouse.location}</p>
            <p><strong>Capacity:</strong> {warehouse.capacity}</p>
            <p><strong>ID:</strong> {warehouse.id}</p>
        </div>
    );
}