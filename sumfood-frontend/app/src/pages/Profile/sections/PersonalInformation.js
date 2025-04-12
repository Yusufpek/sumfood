import React, { useState, useEffect } from 'react';
import './PersonalInformation.css';
import StandardizedInput from '../../../components/common/StandardizedInput';

const PersonalInformation = () => {
    // State for personal information form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // TODO: API Integration - Fetch personal information data from backend on component mount
    useEffect(() => {
        // TODO: Implement API call to fetch section data
        // GET /api/sections/personal-information
        // Example:
        // const fetchPersonalInfo = async () => {
        //     try {
        //         setLoading(true);
        //         const response = await fetch('/api/sections/personal-information');
        //         const data = await response.json();
        //         setFormData(data);
        //     } catch (error) {
        //         setMessage({ type: 'error', text: 'Failed to load personal information' });
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // 
        // fetchPersonalInfo();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // TODO: API Integration - Update personal information section
        // PUT /api/sections/personal-information
        // Example implementation:
        // const updatePersonalInfo = async () => {
        //     try {
        //         setLoading(true);
        //         const response = await fetch('/api/sections/personal-information', {
        //             method: 'PUT',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${authToken}`
        //             },
        //             body: JSON.stringify(formData)
        //         });
        //         
        //         if (response.ok) {
        //             setMessage({ type: 'success', text: 'Personal information updated successfully' });
        //         } else {
        //             const errorData = await response.json();
        //             setMessage({ type: 'error', text: errorData.message || 'Failed to update information' });
        //         }
        //     } catch (error) {
        //         setMessage({ type: 'error', text: 'An error occurred while updating information' });
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        //
        // updatePersonalInfo();
        
        // Temporary success message until API is implemented
        setMessage({ type: 'success', text: 'Personal information updated successfully' });
    };

    return (
        <div className="personal-info">
            <h2>Personal Information</h2>
            
            {/* TODO: Add loading indicator when fetching or updating data */}
            {loading && <div className="loading-indicator">Loading...</div>}
            
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
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
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
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
            
            {/* TODO: Add confirmation modal for deleting section if needed */}
            {/* 
            DELETE /api/sections/personal-information
            Example implementation for delete functionality would go here
            */}
        </div>
    );
};

export default PersonalInformation; 