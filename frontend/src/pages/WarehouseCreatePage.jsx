// WarehouseCreatePage.jsx
// Form to create new warehouse

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function WarehouseCreatePage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        maxCapacity: "",
    });

    const [error, setError] = useState("");

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }



    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            await axiosClient.post("/warehouses", {
                name: formData.name,
                location: formData.location,
                maxCapacity: Number(formData.maxCapacity),
            });

            // Redirect user back to warehouses page
            navigate("/warehouses");
        
        } catch (err){
            setError("Error creating warehouse. Please try again.");
            console.error(err);
        }
    }

    return (
        <div style={{ maxWidth: "600px", margin:"0 auto"}}>
            <h1>Create New Warehouses</h1>

            {error && <p style={{ color: "red"}}>error</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px"}}>
                    <label>Name:</label><br />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange = {handleChange}
                        required
                        />
                </div>

                <div style={{ marginBottom: "15px"}}>
                    <label>Location</label> <br />
                    <input 
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        />
                </div>

                <div style={{ marginBottom: "15px"}}>
                    <label>Max Capacity:</label><br/>

                    <input
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    required
                    min="1"
                     />
                </div>

                <button type="submit">Create Warehouse</button>
                <button 
                    type="button"
                    onClick={() => navigate("/warehouses")}
                    style={{ marginLeft: "10px"}}
                    >
                        Cancel
                    </button>
            </form>
        </div>
    );
}