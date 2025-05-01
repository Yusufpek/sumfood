import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import CartDropdown from '../ui/cartDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    
    // Additional items that might be stored
    localStorage.removeItem('user');
    
    // Notify user of successful logout (optional)
    alert('You have been logged out successfully.');
    
    // Redirect to login page
    navigate('/login');
  }

  return (
    <nav className="main-navbar">
      <div className="navbar-logo">
        <Link to="/main">SumFood</Link>
      </div>
      <div className="navbar-links">
        <Link to="/profile">Profile</Link>
        <Link to="/orders">Order History</Link>
        <CartDropdown />
        <button 
          className="logout-button" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
