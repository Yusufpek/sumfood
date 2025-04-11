import React from 'react';
import './FeaturedDeals.css';

const FeaturedDeals = () => {
  const deals = [
    { id: 1, title: '50% OFF', description: 'On your first order', buttonText: 'Order Now' },
    { id: 2, title: 'Free Delivery', description: 'On orders over $25', buttonText: 'Learn More' },
    { id: 3, title: 'Buy 1 Get 1', description: 'On selected items', buttonText: 'Shop Now' },
  ];

  return (
    <div className="featured-section">
      <h2>Featured Deals</h2>
      <div className="featured-deals">
        {deals.map((deal) => (
          <div key={deal.id} className="deal-card">
            <div className="deal-content">
              <h3>{deal.title}</h3>
              <p>{deal.description}</p>
              <button>{deal.buttonText}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedDeals;
