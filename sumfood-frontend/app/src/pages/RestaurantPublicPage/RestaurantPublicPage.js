import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, Marker } from '@vis.gl/react-google-maps';

import Navbar from '../../components/layout/Navbar'; // Customer Navbar
import Footer from '../../components/layout/Footer';
import StarRatingDisplay from '../../components/common/StarRatingDisplay';
import './RestaurantPublicPage.css'; // Create this CSS file

// --- Constants ---
const API_BASE_URL = 'http://localhost:8080/api';
const FOOD_IMAGE_BASE = `${API_BASE_URL}/food/public/image/`;
const RESTAURANT_ENDPOINT = (id) => `${API_BASE_URL}/restaurant/public/${id}`;
const MENU = (id) => `${API_BASE_URL}/food/items/restaurant/${id}`; 
const REVIEWS_ENDPOINT = (id) => `${API_BASE_URL}/review/public/restaurant/${id}`;
const SHOPPING_CART_ENDPOINT = `${API_BASE_URL}/shopping_cart/`;
const UPDATE_CART_ENDPOINT = `${API_BASE_URL}/shopping_cart/update/`;
const PUBLIC_RESTAURANT_DONATED_ITEMS = (id) => `${API_BASE_URL}/food/public/restaurant/${id}/donated-items`;

const FAVORITE_RESTAURANT_STATUS = (id) => `${API_BASE_URL}/customer/restaurants/fav/${id}`;
const REMOVE_FAVORITE_RESTAURANT = (id) => `${API_BASE_URL}/customer/restaurants/fav/${id}`;

