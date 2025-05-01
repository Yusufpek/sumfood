import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourierNavbar from '../components/layout/CourierNavbar';
import './CourierDashboard.css';

function CourierOrdersHistory() {
  const navigate = useNavigate();
  const [pastOrders, setPastOrders] = useState([]);
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

    // Fetch past orders (mock data for now)
    setTimeout(() => {
      const mockPastOrders = [
        {
          id: '982',
          restaurant: 'Burger Palace',
          customer: 'Emma Wilson',
          address: '742 Maple Ave, City',
          status: 'Delivered',
          time: 'Yesterday, 2:30 PM',
          distance: '3.1 miles',
          items: [
            { name: 'Double Cheeseburger', quantity: 1 },
            { name: 'Onion Rings', quantity: 1 },
            { name: 'Milkshake', quantity: 1 }
          ],
          total: '$21.99'
        },
        {
          id: '965',
          restaurant: 'Taco Town',
          customer: 'Robert Chen',
          address: '123 Oak St, City',
          status: 'Delivered',
          time: 'Yesterday, 12:15 PM',
          distance: '2.8 miles',
          items: [
            { name: 'Taco Combo', quantity: 1 },
            { name: 'Nachos', quantity: 1 },
            { name: 'Soda', quantity: 2 }
          ],
          total: '$18.50'
        },
        {
          id: '943',
          restaurant: 'Pizza Corner',
          customer: 'Sarah Miller',
          address: '567 Pine Ave, City',
          status: 'Delivered',
          time: '2 days ago, 7:20 PM',
          distance: '1.5 miles',
          items: [
            { name: 'Medium Veggie Pizza', quantity: 1 },
            { name: 'Cheese Sticks', quantity: 1 }
          ],
          total: '$22.75'
        },
        {
          id: '921',
          restaurant: 'Sushi Express',
          customer: 'Daniel Brown',
          address: '890 Cedar St, City',
          status: 'Delivered',
          time: '3 days ago, 6:45 PM',
          distance: '4.2 miles',
          items: [
            { name: 'Dragon Roll', quantity: 1 },
            { name: 'Spicy Tuna Roll', quantity: 1 },
            { name: 'Green Tea', quantity: 2 }
          ],
          total: '$32.99'
        }
      ];

      setPastOrders(mockPastOrders);
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
      <CourierNavbar currentPage="orders" />
      <div className="courier-dashboard">
        <div className="dashboard-header">
          <h1>Order History</h1>
        </div>

        <div className="past-orders">
          <h3>Past Deliveries</h3>
          {loading ? (
            <div className="loading">Loading order history...</div>
          ) : pastOrders.length === 0 ? (
            <div className="orders-list">No past orders found.</div>
          ) : (
            <div className="orders-container">
              {pastOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="order-item past-order" 
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="order-header">
                    <h4>{order.restaurant}</h4>
                    <span className="order-status status-delivered">
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
              
              <div className="order-details-section" style={{ background: 'transparent' }}>
                <h4>Restaurant</h4>
                <p>{selectedOrder.restaurant}</p>
                
                <h4>Customer</h4>
                <p>{selectedOrder.customer}</p>
                
                <h4>Delivery Address</h4>
                <p>{selectedOrder.address}</p>
                
                <h4>Status</h4>
                <p>{selectedOrder.status}</p>
                
                <h4>Delivered</h4>
                <p>{selectedOrder.time}</p>
                
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CourierOrdersHistory;
