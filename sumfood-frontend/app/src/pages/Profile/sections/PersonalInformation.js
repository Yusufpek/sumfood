import React, { useState } from 'react';
import { styles } from './PersonalInformation.styles';
import StandardizedInput from '../../../components/common/StandardizedInput';

const PersonalInformation = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add API call to update personal information
        setMessage({ type: 'success', text: 'Personal information updated successfully' });
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Personal Information</h2>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <StandardizedInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                />
                <StandardizedInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                />
                <StandardizedInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
                <StandardizedInput
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                />

                {message.text && (
                    <div style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        {message.text}
                    </div>
                )}

                <div style={styles.buttonContainer}>
                    <button
                        type="submit"
                        style={{ ...styles.button, ...styles.primaryButton }}
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        style={{ ...styles.button, ...styles.secondaryButton }}
                        onClick={() => setFormData({
                            firstName: '',
                            lastName: '',
                            email: '',
                            phone: ''
                        })}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PersonalInformation; 