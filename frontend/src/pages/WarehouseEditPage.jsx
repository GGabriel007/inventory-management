// Form to edit warehouse

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

    const[selectedState, setSelectedState] = useState(null);
    const[selectedCity, setSelectedCity] = useState(null);
    const[cityOptions, setCityOptions] = useState([]);

    const [loading, setLoading] = useState(true);

    // Getting static state options onnce
    const stateOptions = State.getStatesOfCountry("US").map(s => ({
        value: s.isoCode,
        label: s.name
    }))


    // Fetching existing warehouse info
    useEffect(() => {
        async function fetchWarehouse() {
            try{
                const response = await axiosClient.get(`/warehouses/${id}`);
                const data = response.data;
                
                const fullLocation = response.data.location || "";
                const [cityPart, statePart] = fullLocation.includes(",")
                    ? fullLocation.split(",").map(part => part.trim())
                    : ["", ""];

                // Find the state option
                const stateOption = stateOptions.find(s => s.label === statePart) || null;
                setSelectedState(stateOption);

                if (stateOption) {
                    //  Fetch city options based on the state's ISO code
                    const cities = City.getCitiesOfState("US", stateOption.value);
                    const mappedCities = cities.map(c => ({ value: c.name, label: c.name }));
                    setCityOptions(mappedCities);

                    // Find the city option
                    const cityOption = mappedCities.find(c => c.label === cityPart) || null;
                    setSelectedCity(cityOption);
                }

                setFormData({
                    name: response.data.name,
                    location: response.data.location,
                    maxCapacity: response.data.maxCapacity,
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

    // Handle input change
    function handleChange(e) {
        const {name, value} = e.target;
        
        // Input validation for Max Capacity
        if (name === "maxCapacity") {
            const numValue = parseFloat(value);

            // Preventing negative values from being entered
            if (value !== "" && numValue < 0) {
                toast.error("Max capacity cannot be negative");
                return;
            }

            setFormData((prev) => ({ ... prev, [name]: value}));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value}));
    }


    // Handle state selection
    function handleStateChange(selected) {
        setSelectedState(selected);
        setSelectedCity(null); // reset city

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
        // Update location only when city is selected
        setFormData((prev) => ({
            ...prev,
            location: "",
        }));
    }

    function handleCityChange(selected) {
        setSelectedCity(selected);
        if(selected && selectedState) {
            // Update formData.location dynamically when city is selected
            setFormData((prev) => ({
                ...prev,
                location: `${selected.label}, ${selectedState.label}`,
            }));
        }
    }

    // Save update
    async function handleSave() {

        const newMaxCapacity = parseInt(formData.maxCapacity);
        const currentCapacity = formData.currentCapcity;

        if (newMaxCapacity < currentCapacity) {
            toast.error(`The new Max Capacity (${newMaxCapacity}) cannot be less than the Current Capacity (${currentCapacity}).`);
            return;
        }

        try {

            const finalLocation = selectedCity && selectedState
                ? `${selectedCity.label}, ${selectedState.label}`
                : formData.location;

            const dataToUpdate = {
                name: formData.name,
                location: finalLocation,
                maxCapacity: parseInt(formData.maxCapacity)
            }

            await axiosClient.put(`/warehouses/${id}`, dataToUpdate);
            toast.success("Warehouse updated successfully!");

            //  Redirect to the warehouse details page
            navigate(`/warehouses/${id}`);
        } catch (error) {
            console.error("Error updating warehouse:", error);
            toast.error("Erro updating warehouse.");
        }
    }

    if (loading) return <h2>Loading warehouse...</h2>;

    return (
        <div>
            <h1>Edit Warehouse</h1>

            <form onSubmit={(e) => {e.preventDefault(); handleSave();}}>
            <label>Name</label>
            {/* Name Input */}
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                />

                <br/><br/>

                {/* State DROPDOWN */}
                <label>State</label>
                <Select
                    options={stateOptions}
                    value={selectedState}
                    onChange={handleStateChange}
                    placeholder="Select a state"
                    
                    />

                    <br /><br />

                {/* CITY DROPDOWN */}
                <Select
                    value={selectedCity}
                    onChange={handleCityChange}
                    options={cityOptions}
                    placeholder="Select a City"
                    isDisabled={!selectedState}
                />
                <br />

                {/* SHOWING THE FULL LOCATION VALUE */}
                <label>Location:</label>
                <input 
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled
                />

                <br/><br/>

                <label>Max Capacity (Current: {formData.currentCapacity || 0}) </label>
                <input 
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min={formData.currentCapacity || 0}
                />

                <br/><br/>

                <button>Save</button>
                <button 
                    onClick={() => navigate(`/warehouses/${id}`)}
                    style={{ marginLeft: "10px"}}
                    type="button"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        );
    }