import React from 'react';
import { Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import './Navbar.css';

const Navbar = ({ isLoggedIn, username }) => {
  return (
    <nav className="main-navbar">
      <div className="navbar-logo">
        <Link to="/">SumFood</Link>
      </div>
      <div className="navbar-links">
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        
        {isLoggedIn ? (
          <ProfileDropdown username={username} />
        ) : (
          <>
            <Link to="/login" className="auth-button login-button">
              Login
            </Link>
            <Link to="/register" className="auth-button register-button">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
