import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import ManageAddresses from './sections/ManageAddresses';
import PaymentMethods from './sections/PaymentMethods';
import PersonalInformation from './sections/PersonalInformation';

const Profile = () => {
    const [activeSection, setActiveSection] = useState('Personal Information');
    const [username, setUsername] = useState('User');
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const renderContent = () => {
        switch (activeSection) {
            case 'Personal Information':
                return <PersonalInformation />;
            case 'Manage Adresses':
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
                        onClick={() => setActiveSection('Manage Adresses')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'Manage Adresses' ? '#e0e0e0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Manage Adresses
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
