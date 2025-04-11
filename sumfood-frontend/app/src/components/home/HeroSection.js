import React from 'react';
import SearchBar from '../ui/SearchBar';
import './HeroSection.css';

const HeroSection = ({ onSearch }) => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Food delivery made easy</h1>
        <p>Order from your favorite restaurants</p>
        <SearchBar onSearch={onSearch} />
      </div>
    </div>
  );
};

export default HeroSection;
