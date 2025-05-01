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

        // Process orders to use consistent field names
        const processedOrders = (ordersResponse.data || []).map(order => ({
          ...order,
          id: order.id,
          status: order.orderStatus || order.status, // Support both field names
          items: order.foodItems || order.items || [], // Support both field names
          totalAmount: order.totalPrice || order.totalAmount || 0, // Support both field names
          customerName: order.customerName || 'Unknown Customer',
          customerPhone: order.customerPhone || 'No Phone'
        }));
        
        setOrders(processedOrders);
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
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      
      // The backend expects the URL format with '&' between id and status
      // Let's ensure it's properly formatted and logged for debugging
      const url = `http://localhost:8080/api/restaurant/orders/${orderId}&${newStatus}`;
      console.log(`Calling API: ${url}`);
      
      const response = await axios.put(
        url,
        {}, // Empty body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Response:', response.data);
      
      // Refresh orders after status update
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error updating order status:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to update order status: ${err.response?.data || err.message}`);
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
    const orderStatus = order.status || order.orderStatus || '';
    
    switch(orderStatus) {
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
      case 'READY_FOR_PICKUP':
        // Removed the complete order button
        return null;
      default:
        return null;
    }
  };

  const getOrdersByStatus = (status) => {
    if (!Array.isArray(orders)) {
      console.error('orders is not an array:', orders);
      return [];
    }
    
    return orders.filter(order => {
      // Check both field names to ensure we catch the status regardless of naming
      const orderStatus = order.status || order.orderStatus || '';
      return orderStatus === status;
    });
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
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
                      <span className="order-date">{formatOrderDate(order.orderDate || order.createdAt)}</span>
                    </div>
                    <div className="order-address">
                      <h4>Address:</h4>
                      <p>{order.address || 'No address provided'}</p>
                    </div>
                    <div className="order-items">
                      <h4>Items:</h4>
                      <ul>
                        {Array.isArray(order.items || order.foodItems) ? (order.items || order.foodItems).map((item, idx) => (
                          <li key={idx}>
                            {(item.quantity || item.amount || 1)}x {item.name || item.foodItemName} 
                            {item.price !== undefined && ` - $${item.price.toFixed(2)}`}
                          </li>
                        )) : <li>No items information</li>}
                      </ul>
                    </div>
                    <div className="order-total">
                      <p><strong>Total:</strong> ${(order.totalAmount || order.totalPrice || 0).toFixed(2)}</p>
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
                      <span className="order-date">{formatOrderDate(order.orderDate)}</span>
                    </div>
                    <div className="order-items">
                      <h4>Items:</h4>
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.quantity}x {item.name}</li>
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
                      <span className="order-date">{formatOrderDate(order.orderDate || order.createdAt)}</span>
                    </div>
                    <div className="order-address">
                      <h4>Address:</h4>
                      <p>{order.address || 'No address provided'}</p>
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
            <h2>Completed Orders</h2>
            {getOrdersByStatus('DELIVERED').length === 0 ? (
              <div className="no-orders">No completed orders</div>
            ) : (
              <div className="orders-list completed-list">
                {getOrdersByStatus('DELIVERED').map(order => (
                  <div key={order.id} className="order-card completed">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                      <span className="order-date">{formatOrderDate(order.orderDate || order.createdAt)}</span>
                    </div>
                    <div className="order-address">
                      <h4>Address:</h4>
                      <p>{order.address || 'No address provided'}</p>
                    </div>
                    <div className="order-items">
                      <h4>Items:</h4>
                      <ul>
                        {Array.isArray(order.items || order.foodItems) ? (order.items || order.foodItems).map((item, idx) => (
                          <li key={idx}>
                            {(item.quantity || item.amount || 1)}x {item.name || item.foodItemName} 
                            {item.price !== undefined && ` - $${item.price.toFixed(2)}`}
                          </li>
                        )) : <li>No items information</li>}
                      </ul>
                    </div>
                    <div className="order-total">
                      <p><strong>Total:</strong> ${(order.totalAmount || order.totalPrice || 0).toFixed(2)}</p>
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
