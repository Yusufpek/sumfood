import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './CreateOrderPage.css';
import axios from 'axios';

const CreateOrderPage = () => {
    // --- State (Updated: Removed category list state) ---
    const FOOD_IMAGE_BASE = "http://localhost:8080/api/food/public/image/";
    const [token, setToken] = useState('Guest');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- Cart State ---
    const [cart, setCart] = useState(null);

    const navigate = useNavigate();

    // --- Effects (keep as is) ---
    useEffect(() => {
        const localToken = localStorage.getItem('token');
        if (localToken) {
            setIsLoggedIn(true);
            setToken(localToken);
        } else {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchShoppingCart = async () => {
            try {
                const currentToken = localStorage.getItem('token');
                if (!currentToken) {
                    setCart(null);
                    return;
                }
                const cartResponse = await axios.get('http://localhost:8080/api/shopping_cart/', {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                        'Role': 'CUSTOMER'
                    }
                });
                console.log('fetched shopping cart:', cartResponse.data);
                setCart(cartResponse.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setCart(null); // Cart not found, set to null
                } else {
                    console.error("Error fetching shopping cart for create order page:", err);
                    setCart(null); // Set to null on other errors too
                }
            }
        };
        fetchShoppingCart();
    }, []);

    const updateQuantity = async (cartId, itemId, amount) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            navigate("/login");
            return;
        }
        const itemToUpdate = cart?.items?.find(item => item.foodItemId === itemId);
        if (itemToUpdate && itemToUpdate.price === 0 && amount > 0) {
            alert("Donated items quantity cannot be increased.");
            return;
        }
        
        if (itemToUpdate && itemToUpdate.amount + amount < 1 && (itemToUpdate.amount * -1 !== amount)) {
             // This condition means we are trying to decrement below 1, but not removing the item entirely.
             // For donated items, this means they can only be removed, not decremented to 0.
             // For regular items, this logic already prevents going below 1.
            if (itemToUpdate.price === 0) {
                 alert("Donated items can only be removed, not reduced to zero quantity.");
                 return;
            }
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
                        'Authorization': `Bearer ${currentToken}`,
                        'Role': 'CUSTOMER'
                    }
                });

            console.log('Updated quantity by:', amount);
            console.log('Updating shopping cart item amount response:', response.data);
            setCart(response.data);
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            console.error("Error updating shopping cart quantity:", err); 
        }
    };

    // --- Place Order Function ---
    const createOrder = async () => {
        const currentToken = localStorage.getItem('token');

        if (!currentToken) {
            navigate("/login"); // Redirect if no token
            return;
        }
        console.log("Placing order with token:", currentToken);
        try {
            const response = await axios.post('http://localhost:8080/api/order/', {},
                {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                        'Role': 'CUSTOMER'
                    }
                });

            console.log('Create order response:', response.data);
            setCart(null);
            window.dispatchEvent(new Event('cart-updated'));
            navigate("/orders");
        } catch (err) {
            console.error("Error creating order:", err);
            setCart(null);
        }
    }

    // --- Render Logic ---
    return (
        <div className="app-container">
            <Navbar isLoggedIn={isLoggedIn} username={`User`} />

            <main className="main-content">
                                {cart && (
                    <div className="cart-section-container">
                        <div className="cart-container">
                            <h2>Your Shopping Cart</h2>
                            {(!cart.items || cart.items.length === 0) ? (
                                <p>Your cart is empty. Add some items!</p>
                            ) : (
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
                                                const isDonated = item.price === 0;
                                                return (
                                                    <tr key={item.foodItemId} className="cart-item">
                                                        <td>{item.foodItemName} {isDonated && <span className="donation-tag-inline">(Donation)</span>}</td>
                                                        <td>${Number(item.price).toFixed(2)}</td>
                                                        <td>
                                                            <div className="quantity-controls">
                                                                <button 
                                                                    onClick={() => updateQuantity(cart.id, item.foodItemId, -1)} 
                                                                    disabled={item.amount <= 1 || isDonated}
                                                                >
                                                                    -
                                                                </button>
                                                                <span>{item.amount}</span>
                                                                <button 
                                                                    onClick={() => updateQuantity(cart.id, item.foodItemId, 1)}
                                                                    disabled={isDonated}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>${(item.price * item.amount).toFixed(2)}</td>
                                                        <td>
                                                            <button 
                                                                className="btn-remove" 
                                                                onClick={() => updateQuantity(cart.id, item.foodItemId, item.amount * -1)}
                                                            >
                                                                ×
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="cart-total">
                                        <strong>Total: ${cart.totalPrice ? cart.totalPrice.toFixed(2) : '0.00'}</strong>
                                    </div>
                                    <button
                                        className="btn btn-place-order"
                                        disabled={!cart.items || cart.items.length === 0}
                                        onClick={createOrder}
                                    >
                                        Order
                                    </button>
                                </>
                            )}
                        </div>
                    </div>)}
            </main>
            <Footer />
        </div>
    );
};

export default CreateOrderPage;
