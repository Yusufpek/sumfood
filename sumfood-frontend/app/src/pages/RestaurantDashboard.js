import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantNavbar from '../components/layout/RestaurantNavbar';
import '../styles/restaurant-dashboard.css';
import { Map, Marker } from '@vis.gl/react-google-maps';

function RestaurantDashboard() {
  const [restaurantInfo, setRestaurantInfo] = useState({});
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

    // Fetch restaurant data
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/restaurant/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT' 
          }
        });
        setRestaurantInfo(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('userType');
          setError('Authentication failed. Please login again.');
          navigate('/login');
        } else {
          setError('Failed to load restaurant information');
          setLoading(false);
        }
      }
    };

    fetchRestaurantData();
  }, [navigate]);

  if (loading) return (
    <>
      <RestaurantNavbar restaurantName="Loading..." currentPage="dashboard" />
      <div className="loading">Loading...</div>
    </>
  );
  
  if (error) return (
    <>
      <RestaurantNavbar restaurantName="Error" currentPage="dashboard" />
      <div className="error">{error}</div>
    </>
  );

  return (
    <>
      <RestaurantNavbar restaurantName={restaurantInfo.displayName || 'Your Restaurant'} currentPage="dashboard" />
      <div className="restaurant-dashboard">
        <header className="dashboard-header">
          <h1>Restaurant Dashboard</h1>
          {isAuthenticated && (
            <div className="auth-status">
              <span className="status-badge">Authenticated ✓</span>
            </div>
          )}
        </header>

        <div className="restaurant-info">
          <h2>{restaurantInfo.address || 'Your Restaurant'}</h2>
          <p className="restaurant-description">{restaurantInfo.description || 'Restaurant description'}</p>
        </div>

        <div className="map-container">
          <Map
            defaultCenter={{ lat: restaurantInfo.latitude || 0, lng: restaurantInfo.longitude || 0 }}
            defaultZoom={17}
            style={{ width: '100%', height: '400px'}}
          >
            <Marker
              position={{ lat: restaurantInfo.latitude || 0, lng: restaurantInfo.longitude || 0 }}
              title={restaurantInfo.displayName || 'Restaurant Location'}
            />
          </Map>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate('/restaurant-dashboard/orders')}>
            <h3>Orders</h3>
            <p>Manage incoming orders</p>
            <div className="card-icon">📋</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/restaurant-dashboard/menu')}>
            <h3>Menu</h3>
            <p>Update your restaurant menu</p>
            <div className="card-icon">🍽️</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/restaurant-dashboard/profile')}>
            <h3>Profile</h3>
            <p>Edit restaurant information</p>
            <div className="card-icon">🏪</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/restaurant-dashboard/analytics')}>
            <h3>Analytics</h3>
            <p>View sales and performance reports</p>
            <div className="card-icon">📊</div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-feed">
            <p>No recent activity to show</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default RestaurantDashboard;
