import React from 'react';
import './FeaturedDeals.css';

const FeaturedDeals = () => {
  return (
    <div className="featured-section">
      <h2>Featured Deals</h2>
      <div className="featured-deals">
        <div className="deal-card">
          <div className="deal-content">
            <h3>50% OFF</h3>
            <p>On your first order</p>
            <button>Order Now</button>
          </div>
        </div>
        <div className="deal-card">
          <div className="deal-content">
            <h3>Free Delivery</h3>
            <p>On orders over $25</p>
            <button>Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedDeals;
