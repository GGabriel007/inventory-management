// /pages/InventoryPage.jsx
// List inventory items across all warehouses

/**
 * InventoryPage.jsx
 * * The main Inventory Listing and Management view.
 * * Features:
 *  Lists items across all warehouses, grouped by location.
 *  Search & Filter: Filter by keyword or "Low Stock" status.
 *  Selection Mode: Enables checkboxes to select multiple items for bulk actions.
 *  Bulk Actions: Supports bulk deletion and bulk transfers between warehouses.
 *  Visual Indicators: Color-coded badges for stock levels (Green/Yellow/Red).
 */

import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'; 
import TransferToast from '../components/TransferToast';

export default function InventoryPage() {

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const [warehouses, setWarehouses] = useState([]) 
    const [openWarehouseId, setOpenWarehouseId] = useState(null);
    const [allInventoryItems, setAllInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // --- LOGIC SECTION ---

    const getSelectedItemsDetails = () => {
        return allInventoryItems
            .filter(item => selectedItems.includes(item._id || item.id))
            .map(item => ({ id: item._id || item.id, name: item.name, sku: item.sku }));
    };

    const handleDeleteSelected = () => {
        if (selectedItems.length === 0) return;
        const itemsToDelete = getSelectedItemsDetails();
        const itemNamesList = itemsToDelete.map(item => `${item.name} (SKU: ${item.sku})`);

        toast.custom((t) => (
            <div style={styles.toastContainer}>
                <div style={styles.toastHeader}>
                    Confirm Deletion ({selectedItems.length})
                </div>
                <div style={styles.toastBody}>
                    <p>Permanently delete these items?</p>
                    <ul style={styles.toastList}>
                        {itemNamesList.slice(0, 5).map((name, index) => (
                            <li key={index}>{name}</li>
                        ))}
                        {itemNamesList.length > 5 && (
                            <li>... and {itemNamesList.length - 5} more</li>
                        )}
                    </ul>
                </div>
                <div style={styles.toastActions}>
                    <button onClick={() => toast.dismiss(t.id)} style={styles.toastCancelButton}>Cancel</button>
                    <button 
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeBulkDelete(itemsToDelete); 
                        }} 
                        style={styles.toastConfirmButton}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const executeBulkDelete = async (itemsToDelete) => {
        let successfulDeletes = 0;
        let loadingToastId = null;

        try {
            loadingToastId = toast.loading(`Deleting ${itemsToDelete.length} item(s)...`);
            for (const item of itemsToDelete) {
                await axiosClient.delete(`/inventory/${item.id}`);
                successfulDeletes++; 
            }
            toast.dismiss(loadingToastId);
            toast.success(` Deleted ${successfulDeletes} items`);
            
            setSelectedItems([]); 
            setIsSelectionMode(false); 
            await fetchAllData();

        } catch (error) {
            toast.dismiss(loadingToastId); 
            toast.error(`Error deleting items.`);
            console.error("Bulk Delete Error:", error);
        }
    };

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
            toast.error("Failed to load inventory data."); 
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAllData();
        return () => { toast.dismiss(); };
    }, []);

    const toggleSelectionMode = () => {
        if (isSelectionMode) { setSelectedItems([]); }
        setIsSelectionMode(!isSelectionMode);
    };

    const handleSelectItem = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleTransferSelected = () => {
        if (selectedItems.length === 0) {
            toast.error("Select at least one item.");
            return; 
        }
        
        const sourceWarehouseId = openWarehouseId;
        
        // Identify items
        const itemsToTransfer = allInventoryItems.filter(item => 
            selectedItems.includes(item._id || item.id) && 
            (item.warehouse._id || item.warehouse.id) === sourceWarehouseId
        );

        if (itemsToTransfer.length === 0) {
             toast.error("No transferable items found.");
             return;
        }

        // Calculate Total Quantity FIRST
        const totalQtyToMove = itemsToTransfer.reduce((sum, item) => sum + item.quantity, 0);

        // Filter destinations based on ID *AND* Capacity
        const availableDestinations = warehouses.filter(wh => {
            const isDifferent = (wh._id || wh.id) !== sourceWarehouseId;
            const remainingCapacity = wh.maxCapacity - wh.currentCapacity;
            
            // Only allow if it's a different warehouse AND has space
            return isDifferent && (remainingCapacity >= totalQtyToMove);
        });
        
        //  Validate
        if (availableDestinations.length === 0) {
            toast.error(`No other warehouses have enough space for ${totalQtyToMove} units.`);
            return;
        }

        // Show Toast
        toast.custom((t) => (
            <TransferToast
                t={t}
                sourceWarehouseId={sourceWarehouseId}
                itemsToTransfer={itemsToTransfer}
                availableDestinations={availableDestinations}
                onTransferSuccess={() => {
                    fetchAllData();
                    setIsSelectionMode(false);
                    setSelectedItems([]);
                    toast.success('Transfer successful!');
                }}
                onDismiss={() => { toast.dismiss(t.id); }}
            />
        ), { duration: Infinity, position: 'top-center' });
    };

    async function toggleWarehouse(id) {
        if (openWarehouseId === id) {
            setOpenWarehouseId(null);
            setIsSelectionMode(false); 
            setSelectedItems([]);
            return;
        }
        setOpenWarehouseId(id);
        setSearchTerm(''); 
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
            currentItems = currentItems.filter(item => item.quantity <= ALMOST_LOW_THRESHOLD);
        }

        return currentItems

    }, [allInventoryItems, openWarehouseId, searchTerm, showLowStock]);


    // --- UI HELPERS ---

    function getStockBadgeStyle(quantity) {
        if (quantity <= 50) return styles.badgeCritical; 
        if (quantity <= 150) return styles.badgeWarning; 
        return styles.badgeSuccess; 
    }

    if (loading) return <div style={styles.loadingState}>Loading inventory...</div>;

    return (
        <div style={styles.pageContainer}>
            <div style={styles.headerSection}>
                <h1 style={styles.mainTitle}>Inventory Management</h1>
                <p style={styles.subTitle}>Manage stock levels, transfers, and warehouse items.</p>
            </div>

            <div style={styles.warehouseGrid}>
                {warehouses.map((wh) => {
                    const isOpen = openWarehouseId === (wh._id || wh.id);
                    return (
                        <div key={wh._id || wh.id} style={styles.warehouseCard}> 
                            
                            {/* Warehouse Header - Clickable Accordion */}
                            <div 
                                style={isOpen ? styles.warehouseHeaderActive : styles.warehouseHeader}
                                onClick={() => toggleWarehouse(wh._id || wh.id)}
                            >
                                <div style={styles.headerContent}>
                                    <h2 style={styles.warehouseTitle}>{wh.name}</h2>
                                    <span style={styles.warehouseLocation}>{wh.location}</span>
                                </div>
                                <span style={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
                            </div>

                            {/* Dropdown Content */}
                            {isOpen && (
                                <div style={styles.inventoryBody}>
                                    
                                    {/* TOOLBAR: Search + Filter + Actions */}
                                    <div style={styles.toolbar}>
                                        <input 
                                            type="text"
                                            placeholder="Search items..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={styles.searchBar} 
                                        />

                                        <div style={styles.toolbarActions}>
                                            <label style={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={showLowStock}
                                                    onChange={(e) => setShowLowStock(e.target.checked)}
                                                    style={{accentColor: '#1976d2'}}
                                                />
                                                <span>Low Stock Only</span>
                                            </label>

                                            <div style={styles.buttonGroup}>
                                                {!isSelectionMode && (
                                                    <button
                                                        style={styles.btnPrimary}
                                                        onClick={() => navigate(`/warehouses/${wh._id || wh.id}/inventory/new`)}
                                                    >
                                                        + Add Item
                                                    </button>
                                                )}
                                                <button
                                                    style={isSelectionMode ? styles.btnSecondaryActive : styles.btnSecondary}
                                                    onClick={toggleSelectionMode}
                                                >
                                                    {isSelectionMode ? 'Cancel' : 'Select Items'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BULK ACTIONS BAR (Only visible when items selected) */}
                                    {isSelectionMode && selectedItems.length > 0 && (
                                        <div style={styles.bulkActionBar}>
                                            <span style={styles.selectedCount}>{selectedItems.length} Selected</span>
                                            <div style={styles.bulkButtons}>
                                                <button style={styles.btnDanger} onClick={handleDeleteSelected}>
                                                    Delete Selected
                                                </button>
                                                <button style={styles.btnSuccess} onClick={handleTransferSelected}>
                                                    Transfer Selected
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* INVENTORY LIST */}
                                    <div style={styles.itemsListContainer}>
                                        {filteredItemsForOpenWarehouse.length === 0 ? (
                                            <div style={styles.emptyState}>
                                                <p>No inventory found. {searchTerm && "Try a different search."}</p>
                                            </div>
                                        ) : (
                                            filteredItemsForOpenWarehouse.map((item) => (
                                                <div 
                                                    key={item._id || item.id}
                                                    style={{
                                                        ...styles.itemRow,
                                                        backgroundColor: selectedItems.includes(item._id || item.id) ? '#f0f9ff' : 'white',
                                                        borderLeft: selectedItems.includes(item._id || item.id) ? '4px solid #1976d2' : '4px solid transparent',
                                                    }}
                                                    onClick={() => {
                                                        if (isSelectionMode) handleSelectItem(item._id || item.id);
                                                    }}
                                                >
                                                    
                                                    {/* Checkbox Column */}
                                                    {isSelectionMode && (
                                                        <div style={styles.colCheckbox}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedItems.includes(item._id || item.id)}
                                                                onChange={() => handleSelectItem(item._id || item.id)}
                                                                style={styles.bigCheckbox}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Data Columns */}
                                                    <div style={styles.colMain}>
                                                        <div style={styles.itemName}>{item.name}</div>
                                                        <div style={styles.itemSku}>{item.sku}</div>
                                                    </div>

                                                    <div style={styles.colMeta}>
                                                        <span style={getStockBadgeStyle(item.quantity)}>
                                                            {item.quantity} Units
                                                        </span>
                                                        <span style={styles.locationTag}>{item.storageLocation || 'No Loc'}</span>
                                                    </div>

                                                    {/* Action Column */}
                                                    {!isSelectionMode && (
                                                        <div style={styles.colActions}>
                                                            <button 
                                                                style={styles.btnView} 
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    navigate(`/inventory/${item._id || item.id}`);
                                                                }}
                                                            >
                                                                Details
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div> 
                            )}
                        </div> 
                    );
                })}
            </div>
        </div>
    );
}

// --- STYLES ---
const styles = {
    pageContainer: {
        padding: "40px 20px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#333",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
    },
    headerSection: {
        marginBottom: "30px",
        textAlign: "center",
    },
    mainTitle: {
        fontSize: "2.5rem",
        color: "#1f2937",
        marginBottom: "10px",
    },
    subTitle: {
        color: "#6b7280",
        fontSize: "1.1rem",
    },
    loadingState: {
        textAlign: "center",
        padding: "50px",
        fontSize: "1.2rem",
        color: "#666",
    },
    
    // Warehouse Card Styling
    warehouseGrid: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    warehouseCard: {
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        transition: "box-shadow 0.2s",
    },
    warehouseHeader: {
        padding: "20px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        backgroundColor: "#fff",
        transition: "background 0.2s",
    },
    warehouseHeaderActive: {
        padding: "20px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        backgroundColor: "#f3f4f6", 
        borderBottom: "1px solid #e5e7eb",
    },
    headerContent: {
        display: "flex",
        flexDirection: "column",
    },
    warehouseTitle: {
        margin: 0,
        fontSize: "1.25rem",
        color: "#111827",
    },
    warehouseLocation: {
        fontSize: "0.9rem",
        color: "#6b7280",
        marginTop: "4px",
    },
    chevron: {
        fontSize: "0.8rem",
        color: "#9ca3af",
    },

    // Inside the Dropdown
    inventoryBody: {
        padding: "25px",
        backgroundColor: "#fff",
    },
    toolbar: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        paddingBottom: "20px",
        borderBottom: "1px solid #f3f4f6",
    },
    searchBar: {
        flex: 1,
        minWidth: "250px",
        padding: "10px 15px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "0.95rem",
        outline: "none",
        transition: "border 0.2s",
    },
    toolbarActions: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
    },
    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "500",
        color: "#4b5563",
    },
    buttonGroup: {
        display: "flex",
        gap: "10px",
    },

    // Buttons
    btnPrimary: {
        padding: "8px 16px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background 0.2s",
        fontSize: "0.9rem",
    },
    btnSecondary: {
        padding: "8px 16px",
        backgroundColor: "#fff",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "0.9rem",
    },
    btnSecondaryActive: {
        padding: "8px 16px",
        backgroundColor: "#e5e7eb",
        color: "#111827",
        border: "1px solid #9ca3af",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "0.9rem",
    },
    btnDanger: {
        padding: "8px 16px",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
    },
    btnSuccess: {
        padding: "8px 16px",
        backgroundColor: "#059669",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
    },
    btnView: {
        padding: "6px 12px",
        backgroundColor: "transparent",
        color: "#2563eb",
        border: "1px solid #bfdbfe",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: "600",
        transition: "all 0.2s",
    },

    // Bulk Action Bar
    bulkActionBar: {
        backgroundColor: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: "8px",
        padding: "10px 20px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
    },
    selectedCount: {
        fontWeight: "700",
        color: "#1e40af",
    },
    bulkButtons: {
        display: "flex",
        gap: "10px",
    },

    // Item List
    itemsListContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    emptyState: {
        textAlign: "center",
        padding: "30px",
        color: "#9ca3af",
        fontStyle: "italic",
    },
    itemRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #f3f4f6",
        transition: "all 0.2s",
        cursor: "default",
        gap: "15px",
        flexWrap: "wrap",
    },
    colCheckbox: {
        display: "flex",
        alignItems: "center",
    },
    bigCheckbox: {
        width: "20px",
        height: "20px",
        accentColor: "#2563eb",
        cursor: "pointer",
    },
    colMain: {
        flex: 2,
        minWidth: "200px",
    },
    itemName: {
        fontWeight: "600",
        color: "#111827",
        fontSize: "1rem",
    },
    itemSku: {
        fontSize: "0.85rem",
        color: "#6b7280",
        fontFamily: "monospace",
        marginTop: "2px",
    },
    colMeta: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "15px",
        minWidth: "150px",
    },
    locationTag: {
        fontSize: "0.8rem",
        color: "#9ca3af",
        fontStyle: "italic",
    },
    colActions: {
        display: "flex",
        justifyContent: "flex-end",
    },

    // Badges
    badgeSuccess: {
        backgroundColor: "#d1fae5",
        color: "#065f46",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "0.85rem",
        fontWeight: "600",
    },
    badgeWarning: {
        backgroundColor: "#fef3c7",
        color: "#92400e",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "0.85rem",
        fontWeight: "600",
    },
    badgeCritical: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "0.85rem",
        fontWeight: "600",
    },

    // Toast Styles (Copied & Refined)
    toastContainer: {
        padding: '20px',
        background: '#fff',
        color: '#333',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        maxWidth: '400px',
    },
    toastHeader: {
        fontSize: '1.1rem',
        fontWeight: '700',
        marginBottom: '10px',
        color: '#dc2626',
    },
    toastBody: { marginBottom: '15px' },
    toastList: {
        paddingLeft: '20px',
        marginTop: '8px',
        maxHeight: '100px',
        overflowY: 'auto',
        fontSize: '0.9rem',
        color: '#4b5563',
    },
    toastActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    },
    toastCancelButton: {
        padding: '8px 16px',
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    toastConfirmButton: {
        padding: '8px 16px',
        background: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};