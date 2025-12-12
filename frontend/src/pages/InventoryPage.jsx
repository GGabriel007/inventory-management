// /pages/InventoryPage.jsx
// List inventory items across all warehouses

import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import TransferToast from '../components/TransferToast';

export default function InventoryPage() {

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

    const [showLowStock, setShowLowStock] = useState(false);
    
    // State to hold the list of warehouses
    const [warehouses, setWarehouses] = useState([]) 
    
    // State to track which warehouse inventory dropdown is open
    const [openWarehouseId, setOpenWarehouseId] = useState(null);
    
    // State to hold ALL inventory items fetched once on load
    const [allInventoryItems, setAllInventoryItems] = useState([]);
    
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [warehouseResponse, inventoryResponse] = await Promise.all([
                axiosClient.get("/warehouses"),
                axiosClient.get("/inventory")
            ]);

            setWarehouses(warehouseResponse.data);
            setAllInventoryItems(inventoryResponse.data);
            
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load inventory data."); // Add a toast for fetch errors
        } finally {
            setLoading(false);
        }
    };
    
    // Update the useEffect hook to use this new function
    useEffect(() => {
        fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Combined two separate useEffect blocks into one for initialization
    useEffect(() => {
        async function fetchAllData() {
            try {
                // Fetch warehouses and ALL inventory concurrently
                const [warehouseResponse, inventoryResponse] = await Promise.all([
                    axiosClient.get("/warehouses"),
                    axiosClient.get("/inventory")
                ]);

                setWarehouses(warehouseResponse.data);
                setAllInventoryItems(inventoryResponse.data);
                
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Runs only once on mount

    // 🚨 NEW: Toggle selection mode and clear selected items
    const toggleSelectionMode = () => {
        // If we are exiting selection mode, clear any selections
        if (isSelectionMode) {
            setSelectedItems([]);
        }
        setIsSelectionMode(!isSelectionMode);
    };

    // 🚨 NEW: Handle individual item selection
    const handleSelectItem = (itemId) => {
        // Check if the item is already selected
        if (selectedItems.includes(itemId)) {
            // Deselect: remove the ID from the array
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            // Select: add the ID to the array
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleTransferSelected = () => {

    if (selectedItems.length === 0) {
        toast.error("Please select at least one item to transfer.");
        // This prevents the toast.custom call from ever running if nothing is selected.
        return; 
    }
    
    // 1. Get the current warehouse ID (where the items are coming from)
    const sourceWarehouseId = openWarehouseId;
    
    // 2. Identify the selected item objects (for display/backend processing)
    //    We need the full item object for name, quantity, etc.
    const itemsToTransfer = allInventoryItems.filter(item => 
        selectedItems.includes(item._id || item.id) && 
        (item.warehouse._id || item.warehouse.id) === sourceWarehouseId
    );

    if (itemsToTransfer.length === 0) {
         toast.error("No transferable items found in the current view.");
         return;
    }

    // 3. Filter out the source warehouse from the available destinations
    const availableDestinations = warehouses.filter(wh => 
        (wh._id || wh.id) !== sourceWarehouseId
    );
    
    // Check if there are destinations to transfer to
    if (availableDestinations.length === 0) {
        toast.error("No other warehouses available for transfer.");
        return;
    }

    // 4. Show the Interactive Transfer Toast
    // The toast will handle the state for quantities and destination selection
    toast.custom((t) => (
        <TransferToast
            t={t}
            sourceWarehouseId={sourceWarehouseId}
            itemsToTransfer={itemsToTransfer}
            availableDestinations={availableDestinations}
            onTransferSuccess={() => {
                // Logic to update UI after successful transfer (e.g., re-fetch data)
                // 1. Re-fetch all inventory data to update the UI
                fetchAllData();
                
                // 2. Clear bulk selection state
                setIsSelectionMode(false);
                setSelectedItems([]);

                // 3. Optional: Show a brief success toast after the bulk transfer process is complete
                // Note: You might want to let the TransferToast component handle the final success message itself.
                // For now, let's keep the simple success message here:
                toast.success('Transfer successful, inventory updated!');
            }}
            onDismiss={() => {
                toast.dismiss(t.id);
            }}
        />
    ), { 
        duration: Infinity, // Keep toast open until dismissed or completed
        position: 'top-center'
    });

};


    // Toggleing dropdown for a warehouse
    async function toggleWarehouse(id) {
        if (openWarehouseId === id) {
            setOpenWarehouseId(null);
            // 🚨 NEW: Clear selection mode when closing a warehouse
            setIsSelectionMode(false); 
            setSelectedItems([]);
            return;
        }

        setOpenWarehouseId(id);

        // Clear search term when a new warehouse is selected
        setSearchTerm(''); 
        // 🚨 NEW: Clear selection mode when switching warehouses
        setIsSelectionMode(false); 
        setSelectedItems([]);
    }

    const filteredItemsForOpenWarehouse = useMemo(() => {
        if (!openWarehouseId) return [];

        let currentItems = allInventoryItems.filter(item => {
            const itemWarehouseId = String(item.warehouse?._id || "");
            return itemWarehouseId === String(openWarehouseId);
        });

        if(searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentItems = currentItems.filter(item => {
                return(
                    (item.name && item.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (item.sku && item.sku.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (item.description && item.description.toLowerCase().includes(lowerCaseSearchTerm))
                );
            });
        }


        if (showLowStock) {
            const ALMOST_LOW_THRESHOLD = 150; 
            
            currentItems = currentItems.filter(item => {
                return item.quantity <= ALMOST_LOW_THRESHOLD;
            });
        }

        return currentItems

    }, [allInventoryItems, openWarehouseId, searchTerm, showLowStock]);



    if (loading) return <h2>Loading inventory...</h2>;

    function getItemColor(quantity) {
        const URGENT_LOW_THRESHOLD = 50;
        const ALMOST_LOW_THRESHOLD = 150;

        if (quantity <= URGENT_LOW_THRESHOLD) {
            // Subtle Red for Urgent Low Stock
            return '#f80000ff'; // Light Pink/Red
        }

        if (quantity <= ALMOST_LOW_THRESHOLD) {
            // Subtle Yellow for Almost Low Stock
            return '#ffd500ff'; // Light Yellow/Amber
        }

        // Return null/transparent for normal stock (though filtering should handle this)
        return '#008000';
    }

    return (
        <div style={{ padding: "20px"}}>
            <h1>Inventory List</h1>
            <p>Select a warehouse to view its inventory items.</p>
            
        

            <div style={{ marginTop: "20px"}}>
                {warehouses.map((wh) => (
                    <div key={wh._id || wh.id} style={styles.warehouseBox}> 
                        
                        {/* Warehouse Header */}
                        <div 
                            style={styles.warehouseHeader}
                            onClick={() => toggleWarehouse(wh._id || wh.id)}
                        >
                            <h2 style={{ margin: 0}}>{wh.name}</h2>
                            <span>{openWarehouseId === (wh._id || wh.id) ?"▲" : "▼"}</span>
                        </div>

                        {/* Warehouse Inventory (Dropdown Section) */}
                        {openWarehouseId === (wh._id || wh.id) && (
                            <div style={styles.inventoryList}>

                                {/* 🚀 NEW LOCATION FOR SEARCH BAR */}
                                <input 
                                    type="text"
                                    placeholder="Search items by Name, SKU, or Description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchBar} 
                                />

                                {/* 🚀 NEW LOCATION FOR FILTER CONTROLS */}
                                <div style={styles.filterControls}>
                                    {/* Low Stock Checkbox */}
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={showLowStock}
                                            onChange={(e) => setShowLowStock(e.target.checked)}
                                            style={styles.checkboxInput}
                                        />
                                        Show Low Stock
                                    </label>
                                </div>
                                
                                <div style={styles.buttonContainer}>
                                    
                                    {/* 1. Add Item (Always visible when warehouse is open) */}
                                    {!isSelectionMode && (
                                        <button
                                            style={styles.addButton}
                                            onClick={() => navigate(`/warehouses/${wh._id || wh.id}/inventory/new`)}
                                        >
                                            Add Item
                                        </button>
                                    )}

                                    {/* 2. SELECT/CANCEL Button (Always visible when warehouse is open) */}
                                    <button
                                        style={styles.transferButton} // Reuse transfer button style for Select
                                        onClick={toggleSelectionMode}
                                    >
                                        {isSelectionMode ? 'Cancel Selection' : 'Select'}
                                    </button>
                                </div>
                                
                                {/* 3. BULK ACTION BUTTONS (Visible only in selection mode and if items are selected) */}
                                {isSelectionMode && selectedItems.length > 0 && (
                                    <div style={{...styles.buttonContainer, padding: '0'}}>
                                        <h3 style={{ margin: 0, alignSelf: 'center' }}>{selectedItems.length} Item(s) Selected</h3>
                                        <button style={styles.deleteButton}>Delete Selected</button>
                                        <button style={styles.transferButton} onClick={handleTransferSelected}>Transfer Selected</button>
                                    </div>
                                )}
                                
                                {/* Rendering based on filteredItemsForOpenWarehouse */}
                                {filteredItemsForOpenWarehouse.length === 0 ? (
                                    <p style={{ marginTop: "10px"}}>
                                        No inventory items yet.
                                        {searchTerm && ` (Try a different search term)`}
                                    </p>
                                ) : (
                                    filteredItemsForOpenWarehouse.map((item) => (
                                        <div 
                                            key={item._id || item.id}
                                            // 🚨 FIX: Remove onClick from the main div to allow selection/checkbox clicks
                                            // The row color indicates selection now.
                                            style={{
                                                    ...styles.itemRow,
                                                    cursor: isSelectionMode ? 'pointer' : 'default',
                                                    
                                                    // 1. Set the text color based on low stock status
                                                    //    (This uses your existing logic to return Red, Yellow, or Green/Default)
                                                    color: getItemColor(item.quantity), 
                                                    
                                                    // 2. Set the background color based on selection status
                                                    backgroundColor: selectedItems.includes(item._id || item.id) ? '#e0f7fa' : 'transparent',
                                                    
                                                    // 3. Set the left border based on selection mode
                                                    borderLeft: isSelectionMode ? '5px solid #1976d2' : 'none', 
                                                }}
                                            // Optional: Add a click handler to toggle selection if not using a separate checkbox
                                            // For clarity, we'll keep the checkbox separate for now.
                                        >
                                            
                                            {/* 4. CHECKBOX (Visible only in selection mode) */}
                                            {isSelectionMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item._id || item.id)}
                                                    // Stop propagation so clicking the checkbox doesn't trigger the row click if one exists
                                                    onClick={(e) => e.stopPropagation()} 
                                                    onChange={() => handleSelectItem(item._id || item.id)}
                                                    style={styles.checkboxInput} // Reuse existing checkbox style
                                                />
                                            )}
                                            
                                            {/* Item Content */}
                                            <div style={styles.itemPrimary}>
                                                <strong style={styles.itemName}>{item.name}</strong> 
                                                <span style={styles.itemSku}>SKU: {item.sku}</span>
                                            </div>
                                            <div style={styles.itemSecondary}>
                                                <span style={styles.itemDetail}>Quantity: {item.quantity}</span>
                                                <span style={styles.itemDetail}>Location: {item.storageLocation || 'N/A'}</span>
                                                <span style={styles.itemDescription}>{item.description}</span>
                                            </div>

                                            {/* 5. VIEW/EDIT BUTTON (Visible only outside of selection mode) */}
                                            {!isSelectionMode && (
                                                <button 
                                                    style={styles.editButton} // Reuse edit style for a primary action
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent the parent click action
                                                        navigate(`/inventory/${item._id || item.id}`);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div> 
                        )}
                    </div> 
                ))}
            </div>
            <Toaster />
        </div>
        
    );
}


const styles = {
    // ... (Your existing styles remain here, with the addition of bulk action specific ones if needed)
    
    // Updated buttonContainer to accommodate new elements
    buttonContainer: {
        display: 'flex',
        gap: '10px', 
        marginBottom: '15px', 
        padding: '0 10px',
        flexWrap: 'wrap', 
        alignItems: 'center', // Align bulk action components vertically
    },
    
    // ... (Add Button styles)
    addButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },

    // ... (Edit Button styles)
    editButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#f0ad4e",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },

    // ... (Delete Button styles)
    deleteButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#d9534f",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    
    // ... (Transfer Button styles - Reused for Select/Cancel)
    transferButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#5cb85c",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    // ... (Filter controls, etc.)

    // New style adjustment for itemRow to handle the checkbox space
    itemRow: {
        padding: "12px 0", 
        borderBottom: "1px solid #eee",
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center", // Align items vertically in the center
        flexWrap: "wrap",
        marginTop: '5px',
        gap: '10px', // Add gap for spacing between checkbox, item data, and button
    },

    // Ensure checkbox style is defined if needed
    checkboxInput: {
        marginRight: '8px',
        width: '18px',
        height: '18px',
    },
    
    buttonContainer: {
        display: 'flex',
        gap: '10px', 
        marginBottom: '15px', 
        padding: '0 10px',
        flexWrap: 'wrap', 
    },

    addButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },

    editButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#f0ad4e",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },

    deleteButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#d9534f",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    
    transferButton: {
        padding: "6px 12px",
        minWidth: '100px',
        background: "#5cb85c",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },

    filterControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '15px',
        padding: '0 10px',
    },

    selectFilter: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1em',
    },

    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1em',
        cursor: 'pointer',
    },

    checkboxInput: {
        marginRight: '8px',
        width: '18px',
        height: '18px',
    },

    warehouseBox: {
        border: "1px solid #ccc",
        borderRadius: "6px",
        marginBottom: "15px",
    },

    warehouseHeader: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 15px",
        background: "#f7f7f7",
        cursor: "pointer",
    },

    inventoryList: {
        padding: "10px 20px",
        background: "#fff",
    },
    
    itemRow: {
        padding: "12px 0", 
        borderBottom: "1px solid #eee",
        cursor: "pointer",
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        marginTop: '5px',
    },

    itemPrimary: {
        flex: 1.5, 
        minWidth: '200px',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '5px',
    },
    
    itemName: {
        fontSize: '1.1em',
        marginBottom: '4px',
    },
    
    itemSku: {
        fontSize: '0.85em',
        color: '#666',
    },

    itemSecondary: {
        flex: 2, 
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '0.9em',
        color: '#333',
    },
    
    itemDetail: {
        marginRight: '15px',
        display: 'inline-block',
        fontWeight: 'bold',
        marginBottom: '5px',
    },

    itemDescription: {
        marginTop: '8px',
        color: '#777',
        fontStyle: 'italic',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis', 
    },
    
    searchBar: {
        width: '100%',
        padding: '10px 15px',
        margin: '15px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '1em',
    },

};