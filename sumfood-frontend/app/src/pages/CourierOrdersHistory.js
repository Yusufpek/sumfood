import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourierNavbar from '../components/layout/CourierNavbar';
import axios from 'axios';
import './CourierOrdersHistory.css';

function CourierOrdersHistory() {
  const navigate = useNavigate();
  const [pastDeliveries, setPastDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'DELIVERED':
        return 'status-delivered';
      case 'FAILED':
        return 'status-failed';
      default:
        return '';
    }
  };

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

    // Fetch past deliveries
    const fetchPastDeliveries = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/courier/deliveries', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'COURIER'
          }
        });
        console.log('Past Deliveries:', response.data);
        setPastDeliveries(response.data);
      } catch (error) {
        console.error('Error fetching past deliveries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPastDeliveries();
  }, [navigate]);

  const handleDeliveryClick = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const closeDeliveryDetails = () => {
    setSelectedDelivery(null);
  };

  return (
    <>
      <CourierNavbar currentPage="deliveries" />
      <div className="orders-history-container">
        <div className="history-header">
          <h1>Delivery History</h1>
        </div>

        {loading ? (
          <div className="loading">Loading delivery history...</div>
        ) : pastDeliveries.length === 0 ? (
          <div className="empty-state">No past deliveries found.</div>
        ) : (
          <div className="deliveries-section">
            <h3>Past Deliveries</h3>
            <div className="deliveries-container">
              {pastDeliveries.map((delivery) => (
                <div 
                  key={delivery.id} 
                  className="delivery-item"
                  onClick={() => handleDeliveryClick(delivery)}
                >
                  <div className="delivery-header">
                    <h4>{delivery.order.restaurantName}</h4>
                    <span className={`delivery-status ${getStatusClass(delivery.order.orderStatus)}`}>
                      {delivery.order.orderStatus}
                    </span>
                  </div>
                  <div className="delivery-details-preview">
                    <p><strong>Delivery #:</strong> {delivery.id}</p>
                    <p><strong>Restaurant:</strong> {delivery.order.restaurantName || 'N/A'}</p>
                    <p><strong>Time:</strong> {formatDateTime(delivery.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDelivery && (
          <div className="delivery-details-modal" onClick={closeDeliveryDetails}>
            <div className="delivery-details-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closeDeliveryDetails}>×</button>
              <h3>Delivery Details - #{selectedDelivery.id}</h3>
              
              <div className="delivery-details-section">
                <h4>Restaurant</h4>
                <p>{selectedDelivery.order.restaurantName}</p>
                
                <h4>Delivery Address</h4>
                <p>{selectedDelivery.order.address || 'N/A'}</p>
                
                <h4>Status</h4>
                <p>{selectedDelivery.order.orderStatus}</p>
                
                <h4>Delivery Time</h4>
                <p>{formatDateTime(selectedDelivery.createdAt)}</p>
                
                <h4>Delivery Items</h4>
                <ul className="delivery-items-list">
                  {selectedDelivery.order.foodItems.length > 0 ? (
                    selectedDelivery.order.foodItems.map((item, index) => (
                      <li key={index}>
                        {item.foodItemName} × {item.amount} - ${item.price * item.amount}
                      </li>
                    ))
                  ) : (
                    <li>No items available</li>
                  )}
                </ul>
                
                <div className="delivery-total">
                  <h4>Total Amount</h4>
                  <p>{selectedDelivery.order.totalPrice} $</p>
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
