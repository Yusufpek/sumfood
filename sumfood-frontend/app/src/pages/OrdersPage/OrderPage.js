import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add navigation import
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './OrdersPage.css';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check login status first
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn) return;
      
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/orders/my', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
        
      } catch (err) {
        console.error("Error fetching orders:", err);
        let msg = 'Failed to load orders.';
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            navigate('/login');
            return;
          }
          if (err.response.data?.message) {
            msg = err.response.data.message;
          } else if (typeof err.response.data === 'string') {
            msg = err.response.data;
          } else {
            msg += ` (Error ${err.response.status})`;
          }
        } else if (err.request) {
          msg = 'Could not connect to server. Please try again later.';
        } else {
          msg = `Error: ${err.message}`;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isLoggedIn, navigate]);

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="orders-page-container">
      {}
      <Navbar isLoggedIn={isLoggedIn} username={username} />
      
      <main className="orders-main-content">
        <h2>Your Orders</h2>
        {loading ? (
          <div className="loading-container">
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-orders-container">
            <p>You have not placed any orders yet.</p>
            <button 
              className="browse-foods-btn"
              onClick={() => navigate('/')}
            >
              Browse Food Items
            </button>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Restaurant</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id || 'N/A'}</td>
                    <td>{order.restaurantName || 'Unknown Restaurant'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <span className={`status-badge status-${(order.status || 'processing').toLowerCase()}`}>
                        {order.status || 'Processing'}
                      </span>
                    </td>
                    <td>${(order.totalPrice || 0).toFixed(2)}</td>
                    <td>
                      <details>
                        <summary>View Items</summary>
                        <div className="order-details-panel">
                          <ul className="order-items-list">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <li key={idx} className="order-item">
                                  <span className="item-name">{item.name || item.foodItemName || 'Unknown Item'}</span>
                                  <span className="item-quantity">× {item.qty || 1}</span>
                                  <span className="item-price">${(item.price || 0).toFixed(2)}</span>
                                </li>
                              ))
                            ) : (
                              <li className="no-items">No items available</li>
                            )}
                          </ul>
                          {order.deliveryAddress && (
                            <div className="delivery-info">
                              <strong>Delivery Address:</strong> {order.deliveryAddress}
                            </div>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
