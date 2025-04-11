import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/home/HeroSection';
import CategoryFilter from '../../components/home/CategoryFilter';
import FeaturedDeals from '../../components/home/FeaturedDeals';
import RestaurantList from '../../components/home/RestaurantList';
import Footer from '../../components/layout/Footer';
import './MainPage.css';

const MainPage = () => {
  const [username, setUsername] = useState('User');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const foodCategories = [
    'All', 'Fast Food', 'Pizza', 'Burgers', 'Sushi', 'Chinese', 'Italian', 'Mexican', 'Healthy'
  ];
  
  const restaurants = [
    {
      id: 1,
      name: 'Burger Palace',
      image: 'burger.jpg',
      rating: 4.7,
      deliveryTime: '15-25',
      minimumOrder: 15,
      categories: ['Fast Food', 'Burgers']
    },
  ];
  
  useEffect(() => {
    const fetchUserData = () => {
      setTimeout(() => {
        setUsername('Hans');
        setIsLoggedIn(true);
      }, 500);
    };
    
    fetchUserData();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };
  
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCategory = selectedCategory === 'All' || restaurant.categories.includes(selectedCategory);
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        <FeaturedDeals />
        <RestaurantList 
          restaurants={filteredRestaurants} 
          onResetFilters={resetFilters} 
        />
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
