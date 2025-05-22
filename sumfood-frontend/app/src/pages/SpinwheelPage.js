// src/pages/SpinwheelPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SpinWheel from '../components/spinwheel/SpinWheel';
import '../styles/spinwheelpage.css'; // Styles for this page

const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  SPINWHEEL: `${API_BASE_URL}/wheels/public`,
  RESTAURANT_INFO: `${API_BASE_URL}/restaurant/public`,
  RESTAURANT_IMAGE_BASE: `${API_BASE_URL}/restaurant/public/image/`,
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`,
  UPDATE_CART: `${API_BASE_URL}/shopping_cart/update/`
};

const SEGMENT_COLORS = [
  '#FFD700', '#FF6347', '#ADFF2F', '#87CEEB', '#BA55D3',
  '#FFA07A', '#20B2AA', '#FFC0CB', '#32CD32', '#DAA520'
];

function SpinwheelPage() {
  const { restaurantId, spinwheelId } = useParams();
  const navigate = useNavigate();

  const [spinwheelData, setSpinwheelData] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [spinnedItem, setSpinnedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPaid, setUserPaid] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);
  const [processedWheelItems, setProcessedWheelItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const restaurantResponse = await axios.get(`${ENDPOINTS.RESTAURANT_INFO}/${restaurantId}`);
        setRestaurant(restaurantResponse.data);
        const spinwheelApiResponse = await axios.get(`${ENDPOINTS.SPINWHEEL}/${spinwheelId}`);
        const rawSpinwheelData = spinwheelApiResponse.data;
        setSpinwheelData(rawSpinwheelData);

        if (rawSpinwheelData && rawSpinwheelData.items && rawSpinwheelData.items.length > 0) {
          const itemsForWheel = rawSpinwheelData.items.map((item, index) => ({
            id: item.foodItemId,
            name: item.foodItemName,
            price: item.price,
            restaurantId: restaurantId,
            foodItemId: item.foodItemId,
            text: item.foodItemName,
            color: item.color || SEGMENT_COLORS[index % SEGMENT_COLORS.length],
            fontColor: item.fontColor || null,
          }));
          setProcessedWheelItems(itemsForWheel);
        } else {
          setProcessedWheelItems([]);
          console.warn("No items found in spinwheel data or data is malformed.");
        }
      } catch (err) {
        console.error('Error fetching spinwheel data:', err);
        setError('Failed to load spinwheel. Please try again or check if the wheel exists.');
        setProcessedWheelItems([]);
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
      const cartResponse = await axios.get(ENDPOINTS.SHOPPING_CART, {
        headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
      });
      const currentCart = cartResponse.data;
      await axios.post(ENDPOINTS.UPDATE_CART,
        { 'shoppingCartId': currentCart.id, 'foodItemId': spinnedItem.foodItemId, 'foodItemCount': 1, },
        { headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' } }
      );
      setPurchaseCompleted(true);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.warn("Failed to update existing cart or cart not found, attempting to create new cart.", err);
      try {
        await axios.post(ENDPOINTS.SHOPPING_CART,
          { 'foodItemId': spinnedItem.foodItemId, 'restaurantId': spinnedItem.restaurantId, 'foodItemCount': 1, },
          { headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' } }
        );
        setPurchaseCompleted(true);
        window.dispatchEvent(new Event('cart-updated'));
      } catch (createErr) {
        console.error("Error creating cart:", createErr);
        setError('Failed to add item to cart. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loading-message">Loading spinwheel...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="page-error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="button button-secondary">Go Back</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="spinwheel-page-container">
        {restaurant && (
          <div className="restaurant-banner">
            <img
              src={`${ENDPOINTS.RESTAURANT_IMAGE_BASE}${restaurant.logoName}`}
              alt={`${restaurant.name} logo`}
              className="restaurant-logo"
              onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-restaurant.png'; }}
            />
            <h1 className="restaurant-title">{restaurant.displayName} - Lucky Spinwheel</h1>
          </div>
        )}

        {spinwheelData && (
          <div className="spinwheel-content-area">
            <h2 className="spinwheel-title">{spinwheelData.name}</h2>
            <p className="spinwheel-description">{spinwheelData.description}</p>

            <div className="spinwheel-price-section">
              <p className="spinwheel-price-text">
                <strong>Try your luck for: ${spinwheelData.price ? spinwheelData.price.toFixed(2) : 'N/A'}</strong>
              </p>
              {!userPaid && (
                <button
                  className="button button-primary payment-button"
                  onClick={handlePayment}
                  disabled={!spinwheelData.price || spinwheelData.price <= 0}
                >
                  Pay ${spinwheelData.price ? spinwheelData.price.toFixed(2) : ''} to Spin
                </button>
              )}
            </div>

            <div className="spinwheel-interactive-area">
              {userPaid && processedWheelItems.length > 0 ? (
                <SpinWheel
                  items={processedWheelItems}
                  onSpinEnd={handleSpinComplete}
                  wheelSize={Math.min(window.innerWidth * 0.7, 380)}
                  spinDuration={8}
                />
              ) : (
                <div className="spinwheel-placeholder-message">
                  {spinwheelData && !userPaid && (
                    <p>Please pay ${spinwheelData.price ? spinwheelData.price.toFixed(2) : ''} to activate the wheel.</p>
                  )}
                  {userPaid && processedWheelItems.length === 0 && !loading && (
                    <p>There are no items on this wheel currently, or the wheel is still preparing.</p>
                  )}
                  {userPaid && loading && (
                    <p>Spinwheel is preparing...</p>
                  )}
                </div>
              )}
            </div>

            {spinnedItem && (
              <div className="spinwheel-result-section">
                <h3>🎉 Congratulations! 🎉</h3>
                <p>You won: <strong>{spinnedItem.name}</strong> (worth ${spinnedItem.price ? spinnedItem.price.toFixed(2) : 'N/A'})</p>
                {!purchaseCompleted ? (
                  <div className="result-actions">
                    <button className="button button-primary order-button" onClick={addToCart}>Add to Cart</button>
                    <button className="button button-secondary skip-button" onClick={() => navigate(`/restaurant/${restaurantId}`)}>Skip & Browse Menu</button>
                  </div>
                ) : (
                  <div className="result-confirmation">
                    <p className="success-message">Item added to your cart!</p>
                    <div className="result-actions">
                      <button className="button button-primary browse-button" onClick={() => navigate(`/restaurant/${restaurantId}`)}>Continue Shopping</button>
                      <button className="button button-secondary cart-button" onClick={() => navigate('/cart')}>Go to Cart</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="spinwheel-rules-section">
              <h3>How it Works</h3>
              <ol>
                <li>Pay the spinwheel price (${spinwheelData.price ? spinwheelData.price.toFixed(2) : 'N/A'})</li>
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
