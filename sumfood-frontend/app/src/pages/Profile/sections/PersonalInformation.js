import React from 'react';

const PersonalInformation = () => {
    return (
        <div className="personal-information" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Personal Information</h2>
            <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <p>This section will contain personal information details.</p>
            </div>
        </div>
    );
};

export default PersonalInformation; 