import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourierNavbar from '../../components/layout/CourierNavbar';
import StarRatingDisplay from '../../components/common/StarRatingDisplay';
import axios from 'axios';
import './CourierReviews.css';

function CourierReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

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
    switch (status) {
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
    const fetchReview = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/courier/reviews', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'COURIER'
          }
        });
        console.log('Past Reviews:', response.data);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching past deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [navigate]);

  const handleReviewClick = (review) => {
    setSelectedReview(review);
  };

  const closeReviewDetails = () => {
    setSelectedReview(null);
  };

  return (
    <>
      <CourierNavbar currentPage="reviews" />
      <div className="orders-history-container">
        <div className="history-header">
          <h1>Review History</h1>
        </div>

        {loading ? (
          <div className="loading">Loading reviews history...</div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">No past reviews found.</div>
        ) : (
          <div className="deliveries-section">
            <h3>Past Deliveries</h3>
            <div className="deliveries-container">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="delivery-item"
                  onClick={() => handleReviewClick(review)}
                >
                  <div className="delivery-header">
                    <h4>{review.order.restaurantName}</h4>
                    <span className={`delivery-status ${getStatusClass(review.order.orderStatus)}`}>
                      {review.order.orderStatus}
                    </span>
                  </div>
                  <div className="delivery-details-preview">
                    <p><strong>Review</strong></p>
                    <p><strong>Delivery Score:</strong><StarRatingDisplay rating={review.deliveryScore} size={24} /></p>
                    <p><strong>Time:</strong> {formatDateTime(review.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedReview && (
          <div className="delivery-details-modal" onClick={closeReviewDetails}>
            <div className="delivery-details-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closeReviewDetails}>×</button>
              <h3>Review Details - #{selectedReview.id}</h3>

              <div className="delivery-details-section">
                <h4>Rating:</h4>
                <p><StarRatingDisplay rating={selectedReview.deliveryScore} size={24} /></p>

                <h4>Restaurant</h4>
                <p>{selectedReview.order.restaurantName}</p>

                <h4>Pick Up Address</h4>
                <p>{selectedReview.fromAddress || 'N/A'}</p>

                <h4>Delivery Address</h4>
                <p>{selectedReview.order.address || 'N/A'}</p>

                <h4>Review Time</h4>
                <p>{formatDateTime(selectedReview.createdAt)}</p>

                <h4>Delivery Items</h4>
                <ul className="delivery-items-list">
                  {selectedReview.order.foodItems.length > 0 ? (
                    selectedReview.order.foodItems.map((item, index) => (
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
                  <p>{selectedReview.order.totalPrice} $</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CourierReviews;
