import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './cartDropdown.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  SHOPPING_CART: `${API_BASE_URL}/shopping_cart/`,
  UPDATE_CART: `${API_BASE_URL}/shopping_cart/update/`,
  CREATE_DONATION_ORDER: `${API_BASE_URL}/order/donate/` // Added from conflict
};

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false); // Initialized to false as fetch is conditional
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // State for donation modal
  const [showDonateCartConfirm, setShowDonateCartConfirm] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donationError, setDonationError] = useState(null);
  const [donationSuccess, setDonationSuccess] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Fetch cart if dropdown is open and cart data is not yet loaded, or if token exists and cart is null (initial load)
    if (isOpen && !cart && token) {
        fetchShoppingCart();
    } else if (token && !cart) { // Initial fetch if token exists but cart is not loaded
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
  }, [isOpen, cart]); // Added isOpen to dependencies to fetch when opened if cart is null

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
      if (err.response && (err.response.status === 401 || err.response.status === 403)) { // Auth error handling
        localStorage.removeItem('token');
        setIsOpen(false); // Close dropdown
        setCart(null); // Clear cart state
        navigate('/login');
      } else if (err.response && err.response.status === 404) { // Cart not found
        setCart(null);
      } else { // Other errors
        setCart(null); // Or handle more gracefully
      }
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (cartId, itemId, amount, isFromSpinwheel, currentPrice) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }

    // Prevent increasing quantity of donated (price === 0) regular items from dropdown
    if (!isFromSpinwheel && currentPrice === 0 && amount > 0) {
      console.warn("Cannot increase quantity of donated items from dropdown.");
      return; 
    }
    
    // For regular items, if current amount is 1 and trying to decrease (amount = -1),
    // and it's a donated item, prevent removal by decrement. Removal should use 'x' button.
    // However, the 'x' button for donated items will also be disabled based on merged logic.
    // This specific check might be redundant if 'x' is disabled for donated items.
    const regularItem = cart?.items?.find(item => item.foodItemId === itemId);
    if (regularItem && regularItem.amount + amount < 1 && (regularItem.amount * -1 !== amount)) {
        if (regularItem.price === 0) { // If it's a donated item, don't allow decrement to zero
            console.warn("Donated items quantity cannot be reduced to zero using '-' button. Use 'x' if removal is intended (and allowed).");
            return;
        }
    }


    try {
      const payload = {
        'shoppingCartId': cartId,
        'foodItemId': itemId,
        'foodItemCount': amount, 
      };
      // If backend needs to distinguish wheel item updates specifically (e.g., for removal)
      // if (isFromSpinwheel && amount < 0) { // Example: if removing a wheel item
      //   payload.isWheelRemoval = true;
      // }

      const response = await axios.post(ENDPOINTS.UPDATE_CART, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'CUSTOMER'
        }
      });

      setCart(response.data); 
      // Check if the cart became empty (both regular items and wheel items)
      if (!response.data || 
          ((!response.data.items || response.data.items.length === 0) && 
           (!response.data.wheels || response.data.wheels.length === 0))) {
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

  const getCombinedCartItems = () => {
    if (!cart) return [];
    
    const combined = [];

    if (cart.items && Array.isArray(cart.items)) {
      cart.items.forEach(item => {
        combined.push({
          key: `item-${item.foodItemId}`,
          foodItemId: item.foodItemId,
          name: item.foodItemName,
          price: item.price,
          amount: item.amount,
          isFromSpinwheel: false,
          isDonated: item.price === 0 // Check if regular item is a donation
        });
      });
    }

    if (cart.wheels && Array.isArray(cart.wheels)) {
      cart.wheels.forEach((wheelItem, index) => {
        combined.push({
          key: `wheel-${wheelItem.foodItemId}-${wheelItem.wheelId}-${index}`, 
          foodItemId: wheelItem.foodItemId,
          name: wheelItem.foodItemName,
          price: wheelItem.price,
          amount: 1, 
          isFromSpinwheel: true,
          isDonated: false // Assuming wheel items are not donations in the price === 0 sense
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
      total += cart.wheels.length; 
    }
    return total;
  };

  // Donation Modal Functions
  const handleOpenDonateCartConfirm = () => {
    setDonationError(null);
    setDonationSuccess(null);
    if (!cart || combinedItemsForDisplay.length === 0 || (cart.totalPrice === 0 && !combinedItemsForDisplay.some(item => item.price > 0) )) {
        setDonationError("Your cart is empty or has no value to donate. Please add items.");
        setTimeout(() => setDonationError(null), 3000);
        return;
    }
    setShowDonateCartConfirm(true);
  };

  const handleCloseDonateCartConfirm = () => {
    setShowDonateCartConfirm(false);
  };

  const handleConfirmCartDonation = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }
    if (!cart || combinedItemsForDisplay.length === 0 || (cart.totalPrice === 0 && !combinedItemsForDisplay.some(item => item.price > 0) )) {
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
      fetchShoppingCart(); // Refresh cart, it should be empty now
      setTimeout(() => {
        setShowDonateCartConfirm(false);
        setDonationSuccess(null);
        setIsOpen(false); // Close dropdown after successful donation
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
                        {item.isDonated && !item.isFromSpinwheel && <span className="donation-tag-inline"> (Donation)</span>}
                      </span>
                      <span className="item-price">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <div className="cart-item-controls">
                      <button 
                        onClick={() => updateItemQuantity(cart.id, item.foodItemId, -1, item.isFromSpinwheel, item.price)} 
                        disabled={item.isFromSpinwheel || item.amount <= 1 || item.isDonated}
                      >
                        -
                      </button>
                      <span className="item-quantity">{item.amount}</span>
                      <button 
                        onClick={() => updateItemQuantity(cart.id, item.foodItemId, 1, item.isFromSpinwheel, item.price)}
                        disabled={item.isFromSpinwheel || item.isDonated}
                      >
                        +
                      </button>
                      <button 
                        className="remove-item" 
                        title="Remove item"
                        onClick={() => updateItemQuantity(cart.id, item.foodItemId, item.amount * -1, item.isFromSpinwheel, item.price)}
                        disabled={item.isFromSpinwheel || item.isDonated} // Donated items also can't be removed this way from dropdown
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
                  <span>${cart.totalPrice ? Number(cart.totalPrice).toFixed(2) : '0.00'}</span>
                </div>
                <div className="cart-actions"> {/* Added for layout */}
                    <button 
                        className="checkout-button" 
                        onClick={placeOrder}
                        disabled={combinedItemsForDisplay.length === 0} // Disable if cart is effectively empty
                    >
                        <span className="button-icon">✔</span>
                        Checkout
                    </button>
                    <button 
                        className="donate-cart-button" 
                        onClick={handleOpenDonateCartConfirm}
                        disabled={!cart || combinedItemsForDisplay.length === 0 || (cart.totalPrice === 0 && !combinedItemsForDisplay.some(item => item.price > 0)) || donating}
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

      {/* Donation Confirmation Modal */}
      {showDonateCartConfirm && (
        <div className="modal-overlay" onClick={(e) => { 
            if (e.target === e.currentTarget) { handleCloseDonateCartConfirm(); }
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