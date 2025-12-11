// Form to edit warehouse

import { useParams, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function WarehouseEditPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        maxCapacity: 0
    });

    const [loading, setLoading] = useState(true);

    // Fetching existing warehouse info
    useEffect(() => {
        async function fetchWarehouse() {
            try{
                const response = await axiosClient.get(`/warehouses/${id}`);
                setFormData({
                    name: response.data.name,
                    location: response.data.location,
                    maxCapacity: response.data.maxCapacity
                });
            } catch (error) {
                console.error("Error loading warehouse:", error);
                toast.error("Failed to load warehouse info.");
            } finally {
                setLoading(false);
            }
        }

        fetchWarehouse();

    }, [id]);

    // Handle input change
    function handleChange(e) {
        const {name, value} = e.target;
        setFormData((prev) => ({ ...prev, [name]: value}));
    }

    // Save changes
    async function handleSave() {
        try {
            await axiosClient.put(`/warehouses/${id}`, formData);
            toast.success("Warehouse updated successfully!");
            navigate(`/warehouses/${id}`);
        } catch(error) {
            console.error("Error updating warehouse:", error);
            toast.error("Error updating warehouse.");
        }
    }

    if (loading) return <h2>Loading warehouse...</h2>;

    return (
        <div>
            <h1>Edit Warehouse</h1>

            <label>Name</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                />

                <br/><br/>

                <label>Location:</label>
                <input 
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                />

                <br/><br/>

                <label>Max Capacity</label>
                <input 
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                />

                <br/><br/>

                <button onClick={handleSave}>Save</button>
                <button 
                    onClick={() => navigate(`/warehouses/${id}`)}
                    style={{ marginLeft: "10px"}}
                    >
                        Cancel
                    </button>
        </div>
        );
    }