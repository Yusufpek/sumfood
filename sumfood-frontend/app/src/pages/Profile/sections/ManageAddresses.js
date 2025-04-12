import React, { useState } from 'react';
import './ManageAddresses.css';
import StandardizedInput from '../../../components/common/StandardizedInput';

const ManageAddresses = () => {
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
        if (editingId) {
            setAddresses(prevAddresses => 
                prevAddresses.map(address => 
                    address.id === editingId ? { id: editingId, ...formData } : address
                )
            );
        } else {
            setAddresses(prevAddresses => [
                ...prevAddresses,
                { id: Date.now(), ...formData }
            ]);
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
        setAddresses(prevAddresses => 
            prevAddresses.filter(address => address.id !== id)
        );
        if (editingId === id) {
            resetForm();
        }
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
                    <button type="submit" className="submit-btn">
                        {editingId ? 'Update Address' : 'Add Address'}
                    </button>
                    {editingId && (
                        <button type="button" className="cancel-btn" onClick={resetForm}>
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
                            <button className="edit-btn" onClick={() => handleEdit(address)}>
                                Edit
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(address.id)}>
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