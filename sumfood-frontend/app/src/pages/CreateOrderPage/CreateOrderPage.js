import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './CreateOrderPage.css'; // Ensure styles are appropriate
import axios from 'axios';

const CreateOrderPage = () => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [cart, setCart] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            setIsLoggedIn(true);
            setToken(currentToken);
        } else {
            navigate("/login"); 
        }
    }, [navigate]);

    useEffect(() => {
        const fetchShoppingCart = async () => {
            if (!isLoggedIn || !token) {
                setCart(null); // Clear cart if not logged in or no token
                return;
            }
            try {
                const cartResponse = await axios.get('http://localhost:8080/api/shopping_cart/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                });
                console.log('fetched shopping cart:', cartResponse.data);
                setCart(cartResponse.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setCart(null); // Cart not found
                } else {
                    console.error("Error fetching shopping cart for create order page:", err);
                    setCart(null); // Set to null on other errors
                }
            }
        };

        if (isLoggedIn && token) { // Fetch cart only if logged in and token is confirmed
            fetchShoppingCart();
        }
    }, [isLoggedIn, token]);

    // This function is intended for regular, non-donated items.
    // Controls for wheel items and donated items will be disabled in the UI.
    const updateItemQuantity = async (cartId, itemId, amount) => {
        if (!token) {
            navigate("/login");
            return;
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

            console.log('updating shopping cart item amount:', response.data);
            setCart(response.data);
            window.dispatchEvent(new Event('cart-updated')); // Notify other components like dropdown

            // Check if the cart became empty
            if (!response.data || 
                ((!response.data.items || response.data.items.length === 0) && 
                 (!response.data.wheels || response.data.wheels.length === 0))) {
                setCart(null);
            }
        } catch (err) {
            console.error("Error updating shopping cart item:", err);
            // Optionally re-fetch cart for consistency if update fails
            // fetchShoppingCart(); 
        }
    };

    const createOrder = async () => {
        if (!token) {
            navigate("/login");
            return;
        }
        console.log("Placing order with token:", token);
        try {
            const response = await axios.post('http://localhost:8080/api/order/', {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                });

            console.log('Create order response:', response.data);
            setCart(null); // Clear cart on frontend after successful order
            window.dispatchEvent(new Event('cart-updated')); // Notify dropdown
            navigate("/orders");
        } catch (err) {
            console.error("Error creating order:", err);
            // Consider showing an error message to the user here
        }
    }

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
                    isDonated: item.price === 0 // Regular item is donated if price is 0
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
                    isDonated: false // Assuming wheel items are not marked as 'donated' via price=0
                });
            });
        }
        return combined;
    };
  
    const combinedItemsToDisplay = getCombinedCartItems();
    const isCartEffectivelyEmpty = !cart || combinedItemsToDisplay.length === 0;

    return (
        <div className="app-container">
            <Navbar /> 
            <main className="main-content create-order-page">
                <div className="cart-section-container">
                    <div className="cart-container">
                        <h2>Review Your Order</h2>
                        {isCartEffectivelyEmpty ? (
                            <p className="empty-cart-message">Your cart is empty. <a href="/">Go shopping!</a></p>
                        ) : (
                            <>
                                <table className="cart-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {combinedItemsToDisplay.map(item => {
                                            const controlsDisabled = item.isFromSpinwheel || item.isDonated;
                                            return (
                                                <tr key={item.key} className={`cart-item ${item.isFromSpinwheel ? 'wheel-item' : ''} ${item.isDonated ? 'donated-item' : ''}`}>
                                                    <td>
                                                        {item.isFromSpinwheel && (
                                                            <span className="spinwheel-indicator" role="img" aria-label="won item">🎁 </span>
                                                        )}
                                                        {item.name}
                                                        {item.isDonated && !item.isFromSpinwheel && (
                                                            <span className="donation-tag-inline"> (Donation)</span>
                                                        )}
                                                    </td>
                                                    <td>${Number(item.price).toFixed(2)}</td>
                                                    <td>
                                                        <div className="quantity-controls">
                                                            <button 
                                                                onClick={() => updateItemQuantity(cart.id, item.foodItemId, -1)} 
                                                                disabled={controlsDisabled || item.amount <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <span>{item.amount}</span>
                                                            <button 
                                                                onClick={() => updateItemQuantity(cart.id, item.foodItemId, 1)}
                                                                disabled={controlsDisabled}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>${(Number(item.price) * item.amount).toFixed(2)}</td>
                                                    <td>
                                                        <button 
                                                            className="btn-remove" 
                                                            onClick={() => updateItemQuantity(cart.id, item.foodItemId, item.amount * -1)}
                                                            disabled={controlsDisabled}
                                                            title={controlsDisabled ? "Cannot modify this item" : "Remove item"}
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <div className="cart-summary">
                                    <div className="cart-total">
                                        <strong>Total: ${cart.totalPrice ? Number(cart.totalPrice).toFixed(2) : '0.00'}</strong>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-place-order"
                                    disabled={isCartEffectivelyEmpty}
                                    onClick={createOrder}
                                >
                                    Place Order
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CreateOrderPage;