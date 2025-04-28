import React, { useState, useEffect } from 'react';
import './PersonalInformation.css';
import StandardizedInput from '../../../components/common/StandardizedInput';
import axios from 'axios';

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

    // Fetch personal information data from backend on component mount
    useEffect(() => {
        const fetchPersonalInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
                if (!token) {
                    setMessage({ type: 'error', text: 'Not authenticated' });
                    return;
                }
                
                try {
                    const response = await axios.get('http://localhost:8080/api/customer/', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Role': 'CUSTOMER'
                        }
                    });
                    
                    setFormData({
                        firstName: response.data.firstName || '',
                        lastName: response.data.lastName || '',
                        email: response.data.email || '',
                        phone: response.data.phoneNumber || ''
                    });
                    
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setMessage({ 
                            type: 'error', 
                            text: 'Customer profile endpoint not found. The API server might be down or the endpoint has changed.' 
                        });
                        console.error('API endpoint not found:', error);
                    } else {
                        setMessage({ 
                            type: 'error', 
                            text: error.response?.data?.message || error.message || 'Failed to load personal information' 
                        });
                        console.error('Error fetching customer data:', error);
                    }
                }
            } catch (error) {
                setMessage({ 
                    type: 'error', 
                    text: 'An unexpected error occurred. Please try again later.' 
                });
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchPersonalInfo();
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
        
        const updatePersonalInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setMessage({ type: 'error', text: 'Not authenticated' });
                    return;
                }

                await axios.put('http://localhost:8080/api/customer/', {
                    name: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phone
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                });
                
                setMessage({ type: 'success', text: 'Personal information updated successfully' });
            } catch (error) {
                setMessage({ 
                    type: 'error', 
                    text: error.response?.data?.message || 'An error occurred while updating information' 
                });
            } finally {
                setLoading(false);
            }
        };
        
        updatePersonalInfo();
    };

    return (
        <div className="personal-info">
            <h2>Personal Information</h2>
            
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
                    disabled
                    readOnly
                    tabIndex="-1"
                    className="disabled-input non-clickable"
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
        </div>
    );
};

export default PersonalInformation;