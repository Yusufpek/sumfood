// pages/CourierDashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourierNavbar from '../components/layout/CourierNavbar';

function CourierDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Basic authentication check
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
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <CourierNavbar currentPage="dashboard" />
    </>
  );
}

export default CourierDashboard;