import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantNavbar from '../components/layout/RestaurantNavbar';
import '../styles/restaurant-dashboard.css';

function RestaurantDashboard() {
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch restaurant data
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/restaurant/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setRestaurantInfo(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError('Failed to load restaurant information');
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [navigate]);


  if (loading) return (
    <>
      <RestaurantNavbar restaurantName="Loading..." />
      <div className="loading">Loading...</div>
    </>
  );
  
  if (error) return (
    <>
      <RestaurantNavbar restaurantName="Error" />
      <div className="error">{error}</div>
    </>
  );

  return (
    <>
      <RestaurantNavbar restaurantName={restaurantInfo.name || 'Your Restaurant'} />
      <div className="restaurant-dashboard">
        <header className="dashboard-header">
          <h1>Restaurant Dashboard</h1>
        </header>

        <div className="restaurant-info">
          <h2>{restaurantInfo.name || 'Your Restaurant'}</h2>
          <p>{restaurantInfo.description || 'Restaurant description'}</p>
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
