import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

// STEP 1: Delete Confirmation Modal Component
function DeleteConfirmationModal({ warehouseName, onCancel, onConfirm }) {
    const [input, setInput] = useState("");

    return (
        <div style={modalStyle}>
            <div style={modalContent}>
                <h3>Confirm Delete</h3>
                <p>
                    Type <strong>{warehouseName}</strong> to confirm deletion.
                </p>

                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type warehouse name"
                    style={{ width: "100%", padding: "8px", marginTop: "10px" }}
                    />

                <div style={{ marginTop: "15px"}}>
                    <button onClick={onCancel}>Cancel</button>

                    <button 
                        onClick={() => onConfirm(input)}
                        style={{
                            marginLeft: "10px",
                            background: "red",
                            color: "white",
                            padding: "8px 12px",
                        }}
                        >
                            Delete
                        </button>
                </div>
            </div>
        </div>
    );
}

// Simple style for modal
const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
};

const modalContent = {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "350px",
};

// Warehouse details + Edit + Delete

export default function WarehouseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal visibility state
    const  [showDeleteModal, setShowDeleteModal] = useState(false);

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

    // Delete Logic AFTER modal confirmation
    async function handleDelete(inputName) {
        if (inputName !== warehouse.name) {
            toast.error("Name does not match. Warehouse not delected.");
            return;
        }

        try {
            await axiosClient.delete(`/warehouses/${id}`);
            toast.success("Warehouse deleted successfully.");
            navigate("/warehouses");
        } catch (error) {
            console.error("Error deleting warehouse:", error);
            toast.error("Failed to delete warehouse.");
        }
    }

    function openDeleteToast() {
        toast((t) => (
            <div>
                <strong>Delete Warehouse?</strong>
                <p>This action cannot be undone.</p>

                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        setShowDeleteModal(true);
                    }}
                    style={{ marginRight: "10px"}}
                    >
                        Continue
                    </button>

                    <button onClick={() => toast.dismiss(t.id)}>Cancel</button>
            </div>
        ));
    }

    if (loading) return <h2>Loading warehouse...</h2>;
    if (!warehouse) return <h2>Warehouse not found.</h2>;

    return (
        <div>
            <h1>Warehouse Details</h1>

            {/* View Mode */}

            
            <p><strong>Name</strong> {warehouse.name}</p>
            <p><strong>Location:</strong> {warehouse.location}</p>
            <p><strong>Max Capacity:</strong> {warehouse.maxCapacity}</p>
            <p><strong>Current Capacity:</strong> {warehouse.currentCapacity}</p>
            <p><strong>Created:</strong> {warehouse.createdAt?.slice(0,10)}</p>
            <p><strong>ID:</strong> {warehouse._id}</p>

            <br />

            <button 
                onClick={() => navigate(`/warehouses/${id}/edit`)}
                style={{ marginRight :"10px"}}
                >
                    Edit Warehouse
                </button>

            <button 
                    type="button"
                    onClick={() => navigate("/warehouses")}
                    style={{ marginLeft: "10px", marginRight: "20px"}}
                    >
                        Cancel
                    </button>

                <button
                    onClick={openDeleteToast}
                    style={{ background: "red", color: "white"}}
                    >
                        Delete Warehouse
                    </button>

                

                    {/* Showing confirmation modal only when needed */}
                    {showDeleteModal && (
                        <DeleteConfirmationModal
                            warehouseName={warehouse.name}
                            onCancel = {() => setShowDeleteModal(false)}
                            onConfirm={(input) => {
                                setShowDeleteModal(false);
                                handleDelete(input);
                            }}
                        />
                    )}
            </div>
    );
}