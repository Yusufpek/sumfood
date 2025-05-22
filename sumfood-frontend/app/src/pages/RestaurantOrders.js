import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantNavbar from '../components/layout/RestaurantNavbar';
import '../styles/restaurant-orders.css';

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [donatedFoodItems, setDonatedFoodItems] = useState([]);
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

        const donatedItemsResponse = await axios.get('http://localhost:8080/api/food/items/restaurant/donated', {
          headers: {'Authorization': `Bearer ${token}`, 'Role': 'RESTAURANT'}
        });
        setDonatedFoodItems(donatedItemsResponse.data || []);
        console.log('Donated Food Items:', donatedFoodItems);

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

        <div className="tab-section donated-items-inventory-section">
          <h2>Donated Items Inventory</h2>
          {loading && !donatedFoodItems.length ? (
            <p>Loading donated items list...</p>
          ) : !loading && donatedFoodItems.length === 0 ? (
            <div className="no-orders">No items currently marked for donation.</div>
          ) : (
            <div className="donated-items-grid">
              {donatedFoodItems.map(item => (
                <div key={item.foodItemId} className="donated-item-card">
                  {item.imageName && (
                    <div className="donated-item-image-container">
                      <img
                        src={`http://localhost:8080/api/food/public/image/${encodeURIComponent(item.restaurantName)}/${encodeURIComponent(item.imageName)}`}
                        alt={item.name}
                        className="donated-item-image"
                        onError={(e) => {e.target.src = '/placeholder-food.jpg';}}
                      />
                    </div>
                  )}
                  <div className="donated-item-details">
                    <span className="donated-item-name">{item.name}</span>
                    <span className="donated-item-category">
                      {(item.categories || []).join(', ') || 'Uncategorized'}
                    </span>
                    <span className="donated-item-stock">
                      Stock: {item.stock}
                    </span>
                    {item.description && (
                      <p className="donated-item-description">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="section-divider" />

        <div className="orders-tabs">
          <div className="tab-section">
            <h2>New Orders (Sales)</h2>
            {getOrdersByStatus('PENDING').filter(o => o.orderType !== 'DONATION').length === 0 ? (
              <div className="no-orders">No new sales orders</div>
            ) : (
              <div className="orders-list">
                {getOrdersByStatus('PENDING').filter(o => o.orderType !== 'DONATION').map(order => (
                  <div key={order.id} className="order-card pending">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                      {order.orderType === 'DONATION' && <span className="order-type-badge order-type-donation">Donation</span>}
                    </div>
                    <span className="order-date">{formatOrderDate(order.createdAt)}</span>
                    <div className="order-items">
                      <h4>Items:</h4>
                      <ul>
                        {(order.foodItems || []).map((item, idx) => (
                          <li key={idx}>
                            {item.amount}x {item.foodItemName} - ${item.price != null ? item.price.toFixed(2) : 'N/A'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-total">
                      <p><strong>Total:</strong> ${order.totalPrice != null ? order.totalPrice.toFixed(2) : 'N/A'}</p>
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
            {orders.filter(order => order.orderStatus === 'DELIVERED' && order.orderType !== 'DONATION').length === 0 ? (
              <div className="no-orders">No completed sales orders</div>
            ) : (
              <div className="orders-list completed-list">
                {orders.filter(order => order.orderStatus === 'DELIVERED' && order.orderType !== 'DONATION').map(order => (
                  <div key={order.id} className="order-card completed">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                    </div>
                    <span className="order-date">{formatOrderDate(order.createdAt)}</span>
                    <div className="order-total">
                      <p><strong>Total:</strong> ${order.totalPrice != null ? order.totalPrice.toFixed(2) : 'N/A'}</p>
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
