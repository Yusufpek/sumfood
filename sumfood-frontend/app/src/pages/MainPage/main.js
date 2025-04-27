import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import FeaturedDeals from '../../components/home/FeaturedDeals';
import Footer from '../../components/layout/Footer';
import CategoryFilter from '../../components/home/CategoryFilter';
import './MainPage.css';
import axios from 'axios';

// --- Helper Function (keep as is) ---
const groupItemsByCategory = (items) => {
  if (!items) return {};
  return items.reduce((acc, item) => {
    const categoryId = item.category_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {});
};

const MainPage = () => {
  // --- State (Updated: Removed category list state) ---
  const [username, setUsername] = useState('Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- New state for restaurants ---
  const [restaurants, setRestaurants] = useState([]);
  const [restLoading, setRestLoading] = useState(true);
  const [restError, setRestError] = useState(null);

  // --- Cart State ---
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState({ loading: false, error: null, success: null });

  const navigate = useNavigate();

  // --- Effects (keep as is) ---
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
    const fetchAllFoodItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8080/api/food/public/items');
        console.log('Fetched food items:', response.data);
        setFoodItems(Array.isArray(response.data) ? response.data : []);
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
  }, []);

  // --- New effect for fetching restaurants ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      setRestLoading(true);
      setRestError(null);
      try {
        const response = await axios.get('http://localhost:8080/api/restaurant/public/all');
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
  }, []);

  // --- Event Handlers (keep as is) ---
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Cart Management
  const addToCart = (item) => {
    setOrderStatus({ loading: false, error: null, success: null }); // Clear order status on new add
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      } else {
        const { id, name, price} = item;
        return [...prevCart, { id, name, price, qty: 1 }];
      }
    });
  };

  const updateQuantity = (itemId, amount) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQty = item.qty + amount;
          return newQty > 0 ? { ...item, qty: newQty } : null; // Return null if qty becomes 0 or less
        }
        return item;
      }).filter(item => item !== null); // Filter out items marked as null (removed)
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // --- Calculate Cart Total ---
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
  }, [cart]);

  // --- Place Order Function ---
  const placeOrder = async () => {
    if (!isLoggedIn) {
      setOrderStatus({ loading: false, error: "Please log in to place an order.", success: null });
      return;
    }

    if (cart.length === 0) {
      setOrderStatus({ loading: false, error: "Your cart is empty.", success: null });
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      setOrderStatus({ loading: false, error: "Authentication token not found. Please log in again.", success: null });
      return;
    }
  
    setOrderStatus({ loading: true, error: null, success: null });
  
    let lastOrderResponse = null;

    for (const item of cart) {
      const orderPayload = {
        foodItemId: item.id,
        foodItemCount: item.qty,
        restaurantId: item.restaurantId,
      };
  
      try {
        const response = await axios.post('http://localhost:8080/api/shopping_cart/', orderPayload, {
          headers: { 'Authorization': `Bearer ${token}`,
          "Role": "CUSTOMER" },
        });

        console.log("Order placed successfully:", response.data);
        lastOrderResponse = response.data;
        

        //setCart([]); // Clear cart after each order
        // navigate('/orders');
        // return;
      } catch (err) {
        let orderError = 'Order failed. Please try again.';
        if (err.response) {
          orderError = `Order failed: ${err.response.data?.message || `Server error ${err.response.status}`}`;
        } else if (err.request) {
          orderError = 'Order failed: Could not reach server.';
        } else {
          orderError = `Order failed: ${err.message}`;
        }
        setOrderStatus({ loading: false, error: orderError, success: null });
        return;
      }
    }

    if (lastOrderResponse) {
      setOrderStatus({ 
        loading: false, 
        error: null, 
        success: `Order placed successfully! Redirecting...`
      });
      
      // Clear cart
      setCart([]);
      
      setTimeout(() => {
        navigate('/orders');
      }, 1000); // 1-second delay
    }

  };

  // --- Derived State and Grouping (Updated: Removed category filtering) ---
  const searchedItems = useMemo(() => {
    if (!foodItems) return [];
    return foodItems.filter(item =>
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [foodItems, searchTerm]);

  const groupedItems = useMemo(() => groupItemsByCategory(searchedItems), [searchedItems]);  

  // --- Render Logic ---
  return (
    <div className="app-container">
      <Navbar isLoggedIn={isLoggedIn} username={username} />
      <HeroSection onSearch={handleSearch} />

      <main className="main-content">
        {/* Food Items Section */}
        <div className="food-items-container">
          <h2 style={{ textAlign: 'center' }}>Available Food Items</h2>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading items...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : Object.keys(groupedItems).length === 0 ? (
            foodItems.length === 0 ?
              <p style={{ textAlign: 'center' }}>No food items available at the moment.</p> :
              <p style={{ textAlign: 'center' }}>No food items match your current search.</p>
          ) : (
            Object.keys(groupedItems).map(categoryId => (
              <div key={categoryId} className="category-group">
                <div className="food-item-grid">
                {groupedItems[categoryId].map(item => (
                  <div key={item.id} className="food-item-card-simple">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                    <button className='btn btn-add-cart' onClick={() => addToCart(item)}>Add to Cart</button>
                  </div>
                ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Restaurants Section with Card Style */}
                {/* Restaurants Section with Card Style */}
                <div className="restaurants-container"> {/* Container for centering */}
          <h2 style={{ textAlign: 'center' }}>Available Restaurants</h2>
          {restLoading ? (
            <p style={{ textAlign: 'center' }}>Loading restaurants...</p>
          ) : restError ? (
            <p className="error-message">{restError}</p>
          ) : restaurants.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No restaurants available at the moment.</p>
          ) : (
            <div className="restaurant-grid"> {/* Grid layout for cards */}
              {restaurants.map((restaurant) => (
                // Card for each restaurant
                <div key={restaurant.id} className="restaurant-card-simple">
                  <h3>{restaurant.name}</h3>
                  {/* Conditionally display description and address if they exist */}
                  {restaurant.description && <p>{restaurant.description}</p>}
                  {restaurant.address && (
                    <p>
                      <strong>Address:</strong> {restaurant.address}
                    </p>
                  )}
                  {/* You could add more details here if available, e.g., phone number */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Removed CategoryFilter; keeping FeaturedDeals */}
        <div className="mid-section-container">
          <FeaturedDeals />
        </div>
        
        <div className="cart-section-container"> {/* New container for centering */}
          <div className="cart-container">
            <h2>Your Cart</h2>
            {orderStatus.error && <p className="cart-error-message">{orderStatus.error}</p>}
            {orderStatus.success && <p className="cart-success-message">{orderStatus.success}</p>}
            {cart.length === 0 && !orderStatus.success ? ( // Show empty message only if no success message
              <p>Your cart is empty. Add some items!</p>
            ) : cart.length > 0 ? ( // Only show table if cart has items
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
                    {cart.map(item => (
                      <tr key={item.id} className="cart-item">
                        <td>{item.name}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                          <div className="quantity-controls">
                            <button onClick={() => updateQuantity(item.id, -1)} disabled={item.qty <= 1}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                          </div>
                        </td>
                        <td>${(item.price * item.qty).toFixed(2)}</td>
                        <td>
                          <button className="btn-remove" onClick={() => removeFromCart(item.id)}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="cart-total">
                  <strong>Total: ${cartTotal.toFixed(2)}</strong>
                </div>
                <button
                  className="btn btn-place-order"
                  disabled={cart.length === 0 || orderStatus.loading} // Disable if cart empty or order placing
                  onClick={placeOrder}
                >
                  {orderStatus.loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </>
            ) : null /* Don't show table/total/button if cart is empty after success */}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