// --- Helper Functions (Keep as is) ---
const formatErrorMessage = (err, defaultMessage) => {
    let displayError = defaultMessage || 'An unexpected error occurred.';
    if (err.response) {
        displayError = `Server error ${err.response.status}.`;
        if (err.response.data && err.response.data.message) {
          displayError += ` Message: ${err.response.data.message}`;
        } else if (typeof err.response.data === 'string' && err.response.data.length < 200) {
          displayError += ` Details: ${err.response.data}`;
        } else if (err.response.data && typeof err.response.data === 'object') {
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
  if (!items || items.length === 0) return {};
  return items.reduce((acc, item) => {
    const categoryId = item.category_id || item.categoryId || item.category ||
                      (typeof item.categories === 'string' ? item.categories :
                       Array.isArray(item.categories) && item.categories.length > 0 ? item.categories[0] : null) ||
                      'uncategorized'; 
    const categoryKey = String(categoryId); 
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {});
};

function RestaurantPublicPage() {
  const IMAGEBASE = `${API_BASE_URL}/restaurant/public/image/`;
  const [image, setImage] = useState('');
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurantData, setRestaurantData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [offeredDonationItems, setOfferedDonationItems] = useState([]);
  const [cart, setCart] = useState(null);

  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingOfferedDonations, setLoadingOfferedDonations] = useState(true);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [processingFavorite, setProcessingFavorite] = useState(false);

  const [cartConflict, setCartConflict] = useState({
    show: false,
    newItem: null,
    currentRestaurant: null,
    newRestaurant: null
  });

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoadingRestaurant(true);
      setError(null); 
      try {
        const response = await axios.get(RESTAURANT_ENDPOINT(restaurantId));
        setRestaurantData(response.data);
        setImage(IMAGEBASE + response.data.logoName);
        console.log('Restaurant details response:', response.data);
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
        setError(formatErrorMessage(err, 'Failed to load restaurant details.'));
      } finally {
        setLoadingRestaurant(false);
      }
    };
    fetchRestaurantDetails();
  }, [restaurantId, IMAGEBASE]);

    useEffect(() => {
        const fetchMenuItems = async () => {
          setLoadingMenu(true);
          try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) { 
                headers['Authorization'] = `Bearer ${token}`;
                headers['Role'] = 'CUSTOMER';
            }
            const response = await axios.get(MENU(restaurantId), { headers });
            
            console.log('Menu items response:', response.data);
            
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

  useEffect(() => {
    const fetchReviews = async () => {
      if(!restaurantId){
        setLoadingReviews(false);
        return;
      }
      
      setLoadingReviews(true);
      try{
        const response = await axios.get(REVIEWS_ENDPOINT(restaurantId));
        console.log('Reviews response:', response.data);
        const fetchedReviews = Array.isArray(response.data) ? response.data : response.data.reviews || response.data.content || response.data || [];
        setReviews(fetchedReviews);
      }
      catch (err) {
        console.error("Error fetching reviews:", err);
        
        setError(prev => prev
            ? `${prev} | ${formatErrorMessage(err, 'Failed to load reviews.')}`
            : formatErrorMessage(err, 'Failed to load reviews.')
        );
         setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [restaurantId]);

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

  useEffect(() => {
    const fetchOfferedDonationItems = async () => {
        if (!restaurantId) {
            setLoadingOfferedDonations(false);
            return;
        }
        setLoadingOfferedDonations(true);
        try {
            const response = await axios.get(PUBLIC_RESTAURANT_DONATED_ITEMS(restaurantId));
            console.log('Offered Donation Items response:', response.data);
            setOfferedDonationItems(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching offered donation items:", err);
            setError(prev => prev ? `${prev} | ${formatErrorMessage(err, 'Failed to load special donation items.')}` : formatErrorMessage(err, 'Failed to load special donation items.'));
            setOfferedDonationItems([]);
        } finally {
            setLoadingOfferedDonations(false);
        }
    };
    if (restaurantId) {
        fetchOfferedDonationItems();
    } else {
        setLoadingOfferedDonations(false);
    }
  }, [restaurantId]);

  useEffect(() => {
      const fetchFavoriteStatus = async () => {
          const token = localStorage.getItem('token');
          if (!token || !restaurantId) return;
          try {
              const response = await axios.get(FAVORITE_RESTAURANT_STATUS(restaurantId), {
                  headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
              });
              console.log("Favorite status response:", response);
              console.log("Is Favorite:", response.data);
              setIsFavorite(response.data || false);
          } catch (err) {
              console.error("Error fetching favorite status:", err);
              setIsFavorite(false);
          }
      };

    if (localStorage.getItem('token')) {
         fetchFavoriteStatus();
    }
}, [restaurantId]);

  const handleToggleFavorite = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          navigate('/login');
          return;
      }
      if (!restaurantData || processingFavorite) return;

      setProcessingFavorite(true);
      setError(null);

    try {
      await axios.put(
            REMOVE_FAVORITE_RESTAURANT(restaurantData.id), 
            {}, // empty body
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Role': 'CUSTOMER'
                }
            }
        );

      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError(`Could not ${isFavorite ? 'remove from' : 'add to'} favorites.`);
    } finally {
      setProcessingFavorite(false);
    }
  };


  const handleClearCartAndAdd = async () => {
    const item = cartConflict.newItem;
    setCartConflict({show: false, newItem: null, currentRestaurant: null, newRestaurant: null});

    if (!item) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login"); 
      return;
    }

    try {
      let currentCart = cart;
      if (!currentCart) {
          try {
              const cartRes = await axios.get(SHOPPING_CART_ENDPOINT, {
                  headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
              });
              currentCart = cartRes.data;
              setCart(currentCart); 
          } catch (fetchErr) {
               if (!fetchErr.response || fetchErr.response.status !== 404) {
                  console.error("Error fetching cart before clear:", fetchErr);
                  setError(formatErrorMessage(fetchErr, "Could not verify cart state. Please try again."));
                  return;
               }
          }
      }

      if(currentCart && currentCart.id) {
          await axios.delete(`${SHOPPING_CART_ENDPOINT}${currentCart.id}`, { 
              headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
          });
          console.log('Cleared existing cart:', currentCart.id);
      } else {
          console.log('No existing cart found to clear.');
      }

      const response = await axios.post(SHOPPING_CART_ENDPOINT, {
        foodItemId: item.foodItemId,
        restaurantId: item.restaurantId, 
        foodItemCount: 1,
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
      });

      console.log('Created new shopping cart:', response.data);
      setCart(response.data);
      window.dispatchEvent(new Event('cart-updated')); 
      if (item.isDonated) {
        navigate('/create_order');
      }
    } catch (err) {
      console.error("Error clearing cart and adding item:", err);
      setError(formatErrorMessage(err, 'Failed to update cart.'));
      setCart(null);
    }
  };

  const addToCart = async (itemToAdd, isDonated = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }
    if (!restaurantData) return; 

    const apiItem = {
        foodItemId: itemToAdd.foodItemId || itemToAdd.id, 
        restaurantId: restaurantData.id, 
        foodItemCount: 1
    };

    try {
      let currentCartData = null;
      try {
          const cartResponse = await axios.get(SHOPPING_CART_ENDPOINT, {
             headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
          });
          currentCartData = cartResponse.data;
          setCart(currentCartData); 
      } catch (getCartErr) {
          if (!getCartErr.response || getCartErr.response.status !== 404) {
              console.error("Error fetching current cart status:", getCartErr);
              setError(formatErrorMessage(getCartErr, "Could not verify your cart. Please try again."));
              return; 
          }
          console.log("No active cart found, will create new.");
      }

      if (isDonated && currentCartData && currentCartData.items) {
          const itemAlreadyInCart = currentCartData.items.find(cartItem => cartItem.foodItemId === apiItem.foodItemId);
          if (itemAlreadyInCart) {
              setError(`You have already claimed one "${itemToAdd.name}". Donated items can only be claimed once.`);
              return;
          }
      }
      if (currentCartData && currentCartData.items && currentCartData.items.length > 0) {
        const existingRestaurantId = currentCartData.restaurantId;
        const newRestaurantId = apiItem.restaurantId;

        if (existingRestaurantId && existingRestaurantId !== newRestaurantId) {
          let currentRestoName = currentCartData.restaurantName || `Restaurant ID ${existingRestaurantId}`; 
          
          setCartConflict({
            show: true,
            newItem: { ...apiItem, name: itemToAdd.name, isDonated }, 
            currentRestaurant: currentRestoName, 
            newRestaurant: restaurantData.displayName || restaurantData.name 
          });
          return; 
        }
      }

      let response;
      if (currentCartData && currentCartData.id) {
        response = await axios.post(UPDATE_CART_ENDPOINT, {
            shoppingCartId: currentCartData.id,
            foodItemId: apiItem.foodItemId,
            foodItemCount: apiItem.foodItemCount, 
        }, {
            headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
        });
        console.log('Updated existing cart:', response.data);

      } else {
         response = await axios.post(SHOPPING_CART_ENDPOINT, {
             foodItemId: apiItem.foodItemId,
             restaurantId: apiItem.restaurantId,
             foodItemCount: apiItem.foodItemCount,
         }, {
            headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
         });
         console.log('Created new cart:', response.data);
      }

      setCart(response.data); 
      window.dispatchEvent(new Event('cart-updated')); 
      if (isDonated) {
        navigate('/create_order');
      }

    } catch (err) {
        console.error("Error adding item to cart:", err);
        setError(formatErrorMessage(err, 'Could not add item to cart.'));
    }
  };

  const isDonatedItemInCart = (foodItemId) => {
    if (!cart || !cart.items) return false;
    return cart.items.some(cartItem => cartItem.foodItemId === foodItemId);
  };
  const groupedMenuItems = useMemo(() => groupItemsByCategory(menuItems), [menuItems]);

  if (loadingRestaurant) {
    return (
      <>
        <Navbar />
        <div className="restaurant-public-page loading">Loading Restaurant...</div>
        <Footer />
      </>
    );
  }

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
        <header className="restaurant-header">
          <div className="restaurant-logo-container">
            <img 
              src={image} 
              alt={restaurantData.displayName} 
              className="restaurant-logo" 
              onError={(e) => {e.target.src = '/placeholder-restaurant.png';}}
            />
          </div>


          
          <div className="restaurant-header-info">
            <h1>{restaurantData.displayName || restaurantData.name || 'Restaurant'}</h1>
            <p className="restaurant-description">{restaurantData.description || 'No description available.'}</p>
            <p className="restaurant-address">
              <span role="img" aria-label="location">📍</span>
              {restaurantData.address || 'Address not available'}
            </p>
          </div>

          <div className="restaurant-rating">
            {restaurantData.averageRate != null ? (
              <StarRatingDisplay rating={restaurantData.averageRate} size={24} />
            ) : (
              <span className="no-rating">Not Rated Yet</span>
            )}
          </div>

          <div className="restaurant-actions">
            <button
              className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
              onClick={handleToggleFavorite}
              disabled={processingFavorite || !localStorage.getItem('token')}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span className="heart-icon">
                {isFavorite ? '❤️' : '♡'}
              </span>
              {processingFavorite ? <span className="processing-dots">...</span> : ''}
            </button>
          </div>


        </header>

        {error && restaurantData && <p className="error-message warning">{error}</p>}
        
        <section id="menu" className="restaurant-section">
          <h2>Menu</h2>
          {loadingMenu ? (
              <p>Loading menu...</p>
          ) : menuItems.length === 0 ? (
              <p>No menu items available for this restaurant.</p>
          ) : (
              Object.keys(groupedMenuItems).map(categoryId => (
                  <div key={categoryId} className="category-group">
                      <h3 className="category-title">
                          {String(categoryId) !== 'uncategorized' ? String(categoryId).replace(/_/g, ' ') : 'Other Items'}
                      </h3>
                      <div className="food-item-grid">
                          {groupedMenuItems[categoryId]?.map(item => {
                              if (!item?.name || item?.price == null) return null; 

                              const foodImageUrl = FOOD_IMAGE_BASE + (item.restaurantName || restaurantData.name).replace(/\s+/g, "_") + "/" + item.imageName;
                              return (
                                  <div key={item.foodItemId || item.id || item.image_name} className="food-item-card-simple">
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

        {loadingOfferedDonations ? (
            <section className="restaurant-section donation-offer-section"><p>Loading special donation offers...</p></section>
        ) : offeredDonationItems.length > 0 && (
            <section id="donations" className="restaurant-section donation-offer-section">
                <h2 className="donation-category-title">Community Support Items</h2>
                <p className="donation-offer-prompt">
                    This restaurant is offering the following items for free. You can claim one of each available donated item.
                </p>
                <div className="food-item-grid">
                    {offeredDonationItems.map(item => {
                        if (!item?.name || item.price !== 0 || !item.foodItemId) return null; 
                        
                        const foodImageUrl = FOOD_IMAGE_BASE + (item.restaurantName || restaurantData.name).replace(/\s+/g, "_") + "/" + item.imageName;
                        const itemInCart = isDonatedItemInCart(item.foodItemId);
                        const outOfStock = item.stock <= 0;

                        return (
                            <div key={item.foodItemId} className="food-item-card-simple donation-item-card">
                                <img 
                                    src={foodImageUrl} 
                                    alt={item.name} 
                                    onError={(e) => {}} 
                                />
                                <h3>{item.name} <span className="donation-tag">DONATION</span></h3>
                                {item.description && (
                                    <p className="item-description-small">{item.description}</p>
                                )}
                                <p className="item-price"><strong>FREE</strong></p>
                                <p className={`item-stock-info ${outOfStock ? 'out-of-stock' : ''}`}>
                                    Stock: {item.stock > 0 ? item.stock : 'Out of Stock'}
                                </p>
                                <button
                                    className="btn btn-add-to-cart-small add-donation-item-btn"
                                    onClick={() => addToCart(item, true)} 
                                    disabled={outOfStock || itemInCart}
                                >
                                    {outOfStock ? 'Out of Stock' : itemInCart ? 'Claimed' : 'Claim for FREE'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>
        )}


        <div className="location-reviews-container">
          <section id="location" className="restaurant-section">
            <h2>Location</h2>
            {(restaurantData.latitude && restaurantData.longitude) ? (
                <div className="map-container-public">
                    <Map
                        defaultCenter={{ lat: restaurantData.latitude, lng: restaurantData.longitude }}
                        defaultZoom={15}
                        gestureHandling={'none'} 
                        disableDefaultUI={true}
                        clickableIcons={false} 
                        draggable={false} 
                        scrollwheel={false} 
                        style={{ width: '100%', height: '300px' }}
                        mapId={'RESTAURANT_LOCATION_MAP'}
                        options={{
                            disableDoubleClickZoom: true,
                            keyboardShortcuts: false,
                            zoomControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                            mapTypeControl: false,
                        }}
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
          
          <section id="reviews" className="restaurant-section">
            <h2>Reviews & Ratings</h2>
            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.reviewId || review.orderId || `review-${Math.random()}`} className="review-card compact-review">
                    
                    {review.foodReviewComment && review.foodReviewComment.trim() !== '' ? (
                       <p className="review-comment">"{review.foodReviewComment}"</p>
                    ) : (
                       <div className="delivery-score-display">
                        <span>Rating: </span>
                        <StarRatingDisplay rating={review.foodReviewScore} size={14} inactiveColor="#cccccc"/>
                    </div>
                    )}
                    <p className="review-author">
                       - {review.customerName || 'Anonymous Customer'} on {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown Date'}
                    </p>
                    {review.foodReviewComment && review.foodReviewComment.trim() !== '' && review.foodReviewScore != null && (
                      <div className="delivery-score-display">
                          <span>Rating: </span>
                          <StarRatingDisplay rating={review.foodReviewScore} size={14} inactiveColor="#cccccc"/>
                      </div>
                    )}
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

    function CartConflictPopup() {
        return (
          <div className="address-popup-overlay"> 
            <div className="address-popup cart-conflict-popup"> 
              <h2>Different Restaurant</h2>
              <p>Your cart contains items from <strong>{cartConflict.currentRestaurant || 'another restaurant'}</strong>.</p>
              <p>Adding "{cartConflict.newItem?.name || 'items'}" from <strong>{cartConflict.newRestaurant || 'this restaurant'}</strong> will clear your current cart.</p>
              <div className="address-popup-actions">
                <button
                  className="btn btn-secondary" 
                  onClick={() => setCartConflict({...cartConflict, show: false})}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary" 
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