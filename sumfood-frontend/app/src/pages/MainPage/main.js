import React, { useState, useEffect } from 'react';
// Using fetch API as in previous examples, but you can use axios if preferred
// import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Keep for potential future use
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import CategoryFilter from '../../components/home/CategoryFilter';
import FeaturedDeals from '../../components/home/FeaturedDeals';
// Removed RestaurantList import
import Footer from '../../components/layout/Footer';
import './MainPage.css'; // Ensure this file exists and has the necessary styles
import axios from 'axios';

const MainPage = () => {
  // State
  const [username, setUsername] = useState('Guest'); // Default to Guest
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Removed userType state as it's not needed for displaying public items
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodItems, setFoodItems] = useState([]); // State for fetched food items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories (as before)
  const foodCategories = [
    'All', 'Fast Food', 'Pizza', 'Burgers', 'Sushi', 'Chinese', 'Italian', 'Mexican', 'Healthy'
  ];

  // Check login status on mount (for Navbar display)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // TODO: Fetch actual username based on token if desired
      setUsername('User'); // Update placeholder
    } else {
      setIsLoggedIn(false);
      setUsername('Guest');
    }
  }, []);

    // Fetch ALL food items from the PUBLIC endpoint
  useEffect(() => {
    const fetchAllFoodItems = async () => {
      setLoading(true);
      setError(null);

      try {
        // Using axios as imported
        const response = await axios.get('http://localhost:8080/api/food/public/items');
        console.log('Fetched food items:', response.data);
        setFoodItems(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching food items:", err); // Log the full error object

        let displayError = 'Failed to load food items. An unexpected error occurred.'; // Default message

        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error Response Status:", err.response.status);
          console.error("Error Response Data:", err.response.data); // Log response data if any
          displayError = `Failed to load items. Server error ${err.response.status}.`;
          // Try to get a message from the backend's error response structure (if provided)
          if (err.response.data && err.response.data.message) {
            displayError += ` Message: ${err.response.data.message}`;
          } else if (typeof err.response.data === 'string' && err.response.data.length < 200) {
             // If data is a short string, maybe it's the message
             displayError += ` Details: ${err.response.data}`;
          }
        } else if (err.request) {
          // The request was made but no response received (network error)
          displayError = 'Failed to load items. Cannot reach server.';
        } else {
          // Something happened setting up the request that triggered an Error
          displayError = `Failed to load items: ${err.message}`;
        }

        setError(displayError); // Set the potentially more detailed error
        setFoodItems([]); // Clear items on error
      } finally {
        setLoading(false);
      }
    };

    fetchAllFoodItems();
  }, []); // Runs once on component mount



  // --- Event Handlers ---
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // --- Filtering Logic (for food items) ---
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = searchTerm === '' ||
                          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Basic category check
    const matchesCategory = selectedCategory === 'All';
    // TODO: Implement better category filtering using item.category_id

    return matchesSearch && matchesCategory;
  });

  // --- Render Logic ---
  return (
    <div className="app-container">
      {/* Navbar shows login status */}
      <Navbar isLoggedIn={isLoggedIn} username={username} />
      <HeroSection onSearch={handleSearch} />

      <main className="main-content">
        <CategoryFilter
          categories={foodCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <FeaturedDeals />

        {/* Section to display all available food items */}
        <h2 style={{ marginTop: '30px' }}>Available Food Items</h2>

        {/* Conditional Rendering */}
        {loading ? (
          <p>Loading items...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredItems.length === 0 ? (
          <p>No food items available or none match the current filter.</p>
        ) : (
          // Display fetched food items
          <div className="food-item-grid"> {/* Use CSS from previous example */}
            {filteredItems.map(item => (
              <div key={item.id} className="food-item-card-simple"> {/* Use CSS from previous example */}
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                {/* Display stock only if relevant for customers */}
                {/* <p><small>Stock: {item.stock}</small></p> */}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
