import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';

const ProfileDropdown = ({ username }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    
    // Additional items that might be stored
    localStorage.removeItem('user');
    
    console.log('User logged out successfully');
    
    // Close dropdown
    setShowDropdown(false);
    
    // Redirect to login page
    navigate('/login');
  };
  
  return (
    <div className="profile-dropdown-container">
      <button 
        className="profile-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {username} ▼
      </button>
      {showDropdown && (
        <div className="profile-dropdown">
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Order History</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/notifications">Notifications (3)</Link>
          <button 
            className="logout-button" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
