import { useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import Select from "react-select";
import { State, City } from "country-state-city";
import { useNavigate } from "react-router-dom";

function WarehouseCreatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [maxCapacity, setMaxCapacity] = useState("");

  // Convert library state list to react-select format
  const stateOptions = State.getStatesOfCountry("US").map((s) => ({
    value: s.isoCode,
    label: s.name,
  }));

  // Dynamically provide cities for chosen state
  const cityOptions =
    state?.value
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

    const location = `${city.label}, ${state.label}`;

    try {
      const response = await axiosClient.post("/warehouses", {
        name,
        location,
        maxCapacity: parseInt(maxCapacity),
      });

      toast.success("Warehouse created successfully!");

    //    Extract the new warehouse ID
    const warehouseId = response.data.id || response.data._id;

    // Redirect to detail page
    navigate(`/warehouses/${warehouseId}`);

      // Clear form
      setName("");
      setState(null);
      setCity(null);
      setMaxCapacity("");
    } catch (error) {
      console.error(error);
      toast.error("Error creating warehouse.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Warehouse</h2>

      <form onSubmit={handleSubmit}>
        {/* NAME */}
        <label>Warehouse Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Choose a name for the Warehouse"
          required
        />

        {/* STATE */}
        <label>Select State:</label>
        <Select
          options={stateOptions}
          value={state}
          onChange={(selected) => {
            setState(selected);
            setCity(null); // Reset city when state changes
          }}
          placeholder="Choose a state..."
        />

        {/* CITY */}
        <label>Select City:</label>
        <Select
          options={cityOptions}
          value={city}
          onChange={(selected) => setCity(selected)}
          placeholder={
            state ? "Choose a city..." : "Select a state first..."
          }
          isDisabled={!state}
        />

        {/* MAX CAPACITY */}
        <label>Max Capacity:</label>
        <input
          type="number"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          placeholder="Choose the max capacity..."
          required
        />

        <br />
        <br />

        <button type="submit">Create Warehouse</button>
      </form>
    </div>
  );
}

export default WarehouseCreatePage;
