import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './CreateOrderPage.css'; // Ensure styles are appropriate
import axios from 'axios';


const CreateOrderPage = () => {
    const [token, setToken] = useState(localStorage.getItem('token') || 'Guest'); // Initialize token from localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // Initialize isLoggedIn
    // const [loading, setLoading] = useState(true); // setLoading is not used, can be removed if not needed later

    const [cart, setCart] = useState(null); // Initialize cart to null

    const navigate = useNavigate();

    useEffect(() => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            setIsLoggedIn(true);
            setToken(currentToken);
        } else {
            navigate("/login"); // Redirect if not logged in
        }
    }, [navigate]);

    useEffect(() => {
        const fetchShoppingCart = async () => {
            // setCart(null); // Setting to null can cause brief "empty" flash, let loading handle it
            if (!isLoggedIn || !token) { // Ensure user is logged in and token exists
                // setLoading(false); // if loading state was used
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
                console.error("Error fetching shopping cart:", err);
                setCart(null); // Set to null on error or if cart not found
            }
            // finally { setLoading(false); } // if loading state was used
        };

        if (isLoggedIn) { // Fetch cart only if logged in
            fetchShoppingCart();
        }
    }, [isLoggedIn, token]); // Add token as dependency

    // This function is now only for regular items.
    const updateRegularItemQuantity = async (cartId, itemId, amount) => {
        if (!token) {
            navigate("/login"); // Should not happen if already on this page
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
            // Check if the cart became empty
            if (!response.data || ((!response.data.items || response.data.items.length === 0) && (!response.data.wheels || response.data.wheels.length === 0))) {
                setCart(null);
            }
        } catch (err) {
            console.error("Error updating shopping cart item:", err);
            // Optionally re-fetch cart for consistency
            // fetchShoppingCart(); 
        }
    };

    const createOrder = async () => {
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/order/', {}, // Empty body as per original
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                });

            console.log('create order response:', response.data);
            // After successful order creation, the cart is usually emptied by the backend.
            // Navigating to orders page implies success.
            navigate("/orders");
        } catch (err) {
            console.error("Error creating order:", err);
            // Handle order creation error (e.g., show a message to the user)
            // setCart(null); // Don't nullify cart on order error, user might want to retry
        }
    }

    // Prepare combined list of items for rendering (similar to cartDropdown)
    const getCombinedCartItems = () => {
        if (!cart) return [];
        
        const combined = [];

        // Add regular items from cart.items
        if (cart.items && Array.isArray(cart.items)) {
            cart.items.forEach(item => {
                combined.push({
                    key: `item-${item.foodItemId}`,
                    foodItemId: item.foodItemId,
                    name: item.foodItemName,
                    price: item.price,
                    amount: item.amount,
                    isFromSpinwheel: false
                });
            });
        }

        // Add items from cart.wheels
        if (cart.wheels && Array.isArray(cart.wheels)) {
            cart.wheels.forEach((wheelItem, index) => {
                combined.push({
                    key: `wheel-${wheelItem.foodItemId}-${wheelItem.wheelId}-${index}`, 
                    foodItemId: wheelItem.foodItemId,
                    name: wheelItem.foodItemName,
                    price: wheelItem.price,
                    amount: 1, // Each wheel entry is one item
                    isFromSpinwheel: true
                });
            });
        }
        return combined;
    };
  
    const combinedItemsToDisplay = getCombinedCartItems();
    const isCartEmpty = !cart || combinedItemsToDisplay.length === 0;

    return (
        <div className="app-container">
            {/* Pass correct props to Navbar if needed, e.g., from a context or Redux store */}
            <Navbar /> 

            <main className="main-content create-order-page"> {/* Added specific class */}
                <div className="cart-section-container">
                    <div className="cart-container">
                        <h2>Review Your Order</h2>
                        {isCartEmpty ? (
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
                                            return (
                                                <tr key={item.key} className={`cart-item ${item.isFromSpinwheel ? 'wheel-item' : ''}`}>
                                                    <td>
                                                        {item.isFromSpinwheel && (
                                                            <span className="spinwheel-indicator" role="img" aria-label="won item">🎁 </span>
                                                        )}
                                                        {item.name}
                                                    </td>
                                                    <td>${Number(item.price).toFixed(2)}</td>
                                                    <td>
                                                        <div className="quantity-controls">
                                                            <button 
                                                                onClick={() => updateRegularItemQuantity(cart.id, item.foodItemId, -1)} 
                                                                disabled={item.isFromSpinwheel || item.amount <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <span>{item.amount}</span>
                                                            <button 
                                                                onClick={() => updateRegularItemQuantity(cart.id, item.foodItemId, 1)}
                                                                disabled={item.isFromSpinwheel}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>${(Number(item.price) * item.amount).toFixed(2)}</td>
                                                    <td>
                                                        <button 
                                                            className="btn-remove" 
                                                            onClick={() => updateRegularItemQuantity(cart.id, item.foodItemId, item.amount * -1)}
                                                            disabled={item.isFromSpinwheel}
                                                            title={item.isFromSpinwheel ? "Cannot remove won items here" : "Remove item"}
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
                                    {/* Add other summary details like delivery fee, taxes if applicable */}
                                </div>
                                <button
                                    className="btn btn-place-order"
                                    disabled={isCartEmpty} // Disable if no items in cart
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