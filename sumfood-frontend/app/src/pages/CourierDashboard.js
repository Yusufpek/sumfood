// pages/CourierDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourierNavbar from '../components/layout/CourierNavbar';
import './CourierDashboard.css';

function CourierDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      return;
    }

    // Fetch active orders from API
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('http://localhost:8080/api/order/orders/active', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'COURIER'
          }
        });
        
        setOrders(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('userType');
          navigate('/login');
        }
      }
    };

    fetchOrders();
  }, [navigate, refreshTrigger]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleAcceptOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setAssigningOrder(true);
      
      await axios.post(
        `http://localhost:8080/api/courier/assign_order/${orderId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'COURIER'
          }
        }
      );
      
      // Close the modal and refresh orders
      setSelectedOrder(null);
      setRefreshTrigger(prev => prev + 1);
      
      // Show success message (you could implement a toast notification here)
      alert('Order accepted successfully!');
      
    } catch (err) {
      console.error('Error accepting order:', err);
      alert(`Failed to accept order: ${err.response?.data || 'Unknown error'}`);
    } finally {
      setAssigningOrder(false);
    }
  };

  // Get status display text
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'READY':
      case 'READY_FOR_PICKUP':
        return 'Ready for pickup';
      case 'ON_THE_WAY':
        return 'In delivery';
      default:
        return status?.replace(/_/g, ' ') || 'Unknown';
    }
  };

  return (
    <>
      <CourierNavbar currentPage="dashboard" />
      <div className="courier-dashboard">
        <div className="dashboard-header">
          <h1>Courier Dashboard</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="recent-orders">
          <h3>Available Orders</h3>
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="orders-list">No orders available at the moment.</div>
          ) : (
            <div className="orders-container">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="order-item" 
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="order-header">
                    <h4>{order.restaurantName}</h4>
                    <span className={`order-status status-${order.status?.toLowerCase().replace(/[\s_]/g, '-')}`}>
                      {getStatusDisplay(order.status)}
                    </span>
                  </div>
                  <div className="order-details-preview">
                    <p><strong>Order #:</strong> {order.id}</p>
                    <p><strong>Customer:</strong> {order.customerName}</p>
                    <p><strong>Time:</strong> {new Date(order.orderDate).toLocaleTimeString()}</p>
                    {order.estimatedDeliveryTime && (
                      <p><strong>Est. Delivery:</strong> {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="order-details-modal">
            <div className="order-details-content">
              <button className="close-button" onClick={closeOrderDetails}>×</button>
              <h3>Order Details - #{selectedOrder.id}</h3>
              
              <div className="order-details-section" style={{ background: 'transparent' }}>
                <h4>Restaurant</h4>
                <p>{selectedOrder.restaurantName}</p>
                
                <h4>Customer</h4>
                <p>{selectedOrder.customerName}</p>
                
                <h4>Delivery Address</h4>
                <p>{selectedOrder.deliveryAddress || 'Address not available'}</p>
                
                <h4>Status</h4>
                <p>{getStatusDisplay(selectedOrder.status)}</p>
                
                <h4>Order Items</h4>
                <ul className="order-items-list">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                
                <div className="order-total">
                  <h4>Total Amount</h4>
                  <p>${Number(selectedOrder.totalAmount).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="order-actions">
                <button 
                  className={`primary-button ${assigningOrder ? 'loading' : ''}`}
                  onClick={() => handleAcceptOrder(selectedOrder.id)}
                  disabled={assigningOrder || selectedOrder.status !== 'READY' && selectedOrder.status !== 'READY_FOR_PICKUP'}
                >
                  {assigningOrder ? 'Processing...' : 'Accept Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CourierDashboard;