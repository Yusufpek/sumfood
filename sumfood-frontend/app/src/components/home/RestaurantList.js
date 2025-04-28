import React from 'react';
import RestaurantCard from './RestaurantCard';
import './RestaurantList.css';

const RestaurantList = ({ restaurants, onResetFilters }) => {
  return (
    <div className="restaurants-section">
      <h2>Restaurants Near You</h2>
      <div className="restaurant-grid">
        {restaurants.length > 0 ? (
          restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        ) : (
          <div className="no-results">
            <p>No restaurants found matching your criteria.</p>
            <button onClick={onResetFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;
