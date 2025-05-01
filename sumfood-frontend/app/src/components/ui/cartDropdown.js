import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './cartDropdown.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`,
  UPDATE_CART: `${API_BASE_URL}/shopping_cart/update/`
};

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShoppingCart();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    // Listen for cart updates from other components
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
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, itemId, amount) => {
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
    } catch (err) {
      console.error("Error updating shopping cart:", err);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchShoppingCart(); // Refresh cart data when opening
    }
    setIsOpen(!isOpen);
  };

  const placeOrder = () => {
    setIsOpen(false);
    navigate('/create_order');
  };

  const getItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.amount, 0);
  };

  return (
    <div className="cart-dropdown" ref={dropdownRef}>
      <button className="cart-toggle" onClick={toggleDropdown}>
        🛒 <span className="cart-count">{getItemCount()}</span>
      </button>
      
      {isOpen && (
        <div className="cart-dropdown-content">
          <h3>Your Cart</h3>
          
          {loading ? (
            <p className="cart-loading">Loading cart...</p>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <p className="cart-empty">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items-container">
                {cart.items.map(item => (
                  <div key={item.foodItemId} className="cart-dropdown-item">
                    <div className="cart-item-details">
                      <span className="item-name">{item.foodItemName}</span>
                      <span className="item-price">${item.price}</span>
                    </div>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(cart.id, item.foodItemId, -1)} disabled={item.amount <= 1}>-</button>
                      <span className="item-quantity">{item.amount}</span>
                      <button onClick={() => updateQuantity(cart.id, item.foodItemId, 1)}>+</button>
                      <button className="remove-item" onClick={() => updateQuantity(cart.id, item.foodItemId, item.amount * -1)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-dropdown-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>${Number(cart.totalPrice).toFixed(2)}</span>
                </div>
                <button className="checkout-button" onClick={placeOrder}>Checkout</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
