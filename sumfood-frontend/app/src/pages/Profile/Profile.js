import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';

const Profile = () => {
    const [activeSection, setActiveSection] = useState('personal');
    const [username, setUsername] = useState('User');
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const renderContent = () => {
        switch (activeSection) {
            case 'Personal Information':
                return <div>Personal Information Content</div>;
            case 'Manage Adresses':
                return <div>Adresses</div>;
            case 'Payment Methods':
                return <div>Payment Methods</div>;
            case 'Settings':
                return <div>Account Settings Content</div>;
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
                        onClick={() => setActiveSection('personal')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'personal' ? '#e0e0e0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Personal Information
                    </button>
                    <button 
                        onClick={() => setActiveSection('orders')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'orders' ? '#e0e0e0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Order History
                    </button>
                    <button 
                        onClick={() => setActiveSection('favorites')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'favorites' ? '#e0e0e0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Favorites
                    </button>
                    <button 
                        onClick={() => setActiveSection('settings')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: activeSection === 'settings' ? '#e0e0e0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Account Settings
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
