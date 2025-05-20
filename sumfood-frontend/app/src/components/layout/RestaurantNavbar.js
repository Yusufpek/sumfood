import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './RestaurantNavbar.css';

const RestaurantNavbar = ({ restaurantName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="restaurant-navbar">
      <div className="restaurant-navbar-container">
        <div className="restaurant-navbar-logo">
          <Link to="/restaurant-dashboard">
            SumFood <span className="restaurant-portal">Restaurant Portal</span>
          </Link>
        </div>

        <div className="restaurant-navbar-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`restaurant-navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className={isActive('/restaurant-dashboard') ? 'active' : ''}>
            <Link to="/restaurant-dashboard">Dashboard</Link>
          </li>
          <li className={isActive('/restaurant-dashboard/orders') ? 'active' : ''}>
            <Link to="/restaurant-dashboard/orders">Orders</Link>
          </li>
          <li className={isActive('/restaurant-dashboard/menu') ? 'active' : ''}>
            <Link to="/restaurant-dashboard/menu">Menu</Link>
          </li>
          <li className={isActive('/restaurant-dashboard/spinwheel') ? 'active' : ''}>
            <Link to="/restaurant-dashboard/spinwheel">Spinwheel</Link>
          </li>
        </ul>

        <div className="restaurant-navbar-user">
          <span className="restaurant-name">{restaurantName || 'Restaurant'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default RestaurantNavbar;
