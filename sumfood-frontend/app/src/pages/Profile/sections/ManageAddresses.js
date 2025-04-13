import React, { useState, useEffect } from 'react';
import './ManageAddresses.css';
import StandardizedInput from '../../../components/common/StandardizedInput';
import axios from 'axios';

const ManageAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        addressLine: '',
        addressLine2: '',
        postalCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    
    // Function to fetch addresses from the server
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Not authenticated' });
                return;
            }
            
            const response = await axios.get('http://localhost:8080/api/customer/address/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Role': 'CUSTOMER'
                }
            });
            
            // Ensure we're working with an array
            if (Array.isArray(response.data)) {
                setAddresses(response.data);
            } else {
                console.error('Expected an array but received:', response.data);
                // Try to find addresses array if nested in response
                if (response.data && Array.isArray(response.data.addresses)) {
                    setAddresses(response.data.addresses);
                } else {
                    // Fallback to empty array
                    setAddresses([]);
                    setMessage({ 
                        type: 'error', 
                        text: 'Invalid data format received from server' 
                    });
                }
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || error.message || 'Failed to load addresses' 
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch addresses from backend on component mount
    useEffect(() => {
        fetchAddresses();
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
        
        const saveAddress = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setMessage({ type: 'error', text: 'Not authenticated' });
                    return;
                }

                const endpoint = editingId 
                    ? `http://localhost:8080/api/customer/address/${editingId}` 
                    : 'http://localhost:8080/api/customer/address/';
                
                let response;
                if (editingId) {
                    response = await axios.put(endpoint, formData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Role': 'CUSTOMER'
                        }
                    });
                } else {
                    response = await axios.post(endpoint, formData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Role': 'CUSTOMER'
                        }
                    });
                }
                
                // Refresh the addresses list directly from the server
                await fetchAddresses();
                
                setMessage({ 
                    type: 'success', 
                    text: editingId ? 'Address updated successfully' : 'Address added successfully' 
                });
                resetForm();
            } catch (error) {
                setMessage({ 
                    type: 'error', 
                    text: error.response?.data?.message || 'An error occurred while saving the address' 
                });
            } finally {
                setLoading(false);
            }
        };
        
        saveAddress();
    };

    const handleEdit = (address) => {
        setEditingId(address.id);
        setFormData({
            addressLine: address.addressLine,
            addressLine2: address.addressLine2,
            postalCode: address.postalCode
        });
    };

    // Open delete confirmation dialog
    const initiateDelete = (id) => {
        setAddressToDelete(id);
        setShowDeleteConfirm(true);
    };
    
    // Cancel deletion
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setAddressToDelete(null);
    };

    const handleDelete = () => {
        const deleteAddress = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setMessage({ type: 'error', text: 'Not authenticated' });
                    return;
                }

                await axios.delete(`http://localhost:8080/api/customer/address/${addressToDelete}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                });
                
                // Refresh addresses from server
                await fetchAddresses();
                
                if (editingId === addressToDelete) {
                    resetForm();
                }
                setMessage({ type: 'success', text: 'Address deleted successfully' });
                setShowDeleteConfirm(false);
                setAddressToDelete(null);
            } catch (error) {
                setMessage({ 
                    type: 'error', 
                    text: error.response?.data?.message || 'An error occurred while deleting the address' 
                });
            } finally {
                setLoading(false);
            }
        };
        
        deleteAddress();
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            addressLine: '',
            addressLine2: '',
            postalCode: ''
        });
    };

    return (
        <div className="manage-addresses">
            <h2>Manage Addresses</h2>
            
            {loading && <div className="loading-indicator">Loading...</div>}
            
            {message.text && (
                <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                    {message.text}
                </div>
            )}
            
            {/* Delete confirmation popup */}
            {showDeleteConfirm && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-popup">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this address?</p>
                        <div className="delete-confirm-buttons">
                            <button 
                                className="confirm-delete-btn" 
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button 
                                className="cancel-delete-btn" 
                                onClick={cancelDelete}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <form className="address-form" onSubmit={handleSubmit}>
                <StandardizedInput
                    label="Address Line 1"
                    name="addressLine"
                    value={formData.addressLine}
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
                {Array.isArray(addresses) ? addresses.map(address => (
                    <div key={address.id} className="address-card">
                        <div className="address-info">
                            <p>
                                <span className="field-label">Address Line 1:</span>
                                <span className="field-value">{address.addressLine}</span>
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
                                onClick={() => initiateDelete(address.id)}
                                disabled={loading}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )) : <p>No addresses found</p>}
            </div>
        </div>
    );
};

export default ManageAddresses;