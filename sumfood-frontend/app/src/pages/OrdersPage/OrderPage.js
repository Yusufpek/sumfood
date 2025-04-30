import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './OrdersPage.css';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchActiveOrders = async () => {
      if (!isLoggedIn) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/order/orders', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setActiveOrders(ordersData);
      } catch (err) {
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
    fetchActiveOrders();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchPastOrders = async () => {
      if (!isLoggedIn) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/order/orders', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setPastOrders(ordersData);
      } catch (err) {
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
    fetchPastOrders();
  }, [isLoggedIn, navigate]);

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

  const getStatusDisplayName = (status) => {
    if (!status) return 'Processing';
    
    // Convert underscores to spaces and capitalize each word
    return status.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPaymentStatusClass = (status) => {
    if (!status) return 'payment-pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid') || statusLower.includes('complete')) {
      return 'payment-complete';
    } else if (statusLower.includes('fail')) {
      return 'payment-failed';
    } else {
      return 'payment-pending';
    }
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };

  const renderOrderItems = (items) => {
    if (!items || items.length === 0) {
      return <li className="no-items">No items available</li>;
    }
    
    return items.map((item, idx) => (
      <li key={idx} className="order-item">
        <span className="item-name">{item.name || item.foodItemName || 'Unknown Item'}</span>
        <span className="item-quantity">× {item.quantity || 1}</span>
        <span className="item-price">${Number(item.price || 0).toFixed(2)}</span>
      </li>
    ));
  };

  return (
    <div className="orders-page-container">
      <Navbar />
      <main className="orders-main-content">
        <h2>Your Orders</h2>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        ) : activeOrders.length === 0  && pastOrders.length === 0 ? (
          <div className="no-orders-container">
            <p>You have not placed any orders yet.</p>
            <button 
              className="browse-foods-btn"
              onClick={() => navigate('/main')}
            >
              Browse Food Items
            </button>
          </div>
        ) : (
          <>
            <section>
              <h3>Active Orders</h3>
              {activeOrders.length === 0 ? (
                <p>No active orders.</p>
              ) : (
                <div className="orders-table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Restaurant</th>
                        <th>Date</th>
                        <th>Order Status</th>
                        <th>Payment Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id || 'N/A'}</td>
                          <td>{order.restaurantName || 'Unknown Restaurant'}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <span className={`status-badge status-${((order.orderStatus || order.status) || 'processing').toLowerCase().replace(/_/g, '-')}`}>
                              {getStatusDisplayName(order.orderStatus || order.status)}
                            </span>
                          </td>
                          <td>
                            <span className={getPaymentStatusClass(order.paymentStatus)}>
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </td>
                          <td>${Number(order.totalPrice || 0).toFixed(2)}</td>
                          <td>
                            <button 
                              className="track-order-btn"
                              onClick={() => handleTrackOrder(order.id)}
                            >
                              Track Order
                            </button>
                            <details>
                              <summary>View Items</summary>
                              <div className="order-details-panel">
                                <ul className="order-items-list">
                                  {renderOrderItems(order.foodItems)}
                                </ul>
                                {(order.deliveryAddress || order.address) && (
                                  <div className="delivery-info">
                                    <strong>Delivery Address:</strong> {order.deliveryAddress || order.address}
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
            </section>
            <section>
              <h3>Order History</h3>
              {pastOrders.length === 0 ? (
                <p>No past orders.</p>
              ) : (
                <div className="orders-table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Restaurant</th>
                        <th>Date</th>
                        <th>Order Status</th>
                        <th>Payment Status</th>
                        <th>Total</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id || 'N/A'}</td>
                          <td>{order.restaurantName || 'Unknown Restaurant'}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <span className={`status-badge status-${((order.orderStatus || order.status) || 'completed').toLowerCase().replace(/_/g, '-')}`}>
                              {getStatusDisplayName(order.orderStatus || order.status)}
                            </span>
                          </td>
                          <td>
                            <span className={getPaymentStatusClass(order.paymentStatus)}>
                              {order.paymentStatus || 'N/A'}
                            </span>
                          </td>
                          <td>${Number(order.totalPrice || 0).toFixed(2)}</td>
                          <td>
                            <details>
                              <summary>View Items</summary>
                              <div className="order-details-panel">
                                <ul className="order-items-list">
                                  {renderOrderItems(order.foodItems)}
                                </ul>
                                {(order.deliveryAddress || order.address) && (
                                  <div className="delivery-info">
                                    <strong>Delivery Address:</strong> {order.deliveryAddress || order.address}
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
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;