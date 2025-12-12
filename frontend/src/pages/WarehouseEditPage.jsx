// /pages/WarehouseEditPage.jsx
import { useParams, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import Select from "react-select";
import { State, City } from "country-state-city";

export default function WarehouseEditPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        maxCapacity: 0,
        currentCapacity: 0
    });

    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [cityOptions, setCityOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Static state options
    const stateOptions = State.getStatesOfCountry("US").map(s => ({
        value: s.isoCode,
        label: s.name
    }));

    // Fetch existing warehouse info
    useEffect(() => {
        async function fetchWarehouse() {
            try{
                const response = await axiosClient.get(`/warehouses/${id}`);
                const data = response.data;
                
                const fullLocation = data.location || "";
                const [cityPart, statePart] = fullLocation.includes(",")
                    ? fullLocation.split(",").map(part => part.trim())
                    : ["", ""];

                // Pre-fill Select components
                const stateOption = stateOptions.find(s => s.label === statePart) || null;
                setSelectedState(stateOption);

                if (stateOption) {
                    const cities = City.getCitiesOfState("US", stateOption.value);
                    const mappedCities = cities.map(c => ({ value: c.name, label: c.name }));
                    setCityOptions(mappedCities);

                    const cityOption = mappedCities.find(c => c.label === cityPart) || null;
                    setSelectedCity(cityOption);
                }

                setFormData({
                    name: data.name,
                    location: data.location,
                    maxCapacity: data.maxCapacity,
                    currentCapacity: data.currentCapacity || 0
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

    // Handle standard inputs
    function handleChange(e) {
        const {name, value} = e.target;
        if (name === "maxCapacity") {
            // No negative values allowed in state
            if (value < 0) return; 
        }
        setFormData((prev) => ({ ...prev, [name]: value}));
    }

    // Handle State selection
    function handleStateChange(selected) {
        setSelectedState(selected);
        setSelectedCity(null); // Reset city

        if(selected) {
            const cities = City.getCitiesOfState("US", selected.value);
            const mappedCities = cities.map((c) => ({
                value: c.name,
                label: c.name,
            }));
            setCityOptions(mappedCities);
        } else {
            setCityOptions([]);
        }
        // Clear location string until city is selected
        setFormData((prev) => ({ ...prev, location: "" }));
    }

    // Handle City selection
    function handleCityChange(selected) {
        setSelectedCity(selected);
        if(selected && selectedState) {
            setFormData((prev) => ({
                ...prev,
                location: `${selected.label}, ${selectedState.label}`,
            }));
        }
    }

    // Save Update
    async function handleSave(e) {
        e.preventDefault();
        
        const newMaxCapacity = parseInt(formData.maxCapacity);
        const currentUsage = formData.currentCapacity;

        if (newMaxCapacity < currentUsage) {
            toast.error(`Capacity too low! Current usage is ${currentUsage}.`);
            return;
        }

        if (!selectedCity || !selectedState) {
            toast.error("Please select a valid location.");
            return;
        }

        setSaving(true);

        try {
            const finalLocation = `${selectedCity.label}, ${selectedState.label}`;
            
            const dataToUpdate = {
                name: formData.name,
                location: finalLocation,
                maxCapacity: newMaxCapacity
            };

            await axiosClient.put(`/warehouses/${id}`, dataToUpdate);
            toast.success("Warehouse updated successfully!");
            navigate(`/warehouses/${id}`);
        } catch (error) {
            console.error("Error updating warehouse:", error);
            const msg = error.response?.data?.message || "Error updating warehouse.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    }

    // Select Styles (to match input fields)
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            padding: '5px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#1976d2' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #1976d2' : 'none',
            backgroundColor: '#f9fafb',
            '&:hover': { borderColor: '#1976d2' }
        }),
    };

    if (loading) return <div style={styles.loading}>Loading warehouse details...</div>;

    return (
        <div style={styles.pageBackground}>
            <div style={styles.card}>
                
                <div style={styles.header}>
                    <h1 style={styles.title}>Edit Warehouse</h1>
                    <p style={styles.subtitle}>Update details for <strong>{formData.name}</strong></p>
                </div>

                <form onSubmit={handleSave} style={styles.form}>
                    
                    {/* Name */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Warehouse Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* Location Grid */}
                    <div style={styles.gridRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>State</label>
                            <Select
                                options={stateOptions}
                                value={selectedState}
                                onChange={handleStateChange}
                                placeholder="Select State..."
                                styles={customSelectStyles}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>City</label>
                            <Select
                                value={selectedCity}
                                onChange={handleCityChange}
                                options={cityOptions}
                                placeholder={selectedState ? "Select City..." : "Select State first..."}
                                isDisabled={!selectedState}
                                styles={customSelectStyles}
                            />
                        </div>
                    </div>

                    {/* Read-Only Location String */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Formatted Location (Auto-generated)</label>
                        <input 
                            type="text"
                            value={formData.location}
                            readOnly
                            disabled
                            style={styles.inputDisabled}
                        />
                    </div>

                    {/* Capacity Section */}
                    <div style={styles.capacitySection}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Max Capacity 
                                <span style={styles.infoBadge}>Current Usage: {formData.currentCapacity}</span>
                            </label>
                            <input 
                                type="number"
                                name="maxCapacity"
                                value={formData.maxCapacity}
                                onChange={handleChange}
                                min={formData.currentCapacity}
                                style={styles.input}
                                required
                            />
                            <small style={styles.helperText}>
                                Cannot be lower than the current inventory usage ({formData.currentCapacity}).
                            </small>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={styles.buttonGroup}>
                        <button 
                            type="button"
                            onClick={() => navigate(`/warehouses/${id}`)}
                            style={styles.cancelButton}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={saving ? styles.buttonDisabled : styles.button}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- STYLES ---
const styles = {
    pageBackground: {
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "60px",
        paddingBottom: "60px",
        fontFamily: "'Segoe UI', sans-serif",
    },
    card: {
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: "600px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: "40px",
        border: "1px solid #eaeaea",
    },
    header: { textAlign: "center", marginBottom: "30px" },
    title: { fontSize: "28px", color: "#1a1a1a", margin: "0 0 10px 0", fontWeight: "700" },
    subtitle: { color: "#666", fontSize: "16px", margin: 0 },
    loading: { textAlign: "center", padding: "50px", fontSize: "1.2rem", color: "#666" },
    
    form: { display: "flex", flexDirection: "column", gap: "24px" },
    formGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
    gridRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        letterSpacing: "0.3px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    input: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "16px",
        outline: "none",
        transition: "all 0.2s",
        backgroundColor: "#f9fafb",
    },
    inputDisabled: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        fontSize: "16px",
        backgroundColor: "#f3f4f6",
        color: "#6b7280",
        cursor: "not-allowed"
    },
    
    capacitySection: {
        backgroundColor: "#f0f9ff",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #bae6fd",
    },
    infoBadge: {
        fontSize: "12px",
        backgroundColor: "#e0f2fe",
        color: "#0284c7",
        padding: "2px 8px",
        borderRadius: "12px",
        fontWeight: "600",
    },
    helperText: {
        fontSize: "13px",
        color: "#64748b",
        marginTop: "4px",
    },

    buttonGroup: { display: "flex", gap: "15px", marginTop: "10px" },
    button: {
        flex: 1,
        padding: "14px",
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "background 0.2s",
        boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
    },
    buttonDisabled: {
        flex: 1,
        padding: "14px",
        background: "#90caf9",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "not-allowed",
        fontWeight: "600",
        fontSize: "16px",
    },
    cancelButton: {
        flex: 1,
        padding: "14px",
        background: "#fff", 
        color: "#555",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "background 0.2s",
    },
};