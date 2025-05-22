import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import StarRatingDisplay from '../../components/common/StarRatingDisplay';
import './FavoriteRestaurantsPage.css';

const API_BASE_URL = 'http://localhost:8080/api';
const CUSTOMER_FAVORITES_ENDPOINT = `${API_BASE_URL}/customer/favorites`;
const RESTAURANT_LOGO_BASE = `${API_BASE_URL}/restaurant/public/image/`;


function FavoriteRestaurantsPage() {
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(CUSTOMER_FAVORITES_ENDPOINT, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Role': 'CUSTOMER' }
                });
                setFavoriteRestaurants(response.data || []);
                console.log("Favorite Restaurants:", response.data);
            } catch (err) {
                console.error("Error fetching favorite restaurants:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError("Could not load your favorite restaurants. Please try again later.");
                }
                setFavoriteRestaurants([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [navigate]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="favorites-page loading-favorites">Loading your favorite restaurants...</div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="favorites-page error-favorites">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="favorites-page-container">
                <header className="favorites-header">
                    <h1>Your Favorite Restaurants</h1>
                </header>
                {favoriteRestaurants.length === 0 ? (
                    <div className="no-favorites-message">
                        <p>You haven't added any favorite restaurants yet!</p>
                        <p>Explore restaurants and click the ❤️ icon to add them.</p>
                        <Link to="/main" className="btn btn-primary">Browse Restaurants</Link>
                    </div>
                ) : (
                    <div className="favorite-restaurants-grid">
                        {favoriteRestaurants.map(restaurant => (
                            <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id} className="favorite-restaurant-card-link">
                                <div className="favorite-restaurant-card">
                                    <img
                                        src={`${RESTAURANT_LOGO_BASE}${restaurant.logoName}`}
                                        alt={restaurant.displayName || restaurant.name}
                                        className="favorite-restaurant-logo"
                                        onError={(e) => { e.target.src = '/placeholder-restaurant.png'; }}
                                    />
                                    <div className="favorite-restaurant-info">
                                        <h3>{restaurant.displayName || restaurant.name}</h3>
                                        <p className="favorite-restaurant-address">
                                            {restaurant.addressShort || restaurant.address?.split(',')[0] || 'Location details'}
                                        </p>
                                        {restaurant.averageRate != null && (
                                            <div className="favorite-restaurant-rating">
                                                <StarRatingDisplay rating={restaurant.averageRate} size={18} />
                                                <span>({restaurant.reviewCount || 0} reviews)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default FavoriteRestaurantsPage;