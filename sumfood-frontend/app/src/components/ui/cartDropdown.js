import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './cartDropdown.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`,
  UPDATE_CART: `${API_BASE_URL}/shopping_cart/update/` // Still needed for regular items
};

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShoppingCart();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    const handleCartUpdate = () => {
      console.log('Cart update detected, refreshing cart data');
      fetchShoppingCart();
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const fetchShoppingCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCart(null); 
        setLoading(false);
        return;
      }
      const cartResponse = await axios.get(ENDPOINTS.SHOPPING_CART, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'CUSTOMER'
        }
      });
      setCart(cartResponse.data);
    } catch (err) {
      console.error("Error fetching shopping cart:", err);
      if (err.response && err.response.status === 404) {
        setCart(null); 
      } else {
        setCart(null); 
      }
    } finally {
      setLoading(false);
    }
  };

  // This function is now only for regular items.
  // Wheel items cannot have their quantity updated or be removed from the dropdown.
  const updateRegularItemQuantity = async (cartId, itemId, amount) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
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

      setCart(response.data); 
      // Check if the cart became empty
      if (!response.data || ((!response.data.items || response.data.items.length === 0) && (!response.data.wheels || response.data.wheels.length === 0))) {
        setCart(null);
      }

    } catch (err) {
      console.error("Error updating shopping cart:", err);
      fetchShoppingCart(); // Re-fetch to ensure consistency on error
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchShoppingCart(); 
    }
    setIsOpen(!isOpen);
  };

  const placeOrder = () => {
    setIsOpen(false);
    navigate('/create_order');
  };

  // Prepare combined list of items for rendering
  const getCombinedCartItems = () => {
    if (!cart) return [];
    
    const combined = [];

    // Add regular items from cart.items
    if (cart.items && Array.isArray(cart.items)) {
      cart.items.forEach(item => {
        combined.push({
          key: `item-${item.foodItemId}`, // Unique key for React
          foodItemId: item.foodItemId,
          name: item.foodItemName,
          price: item.price,
          amount: item.amount,
          isFromSpinwheel: false // Mark as not from spinwheel
        });
      });
    }

    // Add items from cart.wheels
    if (cart.wheels && Array.isArray(cart.wheels)) {
      cart.wheels.forEach((wheelItem, index) => {
        combined.push({
          // Create a more unique key for wheel items
          key: `wheel-${wheelItem.foodItemId}-${wheelItem.wheelId}-${index}`, 
          foodItemId: wheelItem.foodItemId,
          name: wheelItem.foodItemName,
          price: wheelItem.price, // Use price from wheel item
          amount: 1, // Each wheel entry is one item, quantity is fixed
          isFromSpinwheel: true // Mark as from spinwheel
        });
      });
    }
    return combined;
  };
  
  const combinedItemsForDisplay = getCombinedCartItems();

  const getTotalItemCount = () => {
    if (!cart) return 0;
    let total = 0;
    if (cart.items && Array.isArray(cart.items)) {
      total += cart.items.reduce((sum, item) => sum + item.amount, 0);
    }
    if (cart.wheels && Array.isArray(cart.wheels)) {
      total += cart.wheels.length; // Each wheel entry counts as 1
    }
    return total;
  };


  return (
    <div className="cart-dropdown" ref={dropdownRef}>
      <button className="cart-toggle" onClick={toggleDropdown}>
        <span role="img" aria-label="cart">🛒</span> <span className="cart-count">{getTotalItemCount()}</span>
      </button>
      
      {isOpen && (
        <div className="cart-dropdown-content">
          <h3>Your Cart</h3>
          
          {loading ? (
            <p className="cart-loading">Loading cart...</p>
          ) : !cart || combinedItemsForDisplay.length === 0 ? (
            <p className="cart-empty">Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-items-container">
                {combinedItemsForDisplay.map(item => (
                  <div key={item.key} className="cart-dropdown-item">
                    <div className="cart-item-details">
                      <span className="item-name">
                        {item.isFromSpinwheel && (
                          <span className="spinwheel-indicator" role="img" aria-label="won item">🎁 </span>
                        )}
                        {item.name}
                      </span>
                      <span className="item-price">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <div className="cart-item-controls">
                      <button 
                        onClick={() => updateRegularItemQuantity(cart.id, item.foodItemId, -1)} 
                        disabled={item.isFromSpinwheel || item.amount <= 1} // Disabled if wheel item or amount is 1
                      >
                        -
                      </button>
                      <span className="item-quantity">{item.amount}</span>
                      <button 
                        onClick={() => updateRegularItemQuantity(cart.id, item.foodItemId, 1)}
                        disabled={item.isFromSpinwheel} // Disabled if wheel item
                      >
                        +
                      </button>
                      <button 
                        className="remove-item" 
                        title="Remove item"
                        onClick={() => updateRegularItemQuantity(cart.id, item.foodItemId, item.amount * -1)}
                        disabled={item.isFromSpinwheel} // Disabled if wheel item
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-dropdown-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  {/* The totalPrice should come directly from the cart object from backend */}
                  <span>${cart.totalPrice ? Number(cart.totalPrice).toFixed(2) : '0.00'}</span>
                </div>
                <button 
                  className="checkout-button" 
                  onClick={placeOrder}
                  disabled={combinedItemsForDisplay.length === 0}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;