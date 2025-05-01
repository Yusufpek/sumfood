import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, Marker } from '@vis.gl/react-google-maps';

import Navbar from '../../components/layout/Navbar'; // Customer Navbar
import Footer from '../../components/layout/Footer';
// import ReactStars from 'react-stars'; // <-- REMOVED: Ensure this package is installed if you want to use it, or use react-icons
import './RestaurantPublicPage.css'; // Create this CSS file

// --- Constants ---
const API_BASE_URL = 'http://localhost:8080/api';
const FOOD_IMAGE_BASE = `${API_BASE_URL}/food/public/image/`;
// This endpoint definition is CORRECT, assuming you add the corresponding method in the Java Controller
const RESTAURANT_ENDPOINT = (id) => `${API_BASE_URL}/restaurant/public/${id}`;
const MENU = (id) => `${API_BASE_URL}/food/items/restaurant/${id}`; // Changed from /food/public/items/restaurant/
const REVIEWS_ENDPOINT = (id) => `${API_BASE_URL}/reviews/restaurant/${id}`; // Assumed handled by ReviewController
// Cart endpoints (Assumed handled by ShoppingCartController)
const SHOPPING_CART_ENDPOINT = `${API_BASE_URL}/shopping_cart/`;
const UPDATE_CART_ENDPOINT = `${API_BASE_URL}/shopping_cart/update/`;


// --- Helper Functions (Keep as is) ---
const formatErrorMessage = (err, defaultMessage) => {
    // ... (implementation unchanged)
    let displayError = defaultMessage || 'An unexpected error occurred.';
    if (err.response) {
        displayError = `Server error ${err.response.status}.`;
        if (err.response.data && err.response.data.message) {
          displayError += ` Message: ${err.response.data.message}`;
        } else if (typeof err.response.data === 'string' && err.response.data.length < 200) {
          displayError += ` Details: ${err.response.data}`;
        } else if (err.response.data && typeof err.response.data === 'object') {
             // Attempt to stringify simple objects, avoid large ones
             try {
                 const dataStr = JSON.stringify(err.response.data);
                 if (dataStr.length < 200) displayError += ` Details: ${dataStr}`;
             } catch (e) { /* ignore stringify error */ }
        }
    } else if (err.request) {
        displayError = 'Cannot reach server.';
    } else {
        displayError = err.message || displayError;
    }
    return displayError;
};

