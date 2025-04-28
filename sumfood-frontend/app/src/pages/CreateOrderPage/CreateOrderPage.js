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
    const [cart, setCart] = useState([]);

    const navigate = useNavigate();

    // --- Effects (keep as is) ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            setToken(token);
        } else {
            navigate("/login");
        }
    }, [navigate]);

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

    const updateQuantity = async (cartId, itemId, amount) => {
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

    // --- Place Order Function ---
    const createOrder = async () => {
        if (!token) {
            navigate("/");
        }
        try {
            const response = await axios.post('http://localhost:8080/api/order/',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Role': 'CUSTOMER'
                    }
                });

            console.log('create order:', response.data);
            // setCart(response.data);
        } catch (err) {
            console.error("Error creating shopping cart:", err);
            setCart(null);
        }
    }

    // --- Render Logic ---
    return (
        <div className="app-container">
            <Navbar isLoggedIn={isLoggedIn} username={`User`} />

            <main className="main-content">
                {cart && (
                    <div className="cart-section-container"> {/* New container for centering */}
                        <div className="cart-container">
                            <h2>Your Shopping Cart</h2>
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
                                                        <td>${(item.price * item.amount)}</td>
                                                        <td>
                                                            <button className="btn-remove" onClick={() => updateQuantity(cart.id, item.foodItemId, item.amount * -1)}>×</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="cart-total">
                                        <strong>Total: ${cart.totalPrice.toFixed(2)}</strong>
                                    </div>
                                    <button
                                        className="btn btn-place-order"
                                        disabled={cart.items.length === 0}
                                        onClick={createOrder}
                                    >
                                        Order
                                    </button>
                                </>
                            ) : null /* Don't show table/total/button if cart is empty after success */}
                        </div>
                    </div>)}

            </main>

            <Footer />
        </div>
    );
};

export default CreateOrderPage;
