import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import FeaturedDeals from '../../components/home/FeaturedDeals';
import Footer from '../../components/layout/Footer';
import CategoryFilter from '../../components/home/CategoryFilter';
import './MainPage.css';
import axios from 'axios';

const foodCategories = [
  'All', 'Fast Food', 'Pizza', 'Burgers', 'Sushi', 'Chinese', 'Italian', 'Mexican', 'Healthy'
];


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
        <CategoryFilter 
          categories={foodCategories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />

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
                      <p>{item.categories}</p>
                      <p>{item.description}</p>
                      <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
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
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