const groupItemsByCategory = (items) => {
  // ... (implementation unchanged)
  if (!items || items.length === 0) return {};
  return items.reduce((acc, item) => {
    const categoryId = item.category_id || item.categoryId || item.category ||
                      (typeof item.categories === 'string' ? item.categories :
                       Array.isArray(item.categories) && item.categories.length > 0 ? item.categories[0] : null) ||
                      'uncategorized'; // Ensure categoryId is a string
    const categoryKey = String(categoryId); // Explicitly convert to string
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {});
};


// --- Component ---
function RestaurantPublicPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  // State for different data parts
  const [restaurantData, setRestaurantData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [cart, setCart] = useState(null);

  // Loading and Error States
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null);

   // Cart conflict state
  const [cartConflict, setCartConflict] = useState({
    show: false,
    newItem: null,
    currentRestaurant: null,
    newRestaurant: null
  });

  // Fetch restaurant details - Uses RESTAURANT_ENDPOINT
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoadingRestaurant(true);
      setError(null); // Reset error specific to this fetch
      try {
        // This endpoint MUST exist on the backend (GET /api/restaurant/public/{id})
        const response = await axios.get(RESTAURANT_ENDPOINT(restaurantId));
        setRestaurantData(response.data);
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
        setError(formatErrorMessage(err, 'Failed to load restaurant details.'));
      } finally {
        setLoadingRestaurant(false);
      }
    };
    fetchRestaurantDetails();
  }, [restaurantId]);

  // Fetch menu items - Uses MENU_ENDPOINT (Assumed correct)
    // Inside RestaurantPublicPage component
    useEffect(() => {
        const fetchMenuItems = async () => {
          setLoadingMenu(true);
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(MENU(restaurantId), {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Role': 'CUSTOMER'
              }
            });
            
            // Add logging to debug the response
            console.log('Menu items response:', response.data);
            
            // Handle different response structures
            const items = Array.isArray(response.data) 
              ? response.data 
              : response.data.items || response.data.foodItems || [];
            
            setMenuItems(items);
          } catch (err) {
            console.error("Error fetching menu items:", err);
            setError(prev => prev 
              ? `${prev} | ${formatErrorMessage(err, 'Failed to load menu.')}` 
              : formatErrorMessage(err, 'Failed to load menu.'));
          } finally {
            setLoadingMenu(false);
          }
        };
    
        if (restaurantId) {
          fetchMenuItems();
        } else {
          setLoadingMenu(false);
        }
      }, [restaurantId]);

  // Fetch reviews - Uses REVIEWS_ENDPOINT (Assumed correct)
  // Using mock data as before, replace with actual fetch when ready
  useEffect(() => {
      setLoadingReviews(false);
      setReviews([
          { id: 1, rating: 5, comment: "Amazing pizza, delivered hot and fresh!", customerName: "Alice", date: "2023-10-26" },
          { id: 2, rating: 4, comment: "Good food, reasonable prices.", customerName: "Bob", date: "2023-10-25" },
          { id: 3, rating: 3, comment: "Delivery took a bit long, but the burger was okay.", customerName: "Charlie", date: "2023-10-24" },
      ]);
  }, []); // Run once

   // Fetch current cart (Keep as is - Assumed correct)
   useEffect(() => {
    const fetchShoppingCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const cartResponse = await axios.get(SHOPPING_CART_ENDPOINT, {
          headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
        });
        setCart(cartResponse.data);
      } catch (err) {
        if (err.response && err.response.status !== 404) {
          console.error("Error fetching shopping cart on page load:", err);
        }
        setCart(null);
      }
    };
    fetchShoppingCart();
  }, []);

  // --- Cart Logic (Keep as is - Assumed correct) ---
  const handleClearCartAndAdd = async () => {
    // ... (implementation unchanged)
    const item = cartConflict.newItem;
    const currentCartRestaurantName = cartConflict.currentRestaurant; // Get name from conflict state
    setCartConflict({show: false, newItem: null, currentRestaurant: null, newRestaurant: null});

    if (!item) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    try {
       // Ensure cart is fetched before attempting delete/create
      let currentCart = cart;
      if (!currentCart) {
          try {
              const cartRes = await axios.get(SHOPPING_CART_ENDPOINT, {
                  headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
              });
              currentCart = cartRes.data;
              setCart(currentCart); // Update state
          } catch (fetchErr) {
               if (!fetchErr.response || fetchErr.response.status !== 404) {
                  console.error("Error fetching cart before clear:", fetchErr);
                  setError("Could not verify cart state. Please try again.");
                  return;
               }
          }
      }


      // Clear the existing cart IF it exists
      if(currentCart && currentCart.id) {
          await axios.delete(`${SHOPPING_CART_ENDPOINT}${currentCart.id}`, { // Use correct endpoint with ID
              headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
          });
          console.log('Cleared existing cart:', currentCart.id);
      } else {
          console.log('No existing cart found to clear.');
      }


      // Create a new cart with the selected item
      const response = await axios.post(SHOPPING_CART_ENDPOINT, {
        foodItemId: item.foodItemId,
        restaurantId: item.restaurantId, // Ensure item has restaurantId
        foodItemCount: 1,
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
      });

      console.log('Created new shopping cart:', response.data);
      setCart(response.data);
      window.dispatchEvent(new Event('cart-updated')); // Notify Navbar dropdown
    } catch (err) {
      console.error("Error clearing cart and adding item:", err);
      setError(formatErrorMessage(err, 'Failed to update cart.'));
      setCart(null);
    }
  };

  const addToCart = async (itemToAdd) => {
    // ... (implementation unchanged)
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }
    if (!restaurantData) return; // Need restaurant data

    // Prepare item data for API (ensure IDs are correct)
    const apiItem = {
        foodItemId: itemToAdd.foodItemId || itemToAdd.id, // Use foodItemId if available, else id
        restaurantId: restaurantData.id, // Use the ID of the restaurant being viewed
        foodItemCount: 1
    };

    try {
      // 1. Fetch the current cart status *right now*
      let currentCartData = null;
      try {
          const cartResponse = await axios.get(SHOPPING_CART_ENDPOINT, {
             headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
          });
          currentCartData = cartResponse.data;
          setCart(currentCartData); // Update local state
      } catch (getCartErr) {
          if (!getCartErr.response || getCartErr.response.status !== 404) {
              throw getCartErr; // Rethrow unexpected errors
          }
          console.log("No active cart found, will create new.");
      }


      // 2. Check for restaurant conflict
      if (currentCartData && currentCartData.items && currentCartData.items.length > 0) {
        const existingRestaurantId = currentCartData.restaurantId;
        const newRestaurantId = apiItem.restaurantId;

        if (existingRestaurantId && existingRestaurantId !== newRestaurantId) {
          // Conflict! Need restaurant name for the popup.
          // Fetching *all* restaurants just for the name is inefficient.
          // Ideally, the cart response should include the restaurant name.
          // WORKAROUND: Use ID or a generic message if name not available.
          // Fetch restaurant name for current cart (if needed and not available)
          let currentRestoName = `Restaurant ID ${existingRestaurantId}`; // Default
          // You might need another API call here if cart doesn't include name
          // For now, using ID as placeholder

          setCartConflict({
            show: true,
            newItem: apiItem,
            currentRestaurant: currentRestoName, // Placeholder name
            newRestaurant: restaurantData.displayName || restaurantData.name // Name of current page's restaurant
          });
          return; // Stop processing
        }
      }

      // 3. No conflict or cart is empty/new - Add or Update
      let response;
      if (currentCartData && currentCartData.id) {
        // Cart exists, update it
        response = await axios.post(UPDATE_CART_ENDPOINT, {
            shoppingCartId: currentCartData.id,
            foodItemId: apiItem.foodItemId,
            foodItemCount: apiItem.foodItemCount, // Add 1
        }, {
            headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
        });
        console.log('Updated existing cart:', response.data);

      } else {
         // Cart doesn't exist, create new
         response = await axios.post(SHOPPING_CART_ENDPOINT, {
             foodItemId: apiItem.foodItemId,
             restaurantId: apiItem.restaurantId,
             foodItemCount: apiItem.foodItemCount,
         }, {
            headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
         });
         console.log('Created new cart:', response.data);
      }

      setCart(response.data); // Update local cart state
      window.dispatchEvent(new Event('cart-updated')); // Notify navbar

    } catch (err) {
        console.error("Error adding item to cart:", err);
        setError(formatErrorMessage(err, 'Could not add item to cart.'));
    }
  };

  // --- Memoized values ---
  const groupedMenuItems = useMemo(() => groupItemsByCategory(menuItems), [menuItems]);

  // --- Render Logic ---

  if (loadingRestaurant) {
    return (
      <>
        <Navbar />
        <div className="restaurant-public-page loading">Loading Restaurant...</div>
        <Footer />
      </>
    );
  }

  // If there was an error fetching the main restaurant data, show error page
  if (error && !restaurantData) {
    return (
      <>
        <Navbar />
        <div className="restaurant-public-page error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/main')}>Back to Main</button>
        </div>
        <Footer />
      </>
    );
  }

  // If no error, but still no data (e.g., 404 Not Found from backend)
  if (!restaurantData) {
      return (
        <>
            <Navbar />
            <div className="restaurant-public-page error">
                <h2>Restaurant Not Found</h2>
                <p>The restaurant you are looking for (ID: {restaurantId}) does not exist or could not be loaded.</p>
                <button onClick={() => navigate('/main')}>Back to Main</button>
            </div>
            <Footer />
        </>
      );
  }

  return (
    <>
      <Navbar />
      {cartConflict.show && <CartConflictPopup />}

      <div className="restaurant-public-page">
        {/* --- Header Section --- */}
        <header className="restaurant-header">
          
          <div className="restaurant-header-info">
            <h1>{restaurantData.displayName || restaurantData.name || 'Restaurant'}</h1>
            {/* Placeholder for Star Rating - Replace with actual implementation if needed */}
            {/* Example: <p>Rating: {restaurantData.averageRating ? `${restaurantData.averageRating.toFixed(1)}/5` : 'Not Rated'}</p> */}
            <p className="restaurant-description">{restaurantData.description || 'No description available.'}</p>
            <p className="restaurant-address">📍 {restaurantData.address || 'Address not available'}</p>
            {/* Add opening hours if available in restaurantData */}
          </div>
        </header>

        {/* Display non-critical errors (e.g., menu/reviews failed but restaurant loaded) */}
        {error && restaurantData && <p className="error-message warning">{error}</p>}


        {/* --- Main Content Tabs/Sections --- */}
        <div className="restaurant-content">
            {/* --- Menu Section --- */}
            <section id="menu" className="restaurant-section">
                <h2>Menu</h2>
                {loadingMenu ? (
                    <p>Loading menu...</p>
                ) : menuItems.length === 0 ? (
                    <p>No menu items available for this restaurant.</p>
                ) : (
                    Object.keys(groupedMenuItems).map(categoryId => (
                        <div key={categoryId} className="category-group">
                            {/* Ensure categoryId is treated as a string for display */}
                            <h3 className="category-title">
                                {String(categoryId) !== 'uncategorized' ? String(categoryId).replace(/_/g, ' ') : 'Other Items'}
                            </h3>
                            <div className="food-item-grid">
    {groupedMenuItems[categoryId]?.map(item => {
      // Ensure all required fields exist
      if (!item?.name || !item?.price) return null;

      const foodImageUrl = FOOD_IMAGE_BASE + item.restaurantName.replace(" ", "_") + "/" + item.imageName;
      return (
        <div key={item.id || item.image_name} className="food-item-card-simple">
          <img 
            src={foodImageUrl} 
            alt={item.name} 
            onError={(e) => {e.target.src = '/placeholder-food.jpg';}} 
          />
          <h3>{item.name}</h3>
          {item.description && (
            <p className="item-description-small">{item.description}</p>
          )}
          <p className="item-price">
            <strong>${Number(item.price).toFixed(2)}</strong>
          </p>
          <button
            className="btn btn-add-to-cart-small"
            onClick={() => addToCart(item)}
          >
            Add +
          </button>
        </div>
      );
    })}
  </div>
                        </div>
                    ))
                )}
            </section>

            {/* --- Location Section --- */}
            <section id="location" className="restaurant-section">
                <h2>Location</h2>
                 {(restaurantData.latitude && restaurantData.longitude) ? (
                     <div className="map-container-public">
                        {/* Ensure API key is configured for react-google-maps */}
                        <Map
                            defaultCenter={{ lat: restaurantData.latitude, lng: restaurantData.longitude }}
                            defaultZoom={15}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                            style={{ width: '100%', height: '300px' }}
                            mapId={'RESTAURANT_LOCATION_MAP'}
                        >
                            <Marker
                                position={{ lat: restaurantData.latitude, lng: restaurantData.longitude }}
                                title={restaurantData.displayName || restaurantData.name}
                            />
                        </Map>
                        <p>{restaurantData.address}</p>
                    </div>
                 ) : (
                    <p>Location information is not available.</p>
                 )}
            </section>

            {/* --- Reviews Section --- */}
            <section id="reviews" className="restaurant-section">
                <h2>Reviews & Ratings</h2>
                {loadingReviews ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                     <p>No reviews yet for this restaurant.</p>
                 ) : (
                    <div className="reviews-list">
                        {reviews.map(review => (
                            <div key={review.id} className="review-card">
                                {/* Placeholder for Star Rating - Replace with actual implementation */}
                                <p className="review-rating"><strong>Rating: {review.rating}/5</strong></p>
                                <p className="review-comment">"{review.comment}"</p>
                                <p className="review-author">- {review.customerName || 'Anonymous'} on {new Date(review.date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                 )}
            </section>
        </div>
      </div>
      <Footer />
    </>
  );

    // CartConflictPopup component (Keep as is)
    function CartConflictPopup() {
        // ... (implementation unchanged)
        return (
          <div className="address-popup-overlay"> {/* Reuse overlay style */}
            <div className="address-popup cart-conflict-popup"> {/* Reuse popup base style */}
              <h2>Different Restaurant</h2>
              <p>Your cart contains items from <strong>{cartConflict.currentRestaurant || 'another restaurant'}</strong>.</p>
              <p>Adding items from <strong>{cartConflict.newRestaurant || 'this restaurant'}</strong> will clear your current cart.</p>
              <div className="address-popup-actions">
                <button
                  className="btn btn-secondary" // Style as secondary action
                  onClick={() => setCartConflict({...cartConflict, show: false})}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary" // Style as primary action
                  onClick={handleClearCartAndAdd}
                >
                  Clear Cart & Add
                </button>
              </div>
            </div>
          </div>
        );
      };
}

export default RestaurantPublicPage;
