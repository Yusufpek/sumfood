import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantNavbar from '../components/layout/RestaurantNavbar';
import '../styles/restaurant-orders.css';

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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

    // Fetch restaurant profile and orders
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get restaurant profile
        const restaurantResponse = await axios.get('http://localhost:8080/api/restaurant/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        setRestaurantInfo(restaurantResponse.data);

        // Get restaurant orders
        const ordersResponse = await axios.get('http://localhost:8080/api/restaurant/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        console.log('Orders:', ordersResponse.data);
        setOrders(ordersResponse.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('userType');
          navigate('/login');
        } else {
          setError('Failed to load orders');
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [navigate, refreshTrigger]);

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:8080/api/restaurant/orders/${orderId}&${newStatus}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        }
      );
      // Refresh orders after status update
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.delete(`http://localhost:8080/api/restaurant/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        // Refresh orders after cancellation
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error cancelling order:', err);
        setError('Failed to cancel order');
      }
    }
  };

  const getStatusActions = (order) => {
    switch (order.orderStatus) {
      case 'PENDING':
        return (
          <>
            <button
              className="status-action-btn accept"
              onClick={() => updateOrderStatus(order.id, 'PREPARING')}
            >
              Start Preparing
            </button>
            <button
              className="status-action-btn reject"
              onClick={() => cancelOrder(order.id)}
            >
              Reject Order
            </button>
          </>
        );

      case 'PREPARING':
        return (
          <button
            className="status-action-btn ready"
            onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
          >
            Mark as Ready
          </button>
        );
      default:
        return null;
    }
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.orderStatus === status);
  };

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return (
    <>
      <RestaurantNavbar restaurantName="Loading..." currentPage="orders" />
      <div className="loading">Loading orders...</div>
    </>
  );

  if (error) return (
    <>
      <RestaurantNavbar restaurantName="Error" currentPage="orders" />
      <div className="error">{error}</div>
    </>
  );

  return (
    <>
      <RestaurantNavbar restaurantName={restaurantInfo.displayName || 'Your Restaurant'} currentPage="orders" />
      <div className="restaurant-orders-container">
        <header className="orders-header">
          <h1>Order Management</h1>
        </header>

        <div className="orders-tabs">
          <div className="tab-section">
            <h2>New Orders</h2>
            {getOrdersByStatus('PENDING').length === 0 ? (
              <div className="no-orders">No new orders</div>
            ) : (
              <div className="orders-list">
                {getOrdersByStatus('PENDING').map(order => (
                  <div key={order.id} className="order-card pending">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                    </div>
                    <span className="order-date">{formatOrderDate(order.createdAt)}</span>
                    <div className="order-items">
                      <h4>Items:</h4>
                      <ul>
                        {(order.foodItems || []).map((item, idx) => (
                          <li key={idx}>
                            {item.amount}x {item.foodItemName} - ${item.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-total">
                      <p><strong>Total:</strong> ${order.totalPrice}</p>
                    </div>
                    <div className="order-actions">
                      {getStatusActions(order)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tab-section">
            <h2>In Preparation</h2>
            {getOrdersByStatus('PREPARING').length === 0 ? (
              <div className="no-orders">No orders in preparation</div>
            ) : (
              <div className="orders-list">
                {getOrdersByStatus('PREPARING').map(order => (
                  <div key={order.id} className="order-card preparing">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                    </div>
                    <span className="order-date">{formatOrderDate(order.createdAt)}</span>
                    <div className="order-items">
                      <h4>Items:</h4>
                      <ul>
                        {(order.foodItems || []).map((item, idx) => (
                          <li key={idx}>{item.amount}x {item.foodItemName}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-actions">
                      {getStatusActions(order)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tab-section">
            <h2>Ready for Pickup</h2>
            {getOrdersByStatus('READY_FOR_PICKUP').length === 0 ? (
              <div className="no-orders">No orders ready for pickup</div>
            ) : (
              <div className="orders-list">
                {getOrdersByStatus('READY_FOR_PICKUP').map(order => (
                  <div key={order.id} className="order-card ready">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                    </div>
                    <span className="order-date">{formatOrderDate(order.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tab-section">
            <h2>On The Way Orders</h2>
            {getOrdersByStatus('ON_THE_WAY').length === 0 ? (
              <div className="no-orders">No orders on the way right now</div>
            ) : (
              <div className="orders-list">
                {getOrdersByStatus('ON_THE_WAY').map(order => (
                  <div key={order.id} className="order-card ready">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                    </div>
                    <span className="order-date">{formatOrderDate(order.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tab-section">
            <h2>Completed Orders</h2>
            {getOrdersByStatus('DELIVERED').length === 0 ? (
              <div className="no-orders">No completed orders</div>
            ) : (
              <div className="orders-list completed-list">
                {getOrdersByStatus('DELIVERED').map(order => (
                  <div key={order.id} className="order-card completed">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                    </div>
                    <span className="order-date">{formatOrderDate(order.createdAt)}</span>
                    <div className="order-total">
                      <p><strong>Total:</strong> ${order.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RestaurantOrders;
