import React, { useState, useEffect, useRef } from 'react';
import './ManageAddresses.css';
import StandardizedInput from '../../../components/common/StandardizedInput';
import axios from 'axios';

const ManageAddresses = () => {
    const formRef = useRef(null);

    const [addresses, setAddresses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        addressLine: '',
        addressLine2: '',
        postalCode: '',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [defaultAddressId, setDefaultAddressId] = useState(null);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Not authenticated' });
                return;
            }

            // Fetch all addresses
            const addressesResponse = await axios.get('http://localhost:8080/api/customer/address/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Role': 'CUSTOMER'
                }
            });

            try {
                const defaultResponse = await axios.get('http://localhost:8080/api/customer/address/default/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                });

                if (defaultResponse.data && defaultResponse.data.id) {
                    setDefaultAddressId(defaultResponse.data.id);
                }
            } catch (error) {
                console.log('No default address set or error fetching default address:', error.message);
                setDefaultAddressId(null);
            }

            let addressesData = [];
            if (Array.isArray(addressesResponse.data)) {
                addressesData = addressesResponse.data;
            } else if (addressesResponse.data && Array.isArray(addressesResponse.data.addresses)) {
                addressesData = addressesResponse.data.addresses;
            }

            setAddresses(addressesData);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || error.message || 'Failed to load addresses'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'postalCode' && value.length > 5) return;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

                // If this is a new default address, update the default address ID
                if (formData.isDefault) {
                    setDefaultAddressId(response.data.id);
                }

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
            postalCode: address.postalCode,
            isDefault: address.id === defaultAddressId
        });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Not authenticated' });
                return;
            }

            const response = await axios.put(
                `http://localhost:8080/api/customer/address/default/${addressId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                }
            );

            setDefaultAddressId(addressId);
            setMessage({ type: 'success', text: 'Default address updated successfully' });

            // If we're editing this address, update the form's isDefault checkbox
            if (editingId === addressId) {
                setFormData(prev => ({
                    ...prev,
                    isDefault: true
                }));
            }
        } catch (error) {
            console.log(error)
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to set default address'
            });
        } finally {
            setLoading(false);
        }
    };

    const initiateDelete = (id) => {
        setAddressToDelete(id);
        setShowDeleteConfirm(true);
    };

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

                // If we're deleting the default address, clear the default
                if (addressToDelete === defaultAddressId) {
                    setDefaultAddressId(null);
                }

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
            postalCode: '',
            isDefault: false
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

            <form className="address-form" onSubmit={handleSubmit} ref={formRef}>
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

                <div className="form-checkbox">
                    <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="isDefault">Set as default address</label>
                </div>

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
                {Array.isArray(addresses) && addresses.length > 0 ? 
                    [...addresses]
                        .sort((a, b) => {
                            // Sort by default status (default address first)
                            if (a.id === defaultAddressId) return -1;
                            if (b.id === defaultAddressId) return 1;
                            return 0;
                        })
                        .map(address => (
                            <div key={address.id} className="address-card">
                                <div className="address-info">
                                    {address.id === defaultAddressId && (
                                        <p className="default-badge">Default Address</p>
                                    )}
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
                                        className="default-btn"
                                        onClick={() => handleSetDefault(address.id)}
                                        disabled={loading || address.id === defaultAddressId}
                                    >
                                        {address.id === defaultAddressId ? 'Default' : 'Set Default'}
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
                        )) : <p className="no-addresses">No addresses found. Add your first address above.</p>}
            </div>
        </div>
    );
};

export default ManageAddresses;