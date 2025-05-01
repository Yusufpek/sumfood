import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ManageAddresses from './sections/ManageAddresses';
import PaymentMethods from './sections/PaymentMethods';
import PersonalInformation from './sections/PersonalInformation';

// Extracted styles for better readability
const styles = {
    container: {
        display: 'flex',
        minHeight: 'calc(100vh - 64px)'
    },
    sidebar: {
        width: '250px',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRight: '1px solid #ddd'
    },
    sidebarButton: (isActive) => ({
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: isActive ? '#e0e0e0' : 'white',
        border: '1px solid #ddd',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'left',
        fontWeight: isActive ? 'bold' : 'normal'
    }),
    contentArea: {
        flex: 1,
        padding: '20px',
        backgroundColor: 'white'
    }
};

// Available profile sections
const SECTIONS = {
    PERSONAL_INFO: 'Personal Information',
    ADDRESSES: 'Manage Addresses',
    PAYMENT: 'Payment Methods'
};

const Profile = () => {
    const [activeSection, setActiveSection] = useState(SECTIONS.PERSONAL_INFO);
    const [username, setUsername] = useState('Guest');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login if not authenticated
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        
        setIsLoggedIn(true);
        // You could fetch the actual username from API here
        setUsername('User');
    }, [navigate, location.pathname]);
    
    // Set active section based on redirects
    useEffect(() => {
        if (location.state && location.state.activeSection) {
            setActiveSection(location.state.activeSection);
        }
    }, [location]);

    // Generate sidebar buttons from sections object
    const renderSidebarButtons = () => {
        return Object.values(SECTIONS).map(section => (
            <button 
                key={section}
                onClick={() => setActiveSection(section)}
                style={styles.sidebarButton(activeSection === section)}
            >
                {section}
            </button>
        ));
    };

    // Render section content based on active section
    const renderContent = () => {
        switch (activeSection) {
            case SECTIONS.PERSONAL_INFO:
                return <PersonalInformation />;
            case SECTIONS.ADDRESSES:
                return <ManageAddresses />;
            case SECTIONS.PAYMENT:
                return <PaymentMethods />;
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div>
            <Navbar isLoggedIn={isLoggedIn} username={username} />
            <div className="profile-container" style={styles.container}>
                <div className="sidebar" style={styles.sidebar}>
                    {renderSidebarButtons()}
                </div>
                <div className="content-area" style={styles.contentArea}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
