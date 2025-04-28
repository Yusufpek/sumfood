import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import FeaturedDeals from '../../components/home/FeaturedDeals';
import Footer from '../../components/layout/Footer';
import './MainPage.css';
import axios from 'axios';

// --- Updated Helper Function to handle different category structures ---
const groupItemsByCategory = (items) => {
  if (!items || items.length === 0) return {};
  
  console.log("Items being grouped:", items);
  
  return items.reduce((acc, item) => {
    let categoryId = 'uncategorized';
    
    if (item.category_id) {
      categoryId = item.category_id;
    } else if (item.categoryId) {
      categoryId = item.categoryId;
    } else if (item.category) {
      categoryId = item.category;
    } else if (item.categories) {
      if (typeof item.categories === 'string') {
        categoryId = item.categories;
      } else if (Array.isArray(item.categories) && item.categories.length > 0) {
        categoryId = item.categories[0];
      }
    }
    
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {});
};

const MainPage = () => {
  const FOOD_IMAGE_BASE = "http://localhost:8080/api/food/public/image/";
  const [username, setUsername] = useState('Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [restaurants, setRestaurants] = useState([]);
  const [restLoading, setRestLoading] = useState(true);
  const [restError, setRestError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showAddressPopup, setShowAddressPopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setUsername('User');
    } else {
      setIsLoggedIn(false);
      setUsername('Guest');
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isLoggedIn) {
        return;
      }
      
      setAddressLoading(true);
      setAddressError(null);
      
      try {
        const response = await axios.get('http://localhost:8080/api/customer/address/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        
        console.log('Fetched addresses:', response.data);
        const addressList = Array.isArray(response.data) ? response.data : [];
        setAddresses(addressList);
        
        if (addressList.length > 0) {
          const defaultAddress = addressList.find(addr => addr.isDefault) || addressList[0];
          setSelectedAddress(defaultAddress);
          
          if (!defaultAddress) {
            setShowAddressPopup(true);
          }
        } else {
          setSelectedAddress(null);
          setShowAddressPopup(true);
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setAddressError('Failed to load your addresses');
        setAddresses([]);
        setShowAddressPopup(true);
      } finally {
        setAddressLoading(false);
      }
    };
    
    fetchAddresses();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setRestLoading(true);
      setRestError(null);
      try {
        if (isLoggedIn && !selectedAddress) {
          setRestaurants([]);
          setRestLoading(false);
          return;
        }
        
        let endpoint = 'http://localhost:8080/api/restaurant/public/all';
        
        if (isLoggedIn && selectedAddress) {
          console.log(`Fetching restaurants for address ID: ${selectedAddress.id}`);
        }
        
        const response = await axios.get(endpoint);
        console.log('Fetched restaurants:', response.data);
        setRestaurants(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        let displayError = 'Failed to load restaurants. An unexpected error occurred.';
        if (err.response) {
          displayError = `Failed to load restaurants. Server error ${err.response.status}.`;
          if (err.response.data && err.response.data.message) {
            displayError += ` Message: ${err.response.data.message}`;
          } else if (typeof err.response.data === 'string' && err.response.data.length < 200) {
            displayError += ` Details: ${err.response.data}`;
          }
        } else if (err.request) {
          displayError = 'Failed to load restaurants. Cannot reach server.';
        } else {
          displayError = `Failed to load restaurants: ${err.message}`;
        }
        setRestError(displayError);
        setRestaurants([]);
      } finally {
        setRestLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [selectedAddress, isLoggedIn]);

  useEffect(() => {
    const fetchAllFoodItems = async () => {
      if (isLoggedIn && !selectedAddress) {
        setFoodItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8080/api/food/public/items');
        console.log('Fetched food items:', response.data);
        const items = Array.isArray(response.data) ? response.data : [];
        console.log('Number of food items fetched:', items.length);
        if (items.length > 0) {
          console.log('Sample food item structure:', items[0]);
        }
        setFoodItems(items);
      } catch (err) {
        console.error("Error fetching food items:", err);
        let displayError = 'Failed to load food items. An unexpected error occurred.';
        if (err.response) {
          console.error("Error Response Status:", err.response.status);
          console.error("Error Response Data:", err.response.data);
          displayError = `Failed to load items. Server error ${err.response.status}.`;
          if (err.response.data && err.response.data.message) {
            displayError += ` Message: ${err.response.data.message}`;
          } else if (typeof err.response.data === 'string' && err.response.data.length < 200) {
            displayError += ` Details: ${err.response.data}`;
          }
        } else if (err.request) {
          displayError = 'Failed to load items. Cannot reach server.';
        } else {
          displayError = `Failed to load items: ${err.message}`;
        }
        setError(displayError);
        setFoodItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllFoodItems();
  }, [isLoggedIn, selectedAddress]);

  useEffect(() => {
    const fetchShoppingCart = async () => {
      setCart(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        const cartResponse = await axios.get('http://localhost:8080/api/shopping_cart/', {
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
    setSelectedAddress(address);
    setShowAddressPopup(false);
  };
  
  const navigateToAddressPageFromPopup = () => {
    setShowAddressPopup(false);
    navigate('/profile', { state: { activeSection: 'Manage Addresses' } });
  };

  const addToCart = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/");
    }

    try {
      const cartResponse = await axios.get('http://localhost:8080/api/shopping_cart/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'CUSTOMER'
        }
      });
      console.log('fetched shopping cart:', cartResponse.data);
      const cart = cartResponse.data;
      try {
        const response = await axios.post('http://localhost:8080/api/shopping_cart/update/',
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
          const response = await axios.post('http://localhost:8080/api/shopping_cart/',
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
      const response = await axios.post('http://localhost:8080/api/shopping_cart/update/',
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
    if (!foodItems || foodItems.length === 0) {
      console.log("No food items to filter");
      return [];
    }
    
    console.log(`Filtering ${foodItems.length} food items`);
    let filteredItems = foodItems;
    
    if (isLoggedIn && restaurants.length > 0) {
      console.log(`Filtering by ${restaurants.length} available restaurants`);
      const availableRestaurantIds = restaurants.map(r => r.id);
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
  }, [foodItems, searchTerm, restaurants, isLoggedIn]);

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
          {addressLoading ? (
            <p>Loading your addresses...</p>
          ) : addressError ? (
            <div>
              <p className="error-message">{addressError}</p>
              <button 
                className="btn btn-primary"
                onClick={navigateToAddressPageFromPopup}
              >
                Add New Address
              </button>
            </div>
          ) : addresses.length === 0 ? (
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
                {addresses.map(address => (
                  <div 
                    key={address.id} 
                    className={`address-card ${selectedAddress && selectedAddress.id === address.id ? 'selected' : ''}`}
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
      <Navbar isLoggedIn={isLoggedIn} username={username} />
      <HeroSection onSearch={handleSearch} />

      {isLoggedIn && showAddressPopup && <AddressSelectionPopup />}

      <main className="main-content">
        {(!isLoggedIn || selectedAddress) && (
          <>
            <div className="food-items-container">
              <h2 style={{ textAlign: 'center' }}>Available Food Items</h2>
              {loading ? (
                <p style={{ textAlign: 'center' }}>Loading items...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : searchedItems.length === 0 ? (
                foodItems.length === 0 ?
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
                {isLoggedIn && selectedAddress && (
                  <span className="delivery-address-note"> 
                    (Delivery to: {selectedAddress.addressLine}{selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''})
                  </span>
                )}
              </h2>
              
              {restLoading ? (
                <p style={{ textAlign: 'center' }}>Loading restaurants...</p>
              ) : restError ? (
                <p className="error-message">{restError}</p>
              ) : restaurants.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No restaurants available at the moment.</p>
              ) : (
                <div className="restaurant-grid">
                  {restaurants.map((restaurant) => (
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
            
            <div className="mid-section-container">
              <FeaturedDeals />
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
