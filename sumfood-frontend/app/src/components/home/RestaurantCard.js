import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card">
      <div className="restaurant-image"></div>
      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <div className="restaurant-meta">
          <span className="rating">★ {restaurant.rating}</span>
          <span className="delivery-time">{restaurant.deliveryTime} min</span>
          <span className="minimum-order">${restaurant.minimumOrder} min</span>
        </div>
        <div className="restaurant-categories">
          {restaurant.categories.join(' • ')}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
