import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ManageAddresses from './sections/ManageAddresses';
import PaymentMethods from './sections/PaymentMethods';
import PersonalInformation from './sections/PersonalInformation';

const Profile = () => {
    const [activeSection, setActiveSection] = useState('Personal Information');
    const [username, setUsername] = useState('User');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const location = useLocation();
    
    // Check if we were redirected with a specific section to show
    useEffect(() => {
        if (location.state && location.state.activeSection) {
            setActiveSection(location.state.activeSection);
        }
    }, [location]);

    const renderContent = () => {
        switch (activeSection) {
            case 'Personal Information':
                return <PersonalInformation />;
            case 'Manage Addresses': // Fixed typo from 'Adresses' to 'Addresses'
                return <ManageAddresses />;
            case 'Payment Methods':
                return <PaymentMethods />;
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div>
            <Navbar isLoggedIn={isLoggedIn} username={username} />
            <div className="profile-container" style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
                <div className="sidebar" style={{ 
                    width: '250px', 
                    backgroundColor: '#f5f5f5', 
                    padding: '20px',
                    borderRight: '1px solid #ddd'
                }}>
                    <button 
                        onClick={() => setActiveSection('Personal Information')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'Personal Information' ? '#e0e0e0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Personal Information
                    </button>
                    <button 
                        onClick={() => setActiveSection('Manage Addresses')} // Fixed typo here too
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'Manage Addresses' ? '#e0e0e0' : 'white', // Fixed here
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Manage Addresses {/* Fixed typo here */}
                    </button>
                    <button 
                        onClick={() => setActiveSection('Payment Methods')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'Payment Methods' ? '#e0e0e0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Payment Methods
                    </button>
                </div>
                <div className="content-area" style={{ 
                    flex: 1, 
                    padding: '20px',
                    backgroundColor: 'white'
                }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
