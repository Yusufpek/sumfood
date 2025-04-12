import React, { useState, useEffect } from 'react';
import './ManageAddresses.css';

const AddressCard = ({ address, onSetDefault, onRemoveDefault, onDelete }) => ( // Added onRemoveDefault prop
    <div className="address-card">
        <div className="address-card-header">
            <h4>{address.title}</h4>
            {address.isDefault && <span className="default-badge">Default</span>}
        </div>
        <p>{address.address}</p>
        <p>{address.city}, {address.state} {address.zipCode}</p>
        <div className="address-card-actions">
            {/* --- Conditional Default Button --- */}
            {address.isDefault ? (
                <button
                    onClick={() => onRemoveDefault(address.id)}
                    className="btn btn-remove-default"
                >
                    Remove Default
                </button>
            ) : (
                <button
                    onClick={() => onSetDefault(address.id)}
                    className="btn btn-set-default"
                >
                    Set as Default
                </button>
            )}
            {/* --- End Conditional Default Button --- */}

            <button
                onClick={() => onDelete(address.id)}
                className="btn btn-delete"
            >
                Delete
            </button>
        </div>
    </div>
);


// Component for the Add Address form
const AddAddressForm = ({ onSubmit, newAddress, onInputChange, onCheckboxChange }) => (
    <form onSubmit={onSubmit} className="add-address-form">
        <h3>Add New Address</h3>
        {}
        <div>
            <label htmlFor="title">Title</label>
            <input
                id="title"
                type="text"
                name="title"
                value={newAddress.title}
                onChange={onInputChange}
                required
            />
        </div>
        <div>
            <label htmlFor="address">Address</label>
            <input
                id="address"
                type="text"
                name="address"
                value={newAddress.address}
                onChange={onInputChange}
                required
            />
        </div>
        <div>
            <label htmlFor="city">City</label>
            <input
                id="city"
                type="text"
                name="city"
                value={newAddress.city}
                onChange={onInputChange}
                required
            />
        </div>
        <div>
            <label htmlFor="state">State</label>
            <input
                id="state"
                type="text"
                name="state"
                value={newAddress.state}
                onChange={onInputChange}
                required
            />
        </div>
        <div>
            <label htmlFor="zipCode">ZIP Code</label>
            <input
                id="zipCode"
                type="text"
                name="zipCode"
                value={newAddress.zipCode}
                onChange={onInputChange}
                required
            />
        </div>
        <div className="checkbox-group">
            <label htmlFor="isDefault">
                <input
                    id="isDefault"
                    type="checkbox"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={onCheckboxChange}
                />
                Set as default address
            </label>
        </div>
        <button type="submit" className="btn btn-add">
            Add Address
        </button>
    </form>
);

const ManageAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const [error, setError] = useState(null); // Added error state
    const [newAddress, setNewAddress] = useState({
        title: '', address: '', city: '', state: '', zipCode: '', isDefault: false
    });

    // --- Fetch Initial Data ---
    useEffect(() => {
        const fetchAddresses = async () => {
            setLoading(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                const mockData = [
                    { id: 1, title: 'Home', address: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', isDefault: true },
                    { id: 2, title: 'Work', address: '456 Business Ave', city: 'New York', state: 'NY', zipCode: '10002', isDefault: false }
                ];
                setAddresses(mockData);
            } catch (err) {
                setError('Failed to load addresses.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, []); // This runs once on mount

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }));
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const createdAddress = { ...newAddress, id: Date.now() };
            // If the new address is set as default, unset all others first
            let updatedAddresses = addresses;
            if (createdAddress.isDefault) {
                updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
            }

            setAddresses([...updatedAddresses, createdAddress]);
            setNewAddress({ title: '', address: '', city: '', state: '', zipCode: '', isDefault: false }); // Reset form

        } catch (err) {
            setError('Failed to add address.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        setLoading(true);
        setError(null);
        try {
            // --- TODO: Replace with actual API call to delete address ---
            // Example: await fetch(`/api/users/addresses/${id}`, { method: 'DELETE' });
            await new Promise(resolve => setTimeout(resolve, 300));
            // --- End of TODO ---

            setAddresses(prevAddresses => prevAddresses.filter(address => address.id !== id));

        } catch (err) {
            setError('Failed to delete address.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id) => {
        setLoading(true);
        setError(null);
        try {
            // --- TODO: Replace with actual API call to set default address ---
            // Example: await fetch(`/api/users/addresses/${id}/default`, { method: 'PUT' });
            await new Promise(resolve => setTimeout(resolve, 300));
            // --- End of TODO ---

            setAddresses(prevAddresses =>
                prevAddresses.map(address => ({
                    ...address,
                    isDefault: address.id === id
                }))
            );
        } catch (err) {
            setError('Failed to set default address.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDefault = async (id) => {
        setLoading(true);
        setError(null);
        try {
            // --- TODO: Replace with actual API call to unset default ---
            // Example: await fetch(`/api/users/addresses/${id}/unset-default`, { method: 'PUT' });
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
            // --- End of TODO ---

            // Update local state: Find the address and set isDefault to false
            setAddresses(prevAddresses =>
                prevAddresses.map(address =>
                    address.id === id ? { ...address, isDefault: false } : address
                )
            );
        } catch (err) {
            setError('Failed to remove default status.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

        if (loading && addresses.length === 0) {
            return <div>Loading addresses...</div>;
        }
    
        return (
            <div className="manage-addresses-container">
                <h2>Manage Addresses</h2>
    
                {error && <div className="error-message">{error}</div>}
    
                <AddAddressForm
                    onSubmit={handleAddAddress}
                    newAddress={newAddress}
                    onInputChange={handleInputChange}
                    onCheckboxChange={handleCheckboxChange}
                />
    
                {/* Only keep ONE address list rendering block */}
                <div className="address-list">
                    <h3>Saved Addresses</h3>
                    {addresses.length === 0 && !loading && <p>No addresses saved yet.</p>}
                    {addresses.map(address => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            onSetDefault={handleSetDefault}
                            onRemoveDefault={handleRemoveDefault}
                            onDelete={handleDeleteAddress}
                        />
                    ))}
                    {loading && addresses.length > 0 && <p>Updating...</p>} {/* Show subtle loading during updates */}
                </div>
    
            </div>
        );
    };
    

export default ManageAddresses;
