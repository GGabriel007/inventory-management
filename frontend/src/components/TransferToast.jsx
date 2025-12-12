// /components/TransferToast.jsx

/**
 * TransferToast.jsx
 * * A specialized UI component rendered inside a Toast.
 * * Handles the complex user flow for bulk transfers:
 *  Selecting a destination warehouse.
 *  Adjusting quantities for each item being transferred.
 *  Submitting the transfer payload to the backend.
 *  Displaying a summary upon success.
 */

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

const TransferToast = ({ 
    t, 
    sourceWarehouseId,
    itemsToTransfer, 
    availableDestinations, 
    onTransferSuccess,
    onDismiss 
}) => {
    
    // State to track the selected destination warehouse ID
    const [destinationId, setDestinationId] = useState('');
    
    // State to track transfer quantities for each item (defaulting to max quantity
    const [transferQuantities, setTransferQuantities] = useState(
        itemsToTransfer?.reduce((acc, item) => { // Use optional chaining to prevent crash if undefined
            acc[item._id || item.id] = item.quantity;
            return acc;
        }, {}) ?? {}
    );

    // Calculate the total number of units to be moved
    const totalUnitsToTransfer = Object.values(transferQuantities ?? {}).reduce((sum, qty) => sum + Number(qty), 0);

    const [isSubmitting, setIsSubmitting] = useState(false);

    

    const handleQuantityChange = (itemId, maxQuantity, value) => {
        let qty = Math.max(0, parseInt(value, 10) || 0);
        qty = Math.min(qty, maxQuantity); // Cannot transfer more than available

        setTransferQuantities(prev => ({
            ...prev,
            [itemId]: qty
        }));
    };

    const handleConfirmTransfer = async () => {
        if (!destinationId) {
            toast.error("Please select a destination warehouse.", { id: 'transfer-err' });
            return;
        }
        
        const transferPayload = {
            sourceWarehouseId: sourceWarehouseId,
            destinationWarehouseId: destinationId,
            // Prepare a list of items and the specific quantities to move
            items: itemsToTransfer.map(item => ({
                itemId: item._id || item.id,
                quantity: transferQuantities[item._id || item.id]
            })).filter(item => item.quantity > 0) 
        };

        if (transferPayload.items.length === 0) {
            toast.error("Select at least one unit to transfer.", { id: 'transfer-err' });
            return;
        }

        setIsSubmitting(true);
        try {
    
            await axiosClient.post('/inventory/bulk-transfer', transferPayload);
            
            // Success
            toast.dismiss(t.id);
            onTransferSuccess();
            
        } catch (error) {
            console.error("Transfer Error:", error);
            const errorMessage = error.response?.data?.message || "Transfer failed due to capacity or server error.";
            toast.error(errorMessage, { id: 'transfer-err' });
            setIsSubmitting(false);
        }
    };

    const showSuccessToast = (details) => {
    const { destinationWarehouseName, itemsTransferred } = details;
    
    const itemList = (
        <ul style={{ margin: '5px 0 0 15px', padding: 0, listStyleType: 'disc' }}>
            {itemsTransferred.map((item, index) => (
                <li key={item.id || index}>
                    **{item.quantity}** units of **{item.name || `Item ${item.id}`}**
                </li>
            ))}
        </ul>
    );

    toast.success(
        <div>
            <h4>Transfer Complete!</h4>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                Items transferred to **{destinationWarehouseName}** successfully:
            </p>
            {itemList}
        </div>, 
        { 
            duration: 8000, // Keep success toast visible for 8 seconds
            id: 'transfer-success' 
        }
    );
};

    // Style for the custom toast
    const toastStyle = {
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: 'auto',
        maxWidth: '600px',
    };

    return (
        <div style={toastStyle}>
            <h3>Bulk Transfer ({totalUnitsToTransfer} total units)</h3>

        <p>
        From: 
        <strong>
                {/* Check if itemsToTransfer exists AND has a [0] element. 
                Only then try to read the nested properties. 
                */}
                {itemsToTransfer?.[0]?.warehouse?.name || 'Current Warehouse'}
            </strong>
        </p>
                
            {/* Destination Selector */}
            <div style={{ margin: '15px 0' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Select Destination Warehouse:
                </label>
                <select 
                    value={destinationId} 
                    onChange={(e) => setDestinationId(e.target.value)}
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="">-- Choose Warehouse --</option>
                    {(availableDestinations || []).map(wh => (
                    <option key={wh._id || wh.id} value={wh._id || wh.id}>
                        {wh.name} (Capacity: {wh.currentCapacity} / {wh.maxCapacity})
                    </option>
                    ))}
                </select>
            </div>

            {/* Item List and Quantity Input */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                <p style={{ fontWeight: 'bold' }}>Items to Transfer:</p>
                {(itemsToTransfer || []).map(item => (
                    <div key={item._id || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dotted #eee' }}>
                        <span style={{ flex: 2 }}>{item.name} ({item.sku})</span>
                        <span style={{ flex: 1, textAlign: 'right', color: '#666' }}>Max: {item.quantity}</span>
                        <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={transferQuantities[item._id || item.id]}
                            onChange={(e) => handleQuantityChange(item._id || item.id, item.quantity, e.target.value)}
                            disabled={isSubmitting}
                            style={{ width: '80px', padding: '5px', marginLeft: '10px', textAlign: 'center' }}
                        />
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                    onClick={onDismiss} 
                    disabled={isSubmitting}
                    style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Cancel
                </button>
                <button 
                    onClick={handleConfirmTransfer} 
                    disabled={isSubmitting || !destinationId || totalUnitsToTransfer === 0}
                    style={{ padding: '8px 15px', background: isSubmitting ? '#ddd' : '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {isSubmitting ? 'Transferring...' : `Confirm Transfer`}
                </button>
            </div>
        </div>
    );
};

export default TransferToast;