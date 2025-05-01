// pages/CourierDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourierNavbar from '../components/layout/CourierNavbar';
import './CourierDashboard.css';

function CourierDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

    // Fetch orders (mock data for now)
    setTimeout(() => {
      const mockOrders = [
        {
          id: '1001',
          restaurant: 'Burger Palace',
          customer: 'John Doe',
          address: '123 Main St, City',
          status: 'Ready for pickup',
          time: '10:30 AM',
          distance: '2.5 miles',
          items: [
            { name: 'Cheeseburger', quantity: 2 },
            { name: 'French Fries', quantity: 1 },
            { name: 'Soda', quantity: 2 }
          ],
          total: '$24.99'
        },
        {
          id: '1002',
          restaurant: 'Pizza Corner',
          customer: 'Jane Smith',
          address: '456 Oak St, City',
          status: 'In delivery',
          time: '11:15 AM',
          distance: '3.2 miles',
          items: [
            { name: 'Large Pepperoni Pizza', quantity: 1 },
            { name: 'Garlic Bread', quantity: 1 }
          ],
          total: '$19.99'
        },
        {
          id: '1003',
          restaurant: 'Sushi Express',
          customer: 'Mike Johnson',
          address: '789 Pine St, City',
          status: 'New order',
          time: '12:00 PM',
          distance: '1.8 miles',
          items: [
            { name: 'California Roll', quantity: 2 },
            { name: 'Miso Soup', quantity: 1 }
          ],
          total: '$27.50'
        }
      ];

      setOrders(mockOrders);
      setLoading(false);
    }, 1000); // Simulating API call delay
  }, [navigate]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <CourierNavbar currentPage="dashboard" />
      <div className="courier-dashboard">
        <div className="dashboard-header">
          <h1>Courier Dashboard</h1>
        </div>

        <div className="recent-orders">
          <h3>Current Orders</h3>
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
                    <h4>{order.restaurant}</h4>
                    <span className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details-preview">
                    <p><strong>Order #:</strong> {order.id}</p>
                    <p><strong>Customer:</strong> {order.customer}</p>
                    <p><strong>Time:</strong> {order.time}</p>
                    <p><strong>Distance:</strong> {order.distance}</p>
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
              
              <div className="order-details-section">
                <h4>Restaurant</h4>
                <p>{selectedOrder.restaurant}</p>
                
                <h4>Customer</h4>
                <p>{selectedOrder.customer}</p>
                
                <h4>Delivery Address</h4>
                <p>{selectedOrder.address}</p>
                
                <h4>Status</h4>
                <p>{selectedOrder.status}</p>
                
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
                  <p>{selectedOrder.total}</p>
                </div>
              </div>
              
              <div className="order-actions">
                <button className="primary-button">Accept Order</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CourierDashboard;