import React, { useState } from 'react';

const PersonalInformation = () => {
    // Mock data - TODO: Replace with API call to fetch user data
    const [userData, setUserData] = useState({
        name: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '5055055555'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add API call to update user information
        // Example: PUT /api/users/profile
        console.log('Submitting user data:', userData);
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    return (
        <div className="personal-information" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Personal Information</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <div>
                    <label style={labelStyle}>
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        Last Name
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleInputChange}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={userData.phoneNumber}
                        onChange={handleInputChange}
                        style={inputStyle}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default PersonalInformation; 