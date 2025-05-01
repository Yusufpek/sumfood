// components/layout/CourierNavbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CourierNavbar.css';

function CourierNavbar({ currentPage = 'dashboard' }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  return (
    <nav className="courier-navbar">
      <div className="courier-navbar-container">
        <div className="courier-navbar-logo">
          <Link to="/courier-dashboard">SumFood</Link>
          <span className="courier-portal">Courier Portal</span>
        </div>

        <ul className="courier-navbar-menu">
          <li className={currentPage === 'dashboard' ? 'active' : ''}>
            <Link to="/courier-dashboard">Dashboard</Link>
          </li>
          <li className={currentPage === 'orders' ? 'active' : ''}>
            <Link to="/courier-dashboard/orders">Orders</Link>
          </li>
          <li className={currentPage === 'availability' ? 'active' : ''}>
            <Link to="/courier-dashboard/availability">Availability</Link>
          </li>
          <li className={currentPage === 'earnings' ? 'active' : ''}>
            <Link to="/courier-dashboard/earnings">Earnings</Link>
          </li>
        </ul>

        <div className="courier-navbar-user">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default CourierNavbar;