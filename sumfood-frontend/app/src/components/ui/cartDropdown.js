import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './cartDropdown.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`,
  UPDATE_CART: `${API_BASE_URL}/shopping_cart/update/`,
  CREATE_DONATION_ORDER: `${API_BASE_URL}/order/donate/`
};

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // State for donation modal
  const [showDonateCartConfirm, setShowDonateCartConfirm] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donationError, setDonationError] = useState(null);
  const [donationSuccess, setDonationSuccess] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !cart) {
    fetchShoppingCart();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleCartUpdate = () => {
      fetchShoppingCart();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [cart]);

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
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        setIsOpen(false);
        navigate('/login');
      } else if (err.response && err.response.status === 404) {
        setCart(null);
      }
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

    const itemToUpdate = cart?.items?.find(item => item.foodItemId === itemId);

    if (itemToUpdate && itemToUpdate.price === 0 && amount > 0) {
      console.warn("Cannot increase quantity of donated items from dropdown.");
      return; 
    }
    if (itemToUpdate && itemToUpdate.amount + amount < 1 && (itemToUpdate.amount * -1 !== amount)) {
        if (itemToUpdate.price === 0) return;
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
      fetchShoppingCart(); 
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

  // Donation
  const handleOpenDonateCartConfirm = () => {
    setDonationError(null);
    setDonationSuccess(null);
    if (!cart || !cart.items || cart.items.length === 0 || cart.totalPrice === 0) {
        setDonationError("Your cart is empty or has no value. Please add items to donate.");
        setTimeout(() => setDonationError(null), 3000); // Clear error after 3s
        return;
    }
    setShowDonateCartConfirm(true);
  };

  const handleCloseDonateCartConfirm = () => {
    setShowDonateCartConfirm(false);
  };

  const handleConfirmCartDonation = async () => {
    const token = localStorage.getItem('token');
    console.log("Token:", token);
    if (!token) {
      navigate("/login");
      return;
    }
    if (!cart || !cart.items || cart.items.length === 0 || cart.totalPrice === 0) {
      setDonationError("Cannot donate an empty or zero-value cart.");
      setTimeout(() => {
        setShowDonateCartConfirm(false);
        setDonationError(null);
      }, 3000);
      return;
    }

    setDonating(true);
    setDonationError(null);
    setDonationSuccess(null);

    try {
      const response = await axios.post(ENDPOINTS.CREATE_DONATION_ORDER, {}, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'CUSTOMER'
        }
      });
      setDonationSuccess(`Successfully created donation order (ID: ${response.data.id}). Thank you!`);
      fetchShoppingCart();
      setTimeout(() => {
        setShowDonateCartConfirm(false);
        setDonationSuccess(null);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      let msg = 'Failed to create donation order.';
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        msg = err.response.data?.message || (typeof err.response.data === 'string' ? err.response.data : msg + ` (Error ${err.response.status})`);
      } else if (err.request) {
        msg = 'Could not connect to server. Please try again.';
      } else {
        msg = `Error: ${err.message}`;
      }
      setDonationError(msg);
    } finally {
      setDonating(false);
    }
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
                {cart.items.map(item => {
                  const isDonated = item.price === 0;
                  return (
                  <div key={item.foodItemId} className="cart-dropdown-item">
                    <div className="cart-item-details">
                      <span className="item-name">{item.foodItemName} {isDonated && <span className="donation-tag-inline">(Donation)</span>}</span>
                      <span className="item-price">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <div className="cart-item-controls">
                      <button 
                        onClick={() => updateQuantity(cart.id, item.foodItemId, -1)} 
                        disabled={item.amount <= 1 || isDonated} // Disable decrement for donated
                      >
                        -
                      </button>
                      <span className="item-quantity">{item.amount}</span>
                      <button 
                        onClick={() => updateQuantity(cart.id, item.foodItemId, 1)}
                        disabled={isDonated} // Disable increment for donated
                      >
                        +
                      </button>
                      <button 
                        className="remove-item" 
                        onClick={() => updateQuantity(cart.id, item.foodItemId, item.amount * -1)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )})}
              </div>
              
              <div className="cart-dropdown-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>${cart.totalPrice ? Number(cart.totalPrice).toFixed(2) : '0.00'}</span>
                </div>
                <div className="cart-actions">
                    <button className="checkout-button" onClick={placeOrder}>
                      <span className="button-icon">✔</span>
                      Checkout
                    </button>
                    <button 
                        className="donate-cart-button" 
                        onClick={handleOpenDonateCartConfirm}
                        disabled={!cart || !cart.items || cart.items.length === 0 || cart.totalPrice === 0 || donating}
                    >
                    <span className="button-icon">❤️</span>
                        Donate This Cart
                    </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showDonateCartConfirm && (
        <div className="modal-overlay" onClick={(e) => { 
            if (e.target === e.currentTarget) { // only close if overlay itself is clicked
                handleCloseDonateCartConfirm();
            }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Cart Donation</h3>
            
            {donationError && <p className="error-message modal-message">{donationError}</p>}
            {donationSuccess && <p className="success-message modal-message">{donationSuccess}</p>}

            {!donationSuccess && (
              <>
                <p>
                  This will create a <strong>new donation order</strong> using the items currently in your shopping cart. 
                  You will be charged the total amount for these items.
                </p>
                <p>
                  Current Cart Total: <strong>${cart && cart.totalPrice ? Number(cart.totalPrice).toFixed(2) : '0.00'}</strong>
                </p>
              </>
            )}
            <div className="modal-actions">
              {!donationSuccess && (
                 <button onClick={handleConfirmCartDonation} className="confirm-btn" disabled={donating}>
                    {donating ? 'Processing...' : 'Yes, Donate & Pay'}
                </button>
              )}
              <button onClick={handleCloseDonateCartConfirm} className="cancel-btn" disabled={donating}>
                {donationSuccess ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;