import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import Footer from '../../components/layout/Footer';
import './MainPage.css';
import axios from 'axios';

// API Constants
const API_BASE_URL = 'http://localhost:8080/api';
const FOOD_IMAGE_BASE = `${API_BASE_URL}/food/public/image/`;
const ENDPOINTS = {
  FOOD_ITEMS: `${API_BASE_URL}/food/public/items`,
  RESTAURANTS: `${API_BASE_URL}/restaurant/public/all`,
  CUSTOMER: `${API_BASE_URL}/customer/`,
  CUSTOMER_ADDRESS: `${API_BASE_URL}/customer/address/`,
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`,
  UPDATE_CART: `${API_BASE_URL}/shopping_cart/update/`
};

// --- Simplified helper function for category grouping ---
const groupItemsByCategory = (items) => {
  if (!items || items.length === 0) return {};
  
  console.log("Items being grouped:", items);
  
  return items.reduce((acc, item) => {
    // Extract category using optional chaining and nullish coalescing
    const categoryId = item.category_id || 
                      item.categoryId || 
                      item.category || 
                      (typeof item.categories === 'string' ? item.categories : 
                       Array.isArray(item.categories) && item.categories.length > 0 ? item.categories[0] : null) || 
                      'uncategorized';
    
    // Create category array if it doesn't exist
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    
    acc[categoryId].push(item);
    return acc;
  }, {});
};

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

const MainPage = () => {
  const navigate = useNavigate();
  
  // User state
  const [userState, setUserState] = useState({
    username: 'Guest',
    isLoggedIn: false
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Food items state
  const [foodState, setFoodState] = useState({
    items: [],
    loading: true,
    error: null
  });
  
  // Restaurant state
  const [restaurantState, setRestaurantState] = useState({
    restaurants: [],
    loading: true,
    error: null
  });
  
  // Address state
  const [addressState, setAddressState] = useState({
    addresses: [],
    selectedAddress: null,
    loading: false,
    error: null,
    showPopup: false
  });
  
  // Cart state
  const [cart, setCart] = useState([]);
  
  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUserState({
        username: 'User', // Consider fetching the actual username
        isLoggedIn: true
      });
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem('token');
      if (!token || !userState.isLoggedIn) {
        return;
      }
      
      setAddressState(prevState => ({ ...prevState, loading: true, error: null }));
      
      try {
        const response = await axios.get(ENDPOINTS.CUSTOMER_ADDRESS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        
        console.log('Fetched addresses:', response.data);
        const addressList = Array.isArray(response.data) ? response.data : [];
        setAddressState(prevState => ({
          ...prevState,
          addresses: addressList,
          selectedAddress: addressList.find(addr => addr.isDefault) || addressList[0],
          showPopup: addressList.length === 0
        }));
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setAddressState(prevState => ({
          ...prevState,
          error: 'Failed to load your addresses',
          addresses: [],
          showPopup: true
        }));
      } finally {
        setAddressState(prevState => ({ ...prevState, loading: false }));
      }
    };
    
    fetchAddresses();
  }, [userState.isLoggedIn]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setRestaurantState(prevState => ({ ...prevState, loading: true, error: null }));
      try {
        if (userState.isLoggedIn && !addressState.selectedAddress) {
          setRestaurantState(prevState => ({ ...prevState, restaurants: [], loading: false }));
          return;
        }
        
        const response = await axios.get(ENDPOINTS.RESTAURANTS);
        console.log('Fetched restaurants:', response.data);
        setRestaurantState(prevState => ({
          ...prevState,
          restaurants: Array.isArray(response.data) ? response.data : []
        }));
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setRestaurantState(prevState => ({
          ...prevState,
          error: formatErrorMessage(err, 'Failed to load restaurants.'),
          restaurants: []
        }));
      } finally {
        setRestaurantState(prevState => ({ ...prevState, loading: false }));
      }
    };
    
    fetchRestaurants();
  }, [addressState.selectedAddress, userState.isLoggedIn]);

  useEffect(() => {
    const fetchAllFoodItems = async () => {
      if (userState.isLoggedIn && !addressState.selectedAddress) {
        setFoodState(prevState => ({ ...prevState, items: [], loading: false }));
        return;
      }
      
      setFoodState(prevState => ({ ...prevState, loading: true, error: null }));
      try {
        const response = await axios.get(ENDPOINTS.FOOD_ITEMS);
        console.log('Fetched food items:', response.data);
        const items = Array.isArray(response.data) ? response.data : [];
        setFoodState(prevState => ({ ...prevState, items }));
      } catch (err) {
        console.error("Error fetching food items:", err);
        setFoodState(prevState => ({
          ...prevState,
          error: formatErrorMessage(err, 'Failed to load food items.'),
          items: []
        }));
      } finally {
        setFoodState(prevState => ({ ...prevState, loading: false }));
      }
    };
    fetchAllFoodItems();
  }, [userState.isLoggedIn, addressState.selectedAddress]);

  useEffect(() => {
    const fetchShoppingCart = async () => {
      setCart(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        const cartResponse = await axios.get(ENDPOINTS.SHOPPING_CART, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        console.log('fetched shopping cart:', cartResponse.data);
        setCart(cartResponse.data);
      } catch (err) {
        console.error("Error fetching shopping cart:", err);
        setCart(null);
      }
    };
    fetchShoppingCart();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddressSelectFromPopup = (address) => {
    setAddressState(prevState => ({
      ...prevState,
      selectedAddress: address,
      showPopup: false
    }));
  };
  
  const navigateToAddressPageFromPopup = () => {
    setAddressState(prevState => ({ ...prevState, showPopup: false }));
    navigate('/profile', { state: { activeSection: 'Manage Addresses' } });
  };

  const addToCart = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/");
    }

    try {
      const cartResponse = await axios.get(ENDPOINTS.SHOPPING_CART, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'CUSTOMER'
        }
      });
      console.log('fetched shopping cart:', cartResponse.data);
      const cart = cartResponse.data;
      try {
        const response = await axios.post(ENDPOINTS.UPDATE_CART,
          {
            'shoppingCartId': cart.id,
            'foodItemId': item.foodItemId,
            'foodItemCount': 1,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Role': 'CUSTOMER'
            }
          });

        console.log('updating shopping cart:', response.data);
        setCart(response.data);
      } catch (err) {
        console.error("Error creating shopping cart:", err);
        setCart(null);
      }
    } catch (err) {
      console.error("Error fetching shopping cart:", err.response.data);

      if (err && err.response && err.response.data === "Shopping cart not found.") {
        try {
          const response = await axios.post(ENDPOINTS.SHOPPING_CART,
            {
              'foodItemId': item.foodItemId,
              'restaurantId': item.restaurantId,
              'foodItemCount': 1,
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Role': 'CUSTOMER'
              }
            });

          console.log('fetched shopping cart:', response.data);
          setCart(response.data);
        } catch (err) {
          console.error("Error creating shopping cart:", err);
          setCart(null);
        }
      }
    }
  };

  const updateQuantity = async (cartId, itemId, amount) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/");
    }
    try {
      const response = await axios.post(ENDPOINTS.UPDATE_CART,
        {
          'shoppingCartId': cartId,
          'foodItemId': itemId,
          'foodItemCount': amount,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });

      console.log(amount);
      console.log('updating shopping cart item amount:', response.data);
      setCart(response.data);
    } catch (err) {
      console.error("Error creating shopping cart:", err);
      setCart(null);
    }
  };

  const placeOrder = async () => {
    navigate('/create_order');
  }

  const searchedItems = useMemo(() => {
    if (!foodState.items || foodState.items.length === 0) {
      console.log("No food items to filter");
      return [];
    }
    
    console.log(`Filtering ${foodState.items.length} food items`);
    let filteredItems = foodState.items;
    
    if (userState.isLoggedIn && restaurantState.restaurants.length > 0) {
      console.log(`Filtering by ${restaurantState.restaurants.length} available restaurants`);
      const availableRestaurantIds = restaurantState.restaurants.map(r => r.id);
      console.log('Available restaurant IDs:', availableRestaurantIds);
      
      filteredItems = filteredItems.filter(item => {
        const restaurantId = item.restaurantId || item.restaurant_id || 
                            (item.restaurant ? item.restaurant.id : null);
        
        console.log(`Item ${item.name} has restaurant ID: ${restaurantId}`);
        return availableRestaurantIds.includes(restaurantId);
      });
      
      console.log(`${filteredItems.length} items remain after restaurant filtering`);
    }
    
    if (searchTerm) {
      console.log(`Filtering by search term: "${searchTerm}"`);
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log(`${filteredItems.length} items remain after search term filtering`);
    }
    
    return filteredItems;
  }, [foodState.items, searchTerm, restaurantState.restaurants, userState.isLoggedIn]);

  const groupedItems = useMemo(() => {
    const grouped = groupItemsByCategory(searchedItems);
    console.log("Grouped items:", grouped);
    return grouped;
  }, [searchedItems]);

  const AddressSelectionPopup = () => {
    return (
      <div className="address-popup-overlay">
        <div className="address-popup">
          <h2>Select Delivery Address</h2>
          {addressState.loading ? (
            <p>Loading your addresses...</p>
          ) : addressState.error ? (
            <div>
              <p className="error-message">{addressState.error}</p>
              <button 
                className="btn btn-primary"
                onClick={navigateToAddressPageFromPopup}
              >
                Add New Address
              </button>
            </div>
          ) : addressState.addresses.length === 0 ? (
            <div>
              <p>You don't have any saved addresses. Please add an address to see restaurants and food items available in your area.</p>
              <button 
                className="btn btn-primary"
                onClick={navigateToAddressPageFromPopup}
              >
                Add New Address
              </button>
            </div>
          ) : (
            <div className="address-popup-content">
              <p>Please select an address for delivery:</p>
              <div className="address-list">
                {addressState.addresses.map(address => (
                  <div 
                    key={address.id} 
                    className={`address-card ${addressState.selectedAddress && addressState.selectedAddress.id === address.id ? 'selected' : ''}`}
                    onClick={() => handleAddressSelectFromPopup(address)}
                  >
                    <p>
                      <strong>{address.addressLine}</strong>
                      {address.isDefault && <span className="default-badge">Default</span>}
                    </p>
                    <p>{address.addressLine2 ? `${address.addressLine2}, ` : ''}{address.postalCode}</p>
                  </div>
                ))}
              </div>
              <div className="address-popup-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={navigateToAddressPageFromPopup}
                >
                  Manage Addresses
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Navbar isLoggedIn={userState.isLoggedIn} username={userState.username} />
      <HeroSection onSearch={handleSearch} />

      {userState.isLoggedIn && addressState.showPopup && <AddressSelectionPopup />}

      <main className="main-content">
        {(!userState.isLoggedIn || addressState.selectedAddress) && (
          <>
            <div className="food-items-container">
              <h2 style={{ textAlign: 'center' }}>Available Food Items</h2>
              {foodState.loading ? (
                <p style={{ textAlign: 'center' }}>Loading items...</p>
              ) : foodState.error ? (
                <p className="error-message">{foodState.error}</p>
              ) : searchedItems.length === 0 ? (
                foodState.items.length === 0 ?
                  <p style={{ textAlign: 'center' }}>No food items available at the moment.</p> :
                  <p style={{ textAlign: 'center' }}>No food items match your current search or delivery area.</p>
              ) : Object.keys(groupedItems).length === 0 ? (
                <p style={{ textAlign: 'center' }}>Could not categorize food items. Please try again.</p>
              ) : (
                Object.keys(groupedItems).map(categoryId => (
                  <div key={categoryId} className="category-group">
                    <h3 className="category-title">{categoryId !== 'uncategorized' ? categoryId : 'Other Items'}</h3>
                    <div className="food-item-grid">
                      {groupedItems[categoryId].map(item => {
                        const image = FOOD_IMAGE_BASE + item.restaurantName.replace(" ", "_") + "/" + item.imageName;
                        return (
                          <div key={item.id} className="food-item-card-simple">
                            <h3>{item.name}</h3>
                            <img src={image} alt={item.name} onError={(e) => {e.target.src = '/placeholder-food.jpg'; e.target.alt = 'Image not available';}} />
                            {item.categories && <p>{item.categories}</p>}
                            {item.description && <p>{item.description}</p>}
                            <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                            <button
                              className="btn btn-add-to-cart"
                              onClick={() => addToCart({
                                ...item,
                              })}
                            >
                              Add to Cart
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="restaurants-container">
              <h2 style={{ textAlign: 'center' }}>
                Available Restaurants
                {userState.isLoggedIn && addressState.selectedAddress && (
                  <span className="delivery-address-note"> 
                    (Delivery to: {addressState.selectedAddress.addressLine}{addressState.selectedAddress.addressLine2 ? `, ${addressState.selectedAddress.addressLine2}` : ''})
                  </span>
                )}
              </h2>
              
              {restaurantState.loading ? (
                <p style={{ textAlign: 'center' }}>Loading restaurants...</p>
              ) : restaurantState.error ? (
                <p className="error-message">{restaurantState.error}</p>
              ) : restaurantState.restaurants.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No restaurants available at the moment.</p>
              ) : (
                <div className="restaurant-grid">
                  {restaurantState.restaurants.map((restaurant) => (
                    <div key={restaurant.id} className="restaurant-card-simple">
                      <h3>{restaurant.name}</h3>
                      {restaurant.description && <p>{restaurant.description}</p>}
                      {restaurant.address && (
                        <p>
                          <strong>Address:</strong> {restaurant.address}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {cart && (
          <div className="cart-section-container">
            <div className="cart-container">
              <h2>Your Cart</h2>
              {!cart.items ? (
                <p>Your cart is empty. Add some items!</p>
              ) : cart.items.length > 0 ? (
                <>
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map(item => {
                        return (
                          <tr key={item.foodItemId} className="cart-item">
                            <td>{item.foodItemName}</td>
                            <td>${item.price}</td>
                            <td>
                              <div className="quantity-controls">
                                <button onClick={() => updateQuantity(cart.id, item.foodItemId, -1)} disabled={item.qty <= 1}>-</button>
                                <span>{item.amount}</span>
                                <button onClick={() => updateQuantity(cart.id, item.foodItemId, 1)}>+</button>
                              </div>
                            </td>
                            <td>${Number(item.price * item.amount).toFixed(2)}</td>
                            <td>
                              <button className="btn-remove" onClick={() => updateQuantity(cart.id, item.foodItemId, item.amount * -1)}>×</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div className="cart-total">
                    <strong>Total: ${Number(cart.totalPrice).toFixed(2)}</strong>
                  </div>
                  <button
                    className="btn btn-place-order"
                    disabled={cart.items.length === 0}
                    onClick={placeOrder}
                  >
                    Place Order
                  </button>
                </>
              ) : null}
            </div>
          </div>)}

      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
