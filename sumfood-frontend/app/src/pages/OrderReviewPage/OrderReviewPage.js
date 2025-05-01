import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderReviewPage.css';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const StarRating = ({ rating, onRatingChange, disabled = false }) => {
  const [hover, setHover] = useState(null);

  const handleMouseEnter = (value) => {
    if (!disabled) {
      setHover(value);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHover(null);
    }
  };

  const handleClick = (value) => {
    if (!disabled) {
      onRatingChange(value);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const halfStarValue = index + 0.5;

    const filled = hover ? hover >= starValue : rating >= starValue;
    const halfFilled = hover ? hover === halfStarValue : rating === halfStarValue;

    const starClass = `star ${disabled ? 'star-disabled' : 'star-interactive'}`;

    return (
      <div
        key={index}
        className={starClass}
        onMouseEnter={() => handleMouseEnter(starValue)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="star-half-area star-half-left"
          onMouseEnter={() => handleMouseEnter(halfStarValue)}
          onClick={() => handleClick(halfStarValue)}
        />
        <div
          className="star-half-area star-half-right"
          onMouseEnter={() => handleMouseEnter(starValue)}
          onClick={() => handleClick(starValue)}
        />
        {halfFilled ? (
          <FaStarHalfAlt size={24} className={disabled ? 'star-filled-disabled' : 'star-filled'} style={{ display: 'block' }} />
        ) : filled ? (
          <FaStar size={24} className={disabled ? 'star-filled-disabled' : 'star-filled'} style={{ display: 'block' }} />
        ) : (
          <FaStar size={24} style={{ display: 'block' }} />
        )}
      </div>
    );
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => renderStar(index))}
      <span className="star-rating-text">
        {rating ? `${rating.toFixed(1)}/5.0` : 'Select'}
      </span>
    </div>
  );
};

const OrderReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [foodRating, setFoodRating] = useState(0);
  const [foodComment, setFoodComment] = useState('');
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setOrderLoading(true);
      setOrderError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        
        const response = await axios.get(`http://localhost:8080/api/order/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        
        setOrder(response.data);
        
        // Check if order has been reviewed
        if (response.data.isReviewed) {
          try {
            // Fetch the existing review
            const reviewResponse = await axios.get(`http://localhost:8080/api/review/order/${orderId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Role': 'CUSTOMER'
              }
            });
            
            setExistingReview(reviewResponse.data);
            setFoodRating(reviewResponse.data.foodScore || 0);
            setDeliveryRating(reviewResponse.data.deliveryScore || 0);
            setFoodComment(reviewResponse.data.foodComment || '');
            setIsViewMode(true);
          } catch (reviewErr) {
            console.error("Error fetching review:", reviewErr);
          }
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        const errorMessage = typeof err.response?.data === 'object' 
          ? (err.response.data.message || JSON.stringify(err.response.data)) 
          : (err.response?.data || err.message || "Failed to fetch order");
        setOrderError(errorMessage);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setOrderLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrder();
    } else {
      setOrderError("Order ID is missing");
      setOrderLoading(false);
    }
  }, [orderId, navigate]);

  const formatReviewsForSubmission = () => {
    return {
      deliveryScore: deliveryRating,
      foodScore: foodRating,
      foodComment: foodComment
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      
      const reviewRequest = formatReviewsForSubmission();
      
      const response = await axios.post(
        `http://localhost:8080/api/review/order/${orderId}`,
        reviewRequest,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        }
      );
      
      console.log("Review submission response:", response.data);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting reviews:", err);
      const errorMessage = typeof err.response?.data === 'object' 
        ? (err.response.data.message || JSON.stringify(err.response.data)) 
        : (err.response?.data || err.message || "Failed to submit reviews");
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () => {
    if (!order) {
      return false;
    }
    return foodRating > 0 && deliveryRating > 0;
  };

  if (orderLoading) {
    return (
      <div className="loading-container">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (orderError) {
    return (
      <div className="error-container">
        <p>Error: {orderError}</p>
        <button 
          onClick={() => navigate('/orders')}
          className="return-button"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="no-order-container">
        <p>No order found or order cannot be reviewed.</p>
        <button 
          onClick={() => navigate('/orders')}
          className="return-button"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="review-page-container">
        <h2 className="review-page-title">
          {isViewMode ? "Order Review" : "Review Your Order"}
        </h2>
        <div className="order-summary">
          <p className="order-id">
            <strong>Order #{order?.id}</strong> from <strong>{order?.restaurantName}</strong>
          </p>
          <p className="order-meta">
            Date: {order?.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
          </p>
          <p className="order-meta">
            Total: ${order?.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
          </p>
        </div>

        <form onSubmit={!isViewMode ? handleSubmit : (e) => e.preventDefault()}>
          {/* Delivery Rating Section */}
          <div className="delivery-rating-section">
            <h3 className="delivery-section-title">
              {isViewMode ? "Delivery Experience Rating" : "Rate Your Delivery Experience"}
            </h3>
            <div className="rating-container">
              <label className="rating-label">
                Delivery Rating:
              </label>
              <StarRating
                rating={deliveryRating}
                onRatingChange={(value) => !isViewMode && setDeliveryRating(value)}
                disabled={isViewMode || submitted}
              />
            </div>
          </div>

          {/* Food Rating Section */}
          <div className="food-rating-section">
            <h3 className="food-section-title">
              {isViewMode ? "Food Experience Rating" : "Rate Your Food Experience"}
            </h3>
            <div className="rating-container">
              <label className="rating-label">
                Food Rating:
              </label>
              <StarRating
                rating={foodRating}
                onRatingChange={(value) => !isViewMode && setFoodRating(value)}
                disabled={isViewMode || submitted}
              />
            </div>
            <div className="review-container">
              <label className="rating-label">
                Food Comments:
              </label>
              <textarea
                className="review-textarea"
                value={foodComment}
                onChange={e => !isViewMode && setFoodComment(e.target.value)}
                placeholder="How was your food? (Optional)"
                disabled={isViewMode || submitted}
                readOnly={isViewMode}
              />
            </div>
          </div>

          {/* Food Items List (for reference only) */}
          <div className="food-items-list">
            <h3 className="food-items-section-title">Your Order Items</h3>
            {order?.foodItems?.map(item => (
              <div key={item.foodItemId} className="food-item">
                <div className="food-item-header">
                  <strong className="food-item-name">{item.foodItemName}</strong>
                  <span className="food-item-quantity">(x{item.amount})</span>
                  <span className="food-item-price">${(item.price / item.amount).toFixed(2)} each</span>
                </div>
              </div>
            ))}
          </div>

          {(submitted || isViewMode) ? (
            <div className="success-message">
              {isViewMode ? "Review submitted previously." : "Thank you for your reviews!"}
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => navigate('/orders')}
                  className="return-button"
                >
                  Return to Orders
                </button>
              </div>
            </div>
          ) : (
            <div className="form-actions">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={!canSubmit() || loading}
                className={`submit-button ${(!canSubmit() || loading) ? 'submit-button-disabled' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Reviews'}
              </button>
              {!canSubmit() && !loading && (
                <p className="validation-message">Please provide both food and delivery ratings.</p>
              )}
            </div>
          )}
        </form>
      </div>
    <Footer />
    </>
  );
};

export default OrderReviewPage;