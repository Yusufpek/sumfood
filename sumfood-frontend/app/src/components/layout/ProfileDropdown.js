import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProfileDropdown.css';

const ProfileDropdown = ({ username }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
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
          <Link to="/Login">Logout</Link>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
