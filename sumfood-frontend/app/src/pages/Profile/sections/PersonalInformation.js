import React, { useState } from 'react';
import './PersonalInformation.css';
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
        <div className="personal-info">
            <h2>Personal Information</h2>
            
            <form className="info-form" onSubmit={handleSubmit}>
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
                    <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                        {message.text}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
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