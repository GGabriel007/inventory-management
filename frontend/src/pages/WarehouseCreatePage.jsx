// /pages/WarehouseCreatePage.jsx
import { useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import Select from "react-select";
import { State, City } from "country-state-city";
import { useNavigate } from "react-router-dom";

/**
 * WarehouseCreatePage.jsx
 * * Form interface for creating new Warehouse entities.
 * * Features:
 *  Dynamic Location Selection: Uses 'country-state-city' to provide cascading State -> City dropdowns.
 *  Input Validation: Ensures all fields are filled and capacity is valid before submission.
 *  API Integration: Sends payload to backend and redirects to the new warehouse's detail view.
 */

function WarehouseCreatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [maxCapacity, setMaxCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert library state list to react-select format
  const stateOptions = State.getStatesOfCountry("US").map((s) => ({
    value: s.isoCode,
    label: s.name,
  }));

  // Dynamically provide cities for chosen state
  const cityOptions = state?.value
    ? City.getCitiesOfState("US", state.value).map((c) => ({
        value: c.name,
        label: c.name,
      }))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state || !city) {
      toast.error("Please select both state and city.");
      return;
    }

    setLoading(true); // Start loading

    const location = `${city.label}, ${state.label}`;

    try {
      const response = await axiosClient.post("/warehouses", {
        name,
        location,
        maxCapacity: parseInt(maxCapacity),
      });

      toast.success("Warehouse created successfully!");

      const warehouseId = response.data.id || response.data._id;
      navigate(`/warehouses/${warehouseId}`);

      // Clear form
      setName("");
      setState(null);
      setCity(null);
      setMaxCapacity("");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Error creating warehouse.";
      toast.error(msg);
    } finally {
        setLoading(false); // Stop loading
    }
  };

  // Custom styles to make react-select match standard inputs
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: '5px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#1976d2' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #1976d2' : 'none',
      backgroundColor: '#f9fafb',
      '&:hover': {
        borderColor: '#1976d2'
      }
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#9ca3af',
        fontSize: '16px'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#1f2937',
        fontSize: '16px'
    })
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.card}>
        
        {/* Header */}
        <div style={styles.header}>
            <h1 style={styles.title}>Create New Warehouse</h1>
            <p style={styles.subtitle}>Set up a new location to store inventory.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Warehouse Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Warehouse Name <span style={styles.required}>*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Distribution Center"
              required
              style={styles.input}
            />
          </div>

          {/* Location Grid (State & City side-by-side) */}
          <div style={styles.gridRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>State <span style={styles.required}>*</span></label>
                <Select
                  options={stateOptions}
                  value={state}
                  onChange={(selected) => {
                    setState(selected);
                    setCity(null);
                  }}
                  placeholder="Select State..."
                  styles={customSelectStyles}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>City <span style={styles.required}>*</span></label>
                <Select
                  options={cityOptions}
                  value={city}
                  onChange={(selected) => setCity(selected)}
                  placeholder={state ? "Select City..." : "Select State first..."}
                  isDisabled={!state}
                  styles={customSelectStyles}
                />
              </div>
          </div>

          {/* Max Capacity */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Max Capacity (Units) <span style={styles.required}>*</span></label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              placeholder="e.g. 10000"
              required
              min="1"
              style={styles.input}
            />
            <small style={styles.helperText}>The maximum number of items this facility can hold.</small>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <button 
                type="button"
                onClick={() => navigate("/warehouses")}
                style={styles.cancelButton}
                disabled={loading}
            >
                Cancel
            </button>
            <button 
                type="submit" 
                style={loading ? styles.buttonDisabled : styles.button}
                disabled={loading}
            >
                {loading ? "Creating..." : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Professional Styles ---
const styles = {
    pageBackground: {
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "60px",
        paddingBottom: "60px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
    header: {
        textAlign: "center",
        marginBottom: "30px",
    },
    title: {
        fontSize: "28px",
        color: "#1a1a1a",
        margin: "0 0 10px 0",
        fontWeight: "700",
    },
    subtitle: {
        color: "#6b7280",
        fontSize: "16px",
        margin: 0,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flex: 1,
    },
    gridRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        letterSpacing: "0.3px",
    },
    required: {
        color: "#d9534f",
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
    helperText: {
        fontSize: "12px",
        color: "#6b7280",
        marginTop: "4px",
    },
    buttonGroup: {
        display: "flex",
        gap: "15px",
        marginTop: "10px",
    },
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

export default WarehouseCreatePage;