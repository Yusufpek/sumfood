// src/pages/SpinwheelPage.js
import React, { useState, useEffect, useMemo } from 'react';
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
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`, // Used for GET and POST (create new cart)
  ADD_WHEEL_ITEM_TO_CART: `${API_BASE_URL}/shopping_cart/add_wheel`, // Used for adding wheel item to EXISTING cart or newly created one
  RESTAURANTS_ALL: `${API_BASE_URL}/restaurant/public/all`
};

const SEGMENT_COLORS = [
  '#FFD700', '#FF6347', '#ADFF2F', '#87CEEB', '#BA55D3',
  '#FFA07A', '#20B2AA', '#FFC0CB', '#32CD32', '#DAA520'
];

// Error handler utility function
const formatErrorMessage = (err, defaultMessage) => {
  let displayError = defaultMessage || 'An unexpected error occurred.';
  if (err.response) {
    displayError = `Server error ${err.response.status}.`;
    if (err.response.data && err.response.data.message) {
      displayError += ` Message: ${err.response.data.message}`;
    } else if (typeof err.response.data === 'string' && err.response.data.length < 200) {
      displayError += ` Details: ${err.response.data}`;
    }
  } else if (err.request) {
    displayError = 'Cannot reach server.';
  } else {
    displayError = err.message || displayError;
  }
  return displayError;
};


function SpinwheelPage() {
  const { restaurantId, spinwheelId } = useParams(); // restaurantId is of the current wheel's restaurant
  const navigate = useNavigate();

  const [spinwheelData, setSpinwheelData] = useState(null);
  const [restaurant, setRestaurant] = useState(null); // Details of the current wheel's restaurant
  const [allRestaurants, setAllRestaurants] = useState([]); // For conflict popup names
  const [spinnedItem, setSpinnedItem] = useState(null); // The item won from the wheel
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPaid, setUserPaid] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);
  const [processedWheelItems, setProcessedWheelItems] = useState([]);

  const [cartConflict, setCartConflict] = useState({
    show: false,
    newItem: null,
    currentCartDetails: null,
    newRestaurantDetails: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [restaurantResponse, spinwheelApiResponse, allRestaurantsResponse] = await Promise.all([
          axios.get(`${ENDPOINTS.RESTAURANT_INFO}/${restaurantId}`),
          axios.get(`${ENDPOINTS.SPINWHEEL}/${spinwheelId}`),
          axios.get(ENDPOINTS.RESTAURANTS_ALL)
        ]);

        setRestaurant(restaurantResponse.data);
        setAllRestaurants(Array.isArray(allRestaurantsResponse.data) ? allRestaurantsResponse.data : []);
        
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
        console.error('Error fetching initial page data:', err);
        setError(formatErrorMessage(err, 'Failed to load spinwheel data. Please try again.'));
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
    setPurchaseCompleted(false); 
  };

  // Function to add a won item to an ALREADY EXISTING cart using the /add_wheel endpoint
  const addWheelItemToCartViaSpecialEndpoint = async (cartId, item, wheelDetails, token) => {
    // 'item' is the spinnedItem, 'wheelDetails' is spinwheelData
    try {
        const payload = {
            wheelId: wheelDetails.id, 
            foodItemId: item.foodItemId,
            shoppingCartId: cartId, // ID of the (potentially newly created) cart
        };
        await axios.post(ENDPOINTS.ADD_WHEEL_ITEM_TO_CART, payload, {
             headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
        });
        // Assuming purchase completion is marked after this specific step
        setPurchaseCompleted(true);
        window.dispatchEvent(new Event('cart-updated'));
        setCartConflict({ show: false, newItem: null, currentCartDetails: null, newRestaurantDetails: null });
    } catch (addWheelError) {
        setError(formatErrorMessage(addWheelError, 'Failed to associate wheel win with the cart.'));
    }
  };

  // Function to first create a cart with the won item, then call ADD_WHEEL_ITEM_TO_CART
  const createCartThenAddWheelItem = async (item, wheelRestaurantId, currentSpinWheelData, token) => {
    // item is spinnedItem, wheelRestaurantId is from useParams, currentSpinWheelData is spinwheelData state
    let newCart;
    try {
        // Step 1: Create the cart using the standard cart creation endpoint.
        // This endpoint requires an item, so we use the won item.
        const createCartPayload = {
            foodItemId: item.foodItemId,
            restaurantId: wheelRestaurantId,
            foodItemCount: 0,
        };
        const response = await axios.post(ENDPOINTS.SHOPPING_CART, createCartPayload, {
            headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
        });
        newCart = response.data; // This should be the ShoppingCartResponse

        if (!newCart || !newCart.id) {
            throw new Error("New cart ID was not received after creation.");
        }

        // Step 2: Now that the cart is created (and contains the item),
        // call the ADD_WHEEL_ITEM_TO_CART endpoint for any special processing.
        await addWheelItemToCartViaSpecialEndpoint(newCart.id, item, currentSpinWheelData, token);
        // setPurchaseCompleted and event dispatch are handled by addWheelItemToCartViaSpecialEndpoint on its success
        

    } catch (error) {
        // Handle errors from either cart creation or the subsequent add_wheel call
        if (newCart && newCart.id) { // Error occurred during step 2 (add_wheel)
             setError(formatErrorMessage(error, 'Cart created, but failed to finalize wheel item addition.'));
        } else { // Error occurred during step 1 (cart creation)
             setError(formatErrorMessage(error, 'Failed to create a new cart for your item.'));
        }
    }
  };
  
  const addToCart = async () => {
    if (!spinnedItem || !spinwheelData || !spinwheelData.id || !restaurant) { 
      setError('Cannot add to cart, essential data missing.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }
    setError(''); 

    try {
      // 1. Check for existing cart
      const cartResponse = await axios.get(ENDPOINTS.SHOPPING_CART, {
        headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
      });
      const currentCart = cartResponse.data;

      // 2. Handle restaurant conflict if cart exists and has items
      if (currentCart && currentCart.items && currentCart.items.length > 0) {
        const existingCartRestaurantId = currentCart.restaurantId;
        const newWheelRestaurantId = restaurantId; 

        if (existingCartRestaurantId && existingCartRestaurantId.toString() !== newWheelRestaurantId.toString()) {
          const currentCartRestaurantInfo = allRestaurants.find(r => r.id.toString() === existingCartRestaurantId.toString());
          const newWheelRestaurantInfo = restaurant; 

          setCartConflict({
            show: true,
            newItem: spinnedItem, 
            currentCartDetails: {
              id: currentCart.id,
              restaurantId: existingCartRestaurantId,
              restaurantName: currentCartRestaurantInfo ? currentCartRestaurantInfo.displayName : 'Another Restaurant'
            },
            newRestaurantDetails: {
              id: newWheelRestaurantId, 
              name: newWheelRestaurantInfo ? newWheelRestaurantInfo.displayName : 'This Restaurant'
            }
          });
          return; 
        }
      }

      // 3. No conflict OR cart is empty/for the same restaurant:
      // Call the endpoint to add/process the wheel item in the existing cart.
      await addWheelItemToCartViaSpecialEndpoint(currentCart.id, spinnedItem, spinwheelData, token);

    } catch (err) {
      if (err.response && err.response.status === 404 && typeof err.response.data === 'string' && err.response.data.includes("Shopping cart not found")) {
        // 4. Cart not found: Call the function that first creates the cart, then uses add_wheel.
        await createCartThenAddWheelItem(spinnedItem, restaurantId, spinwheelData, token); 
      } else {
        console.error("Error checking/fetching shopping cart:", err);
        setError(formatErrorMessage(err, 'Could not check your current cart.'));
      }
    }
  };

  const handleClearCartAndAdd = async () => {
    const token = localStorage.getItem('token');
    if (!token || !cartConflict.newItem || !cartConflict.currentCartDetails || !cartConflict.newRestaurantDetails || !spinwheelData) {
      setError("Cannot proceed: Missing information or not logged in.");
      setCartConflict({ ...cartConflict, show: false }); 
      return;
    }
    setError(''); 

    const { newItem, currentCartDetails, newRestaurantDetails } = cartConflict;

    try {
      // 1. Delete the existing cart
      await axios.delete(`${ENDPOINTS.SHOPPING_CART}/${currentCartDetails.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
      });

      // 2. Create a new cart with the won item (newItem) from the new restaurant,
      // then call add_wheel for it.
      await createCartThenAddWheelItem(newItem, newRestaurantDetails.id, spinwheelData, token); 

      // setCartConflict is reset by createCartThenAddWheelItem's success path (via addWheelItemToCartViaSpecialEndpoint)
    } catch (err) {
      console.error("Error clearing cart and adding new item:", err);
      // Error message is set by createCartThenAddWheelItem
      setCartConflict({ ...cartConflict, show: false }); 
    }
  };
  
  const CartConflictPopup = () => {
    if (!cartConflict.show) return null;

    return (
      <div className="spinwheel-popup-overlay"> 
        <div className="spinwheel-popup cart-conflict-popup-content">
          <h2>Different Restaurant</h2>
          <p>Your cart contains items from <strong>{cartConflict.currentCartDetails?.restaurantName || 'another restaurant'}</strong>.</p>
          <p>Adding this item from <strong>{cartConflict.newRestaurantDetails?.name || 'this restaurant'}</strong> will clear your current cart.</p>
          <div className="popup-actions"> 
            <button
              className="button button-secondary"
              onClick={() => setCartConflict({ ...cartConflict, show: false })}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={handleClearCartAndAdd}
            >
              Clear Cart & Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loading-message">Loading spinwheel...</div>
        <Footer />
      </>
    );
  }

  if (error && !cartConflict.show) { 
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
  
  if (!spinwheelData || !restaurant) {
     return (
      <>
        <Navbar />
        <div className="page-error-container">
          <h2>Data Missing</h2>
          <p>Spinwheel or restaurant data could not be loaded. Please try again or go back.</p>
          <button onClick={() => navigate('/')} className="button button-secondary">Go Home</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {cartConflict.show && <CartConflictPopup />}
      <div className="spinwheel-page-container">
        {restaurant && (
          <div className="restaurant-banner">
            <img
              src={`${ENDPOINTS.RESTAURANT_IMAGE_BASE}${restaurant.logoName}`}
              alt={`${restaurant.displayName} logo`}
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
            
            {error && cartConflict.show && <p className="page-error-message inline-error">{error}</p>}

            <div className="spinwheel-price-section">
              <p className="spinwheel-price-text">
                <strong>Try your luck for: ${spinwheelData.price ? spinwheelData.price.toFixed(2) : 'N/A'}</strong>
              </p>
              {!userPaid && (
                <button
                  className="button button-primary payment-button"
                  onClick={handlePayment}
                  disabled={!spinwheelData.price || spinwheelData.price <= 0 || !isAuthenticated}
                >
                  {isAuthenticated ? `Pay $${spinwheelData.price ? spinwheelData.price.toFixed(2) : ''} to Spin` : 'Login to Spin'}
                </button>
              )}
            </div>

            <div className="spinwheel-interactive-area">
              {userPaid && isAuthenticated && processedWheelItems.length > 0 && !spinnedItem ? (
                <SpinWheel
                  items={processedWheelItems}
                  onSpinEnd={handleSpinComplete}
                  wheelSize={Math.min(window.innerWidth * 0.7, 380)}
                  spinDuration={8}
                />
              ) : (
                <div className="spinwheel-placeholder-message">
                  {!isAuthenticated && (
                     <p>Please log in to pay and spin the wheel.</p>
                  )}
                  {isAuthenticated && !userPaid && spinwheelData.price > 0 && (
                    <p>Please pay ${spinwheelData.price ? spinwheelData.price.toFixed(2) : ''} to activate the wheel.</p>
                  )}
                   {isAuthenticated && userPaid && processedWheelItems.length === 0 && !loading && (
                    <p>There are no items on this wheel currently.</p>
                  )}
                  {isAuthenticated && userPaid && spinnedItem && (
                     <p>You've spun the wheel! See your winnings below or spin again.</p>
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
                    <button className="button button-primary order-button" onClick={addToCart} disabled={!isAuthenticated}>Add to Cart</button>
                    <button className="button button-secondary skip-button" onClick={() => { setSpinnedItem(null); setUserPaid(false); setError(''); navigate(`/restaurant/${restaurantId}`)}}>Skip & Browse Menu</button>
                  </div>
                ) : (
                  <div className="result-confirmation">
                    <p className="success-message">Item added to your cart!</p>
                    <div className="result-actions">
                      <button className="button button-primary browse-button" onClick={() => navigate(`/restaurant/${restaurantId}`)}>Continue Shopping at {restaurant.displayName}</button>
                      <button className="button button-secondary cart-button" onClick={() => navigate('/cart')}>Go to Cart</button>
                       <button className="button button-tertiary spin-again-button" onClick={() => { setUserPaid(false); setSpinnedItem(null); setError(''); setPurchaseCompleted(false); }}>Spin Again?</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="spinwheel-rules-section">
              <h3>How it Works</h3>
              <ol>
                <li>{isAuthenticated ? `Pay the spinwheel price ($${spinwheelData.price ? spinwheelData.price.toFixed(2) : 'N/A'})` : `Log in to participate.`}</li>
                <li>Spin the wheel to win a random food item from {restaurant.displayName}.</li>
                <li>Add your won item to the cart or continue browsing.</li>
              </ol>
              <p className="disclaimer">All spins are final once paid. The restaurant reserves the right to modify spinwheel offerings. Items won are subject to availability.</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SpinwheelPage;
