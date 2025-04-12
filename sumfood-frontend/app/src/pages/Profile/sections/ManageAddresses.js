import React, { useState } from 'react';
import { styles } from './ManageAddresses.styles';
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

    const [newAddress, setNewAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        postalCode: '',
        isDefault: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'postalCode' && value.length > 5) return;
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            // TODO: Add API call to create new address
            // Example: POST /api/users/addresses
            // const response = await axios.post('/api/users/addresses', newAddress);
            // const addedAddress = response.data;

            const newId = Math.max(...addresses.map(a => a.id)) + 1;
            
            // If the new address is set as default, remove default from other addresses
            const updatedAddresses = addresses.map(address => ({
                ...address,
                isDefault: newAddress.isDefault ? false : address.isDefault
            }));

            // TODO: If new address is default, make API call to update other addresses' default status
            // Example: If newAddress.isDefault is true
            // await axios.put('/api/users/addresses/update-defaults', { newDefaultId: newId });

            setAddresses([...updatedAddresses, { ...newAddress, id: newId }]);
            setNewAddress({
                addressLine1: '',
                addressLine2: '',
                postalCode: '',
                isDefault: false
            });
        } catch (error) {
            console.error('Error adding address:', error);
            // TODO: Add error handling
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            // TODO: Add API call to delete address
            // Example: DELETE /api/users/addresses/{id}
            // await axios.delete(`/api/users/addresses/${id}`);

            const addressToDelete = addresses.find(addr => addr.id === id);
            const remainingAddresses = addresses.filter(address => address.id !== id);

            // If we're deleting the default address and there are other addresses,
            // make the first remaining address the default
            if (addressToDelete.isDefault && remainingAddresses.length > 0) {
                // TODO: Add API call to set new default address
                // Example: PUT /api/users/addresses/{remainingAddresses[0].id}/default
                // await axios.put(`/api/users/addresses/${remainingAddresses[0].id}/default`);
                remainingAddresses[0].isDefault = true;
            }

            setAddresses(remainingAddresses);
        } catch (error) {
            console.error('Error deleting address:', error);
            // TODO: Add error handling
        }
    };

    const handleToggleDefault = async (id) => {
        try {
            const currentAddress = addresses.find(addr => addr.id === id);
            
            // If this is the default address and it's the only address, don't allow removing default status
            if (currentAddress.isDefault && addresses.length === 1) {
                return;
            }

            if (currentAddress.isDefault) {
                const otherAddresses = addresses.filter(addr => addr.id !== id);
                // TODO: Add API call to set new default address and remove default from current
                // Example: PUT /api/users/addresses/update-defaults
                // await axios.put('/api/users/addresses/update-defaults', {
                //     newDefaultId: otherAddresses[0].id,
                //     removeDefaultId: id
                // });

                otherAddresses[0].isDefault = true;
                setAddresses([...otherAddresses, { ...currentAddress, isDefault: false }].sort((a, b) => a.id - b.id));
            } else {
                // TODO: Add API call to set new default address
                // Example: PUT /api/users/addresses/{id}/default
                // await axios.put(`/api/users/addresses/${id}/default`);

                setAddresses(addresses.map(address => ({
                    ...address,
                    isDefault: address.id === id
                })));
            }
        } catch (error) {
            console.error('Error updating default address:', error);
            // TODO: Add error handling
        }
    };

    return (
        <div className="manage-addresses" style={styles.container}>
            <h2 style={styles.title}>Manage Addresses</h2>
            
            <form onSubmit={handleAddAddress} style={styles.form}>
                <h3 style={styles.formTitle}>Add New Address</h3>
                <StandardizedInput
                    label="Address Line 1"
                    name="addressLine1"
                    value={newAddress.addressLine1}
                    onChange={handleInputChange}
                    required
                />
                <StandardizedInput
                    label="Address Line 2"
                    name="addressLine2"
                    value={newAddress.addressLine2}
                    onChange={handleInputChange}
                />
                <StandardizedInput
                    label="Postal Code"
                    name="postalCode"
                    value={newAddress.postalCode}
                    onChange={handleInputChange}
                    required
                    maxLength={5}
                />
                <div style={styles.checkboxContainer}>
                    <label style={styles.checkboxLabel}>
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
                    style={{ ...styles.button, ...styles.addButton }}
                >
                    Add Address
                </button>
            </form>

            <div>
                <h3 style={styles.formTitle}>Saved Addresses</h3>
                {addresses.map(address => (
                    <div key={address.id} style={styles.addressCard}>
                        <div style={styles.addressHeader}>
                            <h4 style={styles.addressTitle}>Address {address.id}</h4>
                            {address.isDefault && (
                                <span style={styles.defaultBadge}>
                                    Default
                                </span>
                            )}
                        </div>
                        <p style={styles.addressText}>{address.addressLine1}</p>
                        {address.addressLine2 && <p style={styles.addressText}>{address.addressLine2}</p>}
                        <p style={styles.addressText}>Postal Code: {address.postalCode}</p>
                        <div style={styles.buttonContainer}>
                            <button
                                onClick={() => handleToggleDefault(address.id)}
                                style={{
                                    ...styles.button,
                                    ...styles.setDefaultButton,
                                    backgroundColor: address.isDefault ? '#6c757d' : '#007bff'
                                }}
                            >
                                {address.isDefault ? 'Remove Default' : 'Set as Default'}
                            </button>
                            <button
                                onClick={() => handleDeleteAddress(address.id)}
                                style={{ ...styles.button, ...styles.deleteButton }}
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