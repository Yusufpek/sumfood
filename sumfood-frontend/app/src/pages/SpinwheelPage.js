import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SpinwheelComponent from '../components/spinwheel/SpinwheelComponent';
import '../styles/spinwheel.css';

// API Constants
const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  SPINWHEEL: `${API_BASE_URL}/wheels/public`,
  RESTAURANT_INFO: `${API_BASE_URL}/restaurant/public`,
  RESTAURANT_IMAGE_BASE: `${API_BASE_URL}/restaurant/public/image/`,
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`,
  UPDATE_CART: `${API_BASE_URL}/shopping_cart/update/`
};

function SpinwheelPage() {
  const { restaurantId, spinwheelId } = useParams();
  const navigate = useNavigate();
  
  const [spinwheel, setSpinwheel] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [spinnedItem, setSpinnedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPaid, setUserPaid] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch restaurant info
        const restaurantResponse = await axios.get(`${ENDPOINTS.RESTAURANT_INFO}/${restaurantId}`);
        setRestaurant(restaurantResponse.data);
        
        // Fetch spinwheel info
        const spinwheelResponse = await axios.get(`${ENDPOINTS.SPINWHEEL}/${spinwheelId}`);
        console.log('Spinwheel data:', spinwheelResponse.data);
        
        // Process spinwheel items to include full food item details
        const wheelWithItems = {
          ...spinwheelResponse.data,
          items: spinwheelResponse.data.items.map(item => ({
            id: item.foodItemId,
            name: item.name,
            price: item.price,
            description: item.description,
            restaurantId: restaurantId
          }))
        };
        
        setSpinwheel(wheelWithItems);
      } catch (err) {
        console.error('Error fetching spinwheel data:', err);
        setError('Failed to load spinwheel. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [restaurantId, spinwheelId]);
  
  const handlePayment = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // In a real application, this would integrate with a payment gateway
    // For demonstration, we'll simulate a successful payment
    setUserPaid(true);
  };
  
  const handleSpinComplete = (item) => {
    setSpinnedItem(item);
  };
  
  const addToCart = async () => {
    if (!spinnedItem) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      // Check if user has a cart
      const cartResponse = await axios.get(ENDPOINTS.SHOPPING_CART, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'CUSTOMER'
        }
      });
      
      const currentCart = cartResponse.data;
      
      try {
        const response = await axios.post(ENDPOINTS.UPDATE_CART,
          {
            'shoppingCartId': currentCart.id,
            'foodItemId': spinnedItem.foodItemId,
            'foodItemCount': 1,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Role': 'CUSTOMER'
            }
          });
        
        console.log('Item added to cart:', response.data);
        setPurchaseCompleted(true);
        // Dispatch event to notify cart dropdown
        window.dispatchEvent(new Event('cart-updated'));
      } catch (err) {
        console.error("Error updating cart:", err);
        setError('Failed to add item to cart');
      }
    } catch (err) {
      // Cart doesn't exist, create a new one
      try {
        const response = await axios.post(ENDPOINTS.SHOPPING_CART,
          {
            'foodItemId': spinnedItem.foodItemId,
            'restaurantId': spinnedItem.restaurantId,
            'foodItemCount': 1,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Role': 'CUSTOMER'
            }
          });
        
        console.log('Created new cart with item:', response.data);
        setPurchaseCompleted(true);
        // Dispatch event to notify cart dropdown
        window.dispatchEvent(new Event('cart-updated'));
      } catch (err) {
        console.error("Error creating cart:", err);
        setError('Failed to add item to cart');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading spinwheel...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="spinwheel-page">
        {restaurant && (
          <div className="restaurant-banner">
            <img 
              src={`${ENDPOINTS.RESTAURANT_IMAGE_BASE}${restaurant.logoName}`} 
              alt={restaurant.name}
              onError={(e) => {e.target.src = '/placeholder-restaurant.png';}}
            />
            <h1>{restaurant.displayName} - Lucky Spinwheel</h1>
          </div>
        )}
        
        {spinwheel && (
          <div className="spinwheel-content">
            <h2>{spinwheel.name}</h2>
            <p className="spinwheel-description">{spinwheel.description}</p>
            
            <div className="spinwheel-price-container">
              <p className="spinwheel-price">
                <strong>Try your luck for: ${spinwheel.price.toFixed(2)}</strong>
              </p>
              {!userPaid && (
                <button 
                  className="payment-btn"
                  onClick={handlePayment}
                >
                  Pay ${spinwheel.price.toFixed(2)} to Spin
                </button>
              )}
            </div>
            
            <div className="spinwheel-interactive">
              <SpinwheelComponent 
                items={spinwheel.items}
                onSpinComplete={handleSpinComplete}
                readOnly={!userPaid}
              />
            </div>
            
            {spinnedItem && (
              <div className="spinwheel-result">
                <h3>Congratulations!</h3>
                <p>You won: <strong>{spinnedItem.name}</strong> (worth ${spinnedItem.price.toFixed(2)})</p>
                
                {!purchaseCompleted ? (
                  <div className="result-actions">
                    <button className="order-btn" onClick={addToCart}>
                      Add to Cart
                    </button>
                    <button className="skip-btn" onClick={() => navigate(`/restaurant/${restaurantId}`)}>
                      Skip & Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="result-confirmation">
                    <p className="success-message">Item added to your cart!</p>
                    <div className="result-actions">
                      <button className="browse-btn" onClick={() => navigate(`/restaurant/${restaurantId}`)}>
                        Continue Shopping
                      </button>
                      <button className="cart-btn" onClick={() => navigate('/cart')}>
                        Go to Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="spinwheel-rules">
              <h3>How it Works</h3>
              <ol>
                <li>Pay the spinwheel price (${spinwheel.price.toFixed(2)})</li>
                <li>Spin the wheel to win a random food item</li>
                <li>Add your won item to cart or continue browsing</li>
              </ol>
              <p className="disclaimer">All spins are final. The restaurant reserves the right to modify spinwheel offerings.</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SpinwheelPage;
