// pages/CourierDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourierNavbar from '../components/layout/CourierNavbar';
import '../pages/CourierDashboard.css';

function CourierDashboard() {
  const [courierInfo, setCourierInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check if token is expired
    if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userType');
      setError('Session expired. Please login again.');
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);

    // Fetch courier data
    const fetchCourierData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/courier/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'COURIER'
          }
        });
        setCourierInfo(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courier data:', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('userType');
          setError('Authentication failed. Please login again.');
          navigate('/login');
        } else {
          setError('Failed to load courier information');
          setLoading(false);
        }
      }
    };

    fetchCourierData();
  }, [navigate]);

  if (loading) return (
    <>
      <CourierNavbar courierName="Loading..." currentPage="dashboard" />
      <div className="loading">Loading...</div>
    </>
  );
  
  if (error) return (
    <>
      <CourierNavbar courierName="Error" currentPage="dashboard" />
      <div className="error">{error}</div>
    </>
  );

  return (
    <>
      <CourierNavbar courierName={courierInfo.name || 'Courier'} currentPage="dashboard" />
      <div className="courier-dashboard">
        <header className="dashboard-header">
          <h1>Courier Dashboard</h1>
          {isAuthenticated && (
            <div className="auth-status">
              <span className="status-badge">Authenticated ✓</span>
            </div>
          )}
        </header>

        <div className="courier-info">
          <h2>Welcome, {courierInfo.name || 'Courier'}!</h2>
          <p className="courier-status">
            Status: <span className="status-active">Active</span>
          </p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate('/courier-dashboard/orders')}>
            <h3>Current Orders</h3>
            <p>View and manage your current orders</p>
            <div className="card-icon">📦</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/courier-dashboard/availability')}>
            <h3>Availability</h3>
            <p>Set your working hours</p>
            <div className="card-icon">⏰</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/courier-dashboard/earnings')}>
            <h3>Earnings</h3>
            <p>View your earnings and statistics</p>
            <div className="card-icon">💰</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/courier-dashboard/profile')}>
            <h3>Profile</h3>
            <p>Update your courier information</p>
            <div className="card-icon">👤</div>
          </div>
        </div>

        <div className="recent-orders">
          <h3>Recent Orders</h3>
          <div className="orders-list">
            <p>No recent orders to show</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourierDashboard;