import React, { useState } from 'react';

const ManageAddresses = () => {
    // Mock data - TODO: Replace with API call to fetch user addresses
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            title: 'Home',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            isDefault: true
        },
        {
            id: 2,
            title: 'Work',
            address: '456 Business Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            isDefault: false
        }
    ]);

    const [newAddress, setNewAddress] = useState({
        title: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        // TODO: Add API call to create new address
        // Example: POST /api/users/addresses
        const newId = Math.max(...addresses.map(a => a.id)) + 1;
        setAddresses([...addresses, { ...newAddress, id: newId }]);
        setNewAddress({
            title: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            isDefault: false
        });
    };

    const handleDeleteAddress = (id) => {
        // TODO: Add API call to delete address
        // Example: DELETE /api/users/addresses/{id}
        setAddresses(addresses.filter(address => address.id !== id));
    };

    const handleSetDefault = (id) => {
        // TODO: Add API call to set default address
        // Example: PUT /api/users/addresses/{id}/default
        setAddresses(addresses.map(address => ({
            ...address,
            isDefault: address.id === id
        })));
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '15px',
        boxSizing: 'border-box',
        height: '40px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold'
    };

    const formStyle = {
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    };

    const addressCardStyle = {
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
    };

    const buttonStyle = {
        padding: '5px 10px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    return (
        <div className="manage-addresses" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Manage Addresses</h2>
            
            {/* Add New Address Form */}
            <form onSubmit={handleAddAddress} style={formStyle}>
                <h3 style={{ marginBottom: '15px' }}>Add New Address</h3>
                <div>
                    <label style={labelStyle}>
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={newAddress.title}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        Address
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={newAddress.address}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        City
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        State
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={newAddress.state}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        ZIP Code
                    </label>
                    <input
                        type="text"
                        name="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        />
                        Set as default address
                    </label>
                </div>
                <button
                    type="submit"
                    style={{
                        ...buttonStyle,
                        padding: '10px 20px',
                        backgroundColor: '#28a745'
                    }}
                >
                    Add Address
                </button>
            </form>

            {/* Address List */}
            <div>
                <h3 style={{ marginBottom: '15px' }}>Saved Addresses</h3>
                {addresses.map(address => (
                    <div key={address.id} style={addressCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0 }}>{address.title}</h4>
                            {address.isDefault && (
                                <span style={{ 
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}>
                                    Default
                                </span>
                            )}
                        </div>
                        <p style={{ margin: '5px 0' }}>{address.address}</p>
                        <p style={{ margin: '5px 0' }}>{address.city}, {address.state} {address.zipCode}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {!address.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(address.id)}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#007bff'
                                    }}
                                >
                                    Set as Default
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteAddress(address.id)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#dc3545'
                                }}
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