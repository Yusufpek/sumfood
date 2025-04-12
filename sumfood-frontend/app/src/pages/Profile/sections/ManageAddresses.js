import React, { useState, useEffect } from 'react';
import './ManageAddresses.css';
import StandardizedInput from '../../../components/common/StandardizedInput';

const ManageAddresses = () => {
    // TODO: Replace with API data when backend is connected
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            addressLine1: '123 Main St',
            addressLine2: 'Apt 4B',
            postalCode: '10001',
            isDefault: true
        },
        {
            id: 2,
            addressLine1: '456 Business Ave',
            addressLine2: 'Floor 3',
            postalCode: '10002',
            isDefault: false
        }
    ]);

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        addressLine1: '',
        addressLine2: '',
        postalCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // TODO: API Integration - Fetch addresses from backend on component mount
    useEffect(() => {
        // TODO: Implement API call to fetch addresses
        // GET /api/sections/addresses
        // Example:
        // const fetchAddresses = async () => {
        //     try {
        //         setLoading(true);
        //         const response = await fetch('/api/sections/addresses');
        //         const data = await response.json();
        //         setAddresses(data);
        //     } catch (error) {
        //         setMessage({ type: 'error', text: 'Failed to load addresses' });
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // 
        // fetchAddresses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'postalCode' && value.length > 5) return;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // TODO: API Integration - Create or update address
        // Example:
        // const saveAddress = async () => {
        //     try {
        //         setLoading(true);
        //         const method = editingId ? 'PUT' : 'POST';
        //         const endpoint = editingId 
        //             ? `/api/sections/addresses/${editingId}` 
        //             : '/api/sections/addresses';
        //         
        //         const response = await fetch(endpoint, {
        //             method,
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${authToken}`
        //             },
        //             body: JSON.stringify(formData)
        //         });
        //         
        //         if (response.ok) {
        //             const data = await response.json();
        //             if (editingId) {
        //                 setAddresses(prevAddresses => 
        //                     prevAddresses.map(address => 
        //                         address.id === editingId ? data : address
        //                     )
        //                 );
        //                 setMessage({ type: 'success', text: 'Address updated successfully' });
        //             } else {
        //                 setAddresses(prevAddresses => [...prevAddresses, data]);
        //                 setMessage({ type: 'success', text: 'Address added successfully' });
        //             }
        //             resetForm();
        //         } else {
        //             const errorData = await response.json();
        //             setMessage({ type: 'error', text: errorData.message || 'Failed to save address' });
        //         }
        //     } catch (error) {
        //         setMessage({ type: 'error', text: 'An error occurred while saving the address' });
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        //
        // saveAddress();
        
        // Temporary implementation until API is connected
        if (editingId) {
            setAddresses(prevAddresses => 
                prevAddresses.map(address => 
                    address.id === editingId ? { id: editingId, ...formData } : address
                )
            );
            setMessage({ type: 'success', text: 'Address updated successfully' });
        } else {
            setAddresses(prevAddresses => [
                ...prevAddresses,
                { id: Date.now(), ...formData }
            ]);
            setMessage({ type: 'success', text: 'Address added successfully' });
        }
        resetForm();
    };

    const handleEdit = (address) => {
        setEditingId(address.id);
        setFormData({
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            postalCode: address.postalCode
        });
    };

    const handleDelete = (id) => {
        // TODO: API Integration - Delete address
        // Example:
        // const deleteAddress = async () => {
        //     try {
        //         setLoading(true);
        //         const response = await fetch(`/api/sections/addresses/${id}`, {
        //             method: 'DELETE',
        //             headers: {
        //                 'Authorization': `Bearer ${authToken}`
        //             }
        //         });
        //         
        //         if (response.ok) {
        //             setAddresses(prevAddresses => 
        //                 prevAddresses.filter(address => address.id !== id)
        //             );
        //             if (editingId === id) {
        //                 resetForm();
        //             }
        //             setMessage({ type: 'success', text: 'Address deleted successfully' });
        //         } else {
        //             const errorData = await response.json();
        //             setMessage({ type: 'error', text: errorData.message || 'Failed to delete address' });
        //         }
        //     } catch (error) {
        //         setMessage({ type: 'error', text: 'An error occurred while deleting the address' });
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        //
        // deleteAddress();
        
        // Temporary implementation until API is connected
        setAddresses(prevAddresses => 
            prevAddresses.filter(address => address.id !== id)
        );
        if (editingId === id) {
            resetForm();
        }
        setMessage({ type: 'success', text: 'Address deleted successfully' });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            addressLine1: '',
            addressLine2: '',
            postalCode: ''
        });
    };

    return (
        <div className="manage-addresses">
            <h2>Manage Addresses</h2>
            
            {/* TODO: Add loading indicator when fetching or updating data */}
            {loading && <div className="loading-indicator">Loading...</div>}
            
            {message.text && (
                <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                    {message.text}
                </div>
            )}
            
            <form className="address-form" onSubmit={handleSubmit}>
                <StandardizedInput
                    label="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    placeholder="Street address"
                />
                
                <StandardizedInput
                    label="Address Line 2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                />
                
                <StandardizedInput
                    label="Postal Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    maxLength={5}
                    pattern="[0-9]{5}"
                    placeholder="5-digit postal code"
                />
                
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (editingId ? 'Update Address' : 'Add Address')}
                    </button>
                    {editingId && (
                        <button 
                            type="button" 
                            className="cancel-btn" 
                            onClick={resetForm}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="addresses-list">
                {addresses.map(address => (
                    <div key={address.id} className="address-card">
                        <div className="address-info">
                            <p>
                                <span className="field-label">Address Line 1:</span>
                                <span className="field-value">{address.addressLine1}</span>
                            </p>
                            {address.addressLine2 && (
                                <p>
                                    <span className="field-label">Address Line 2:</span>
                                    <span className="field-value">{address.addressLine2}</span>
                                </p>
                            )}
                            <p>
                                <span className="field-label">Postal Code:</span>
                                <span className="field-value">{address.postalCode}</span>
                            </p>
                        </div>
                        <div className="address-actions">
                            <button 
                                className="edit-btn" 
                                onClick={() => handleEdit(address)}
                                disabled={loading}
                            >
                                Edit
                            </button>
                            <button 
                                className="delete-btn" 
                                onClick={() => handleDelete(address.id)}
                                disabled={loading}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageAddresses; 