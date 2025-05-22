import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SpinWheel from '../../components/spinwheel/SpinWheel';
import './SpinwheelPage.css';

// API Constants
const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  PUBLIC_WHEELS: `${API_BASE_URL}/wheels/public`,
  SPIN_WHEEL: `${API_BASE_URL}/wheels/spin` // Add proper endpoint for spinning
};

const SpinwheelPage = () => {
  const { restaurantId, spinwheelId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [wheelData, setWheelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [userCredits, setUserCredits] = useState(0);

  // Fetch wheel data
  useEffect(() => {
    const fetchWheelData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${ENDPOINTS.PUBLIC_WHEELS}/${spinwheelId}`);
        console.log('Fetched wheel data:', response.data);
        setWheelData(response.data);
      } catch (err) {
        console.error('Error fetching wheel data:', err);
        setError('Could not load this spinwheel. It may have been removed or is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { returnUrl: `/restaurant/${restaurantId}/spinwheel/${spinwheelId}` } });
      return;
    }

    // Fetch user credits if needed
    const fetchUserCredits = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/customer/credits`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        });
        setUserCredits(response.data.credits || 0);
      } catch (err) {
        console.error('Error fetching user credits:', err);
        // Continue anyway, credits will show as 0
      }
    };

    fetchWheelData();
    fetchUserCredits();
  }, [spinwheelId, restaurantId, navigate]);

  const handleSpin = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSpinning(true);
    setResult(null);

    try {
      // First simulate the spinning animation
      // We'll get the actual result from the API, but start animation first
      setTimeout(async () => {
        try {
          const response = await axios.post(
            `${ENDPOINTS.SPIN_WHEEL}/${spinwheelId}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Role': 'CUSTOMER'
              }
            }
          );
          console.log('Spin result:', response.data);
          
          // Process the result
          setResult(response.data);
          
          // Update user credits
          setUserCredits(prev => prev - (wheelData?.price || 0));
          
        } catch (err) {
          console.error('Error spinning wheel:', err);
          setError(
            err.response?.data?.message || 
            'Failed to spin. Please check your balance or try again later.'
          );
        } finally {
          setSpinning(false);
        }
      }, 3000); // Give 3 seconds for the spinning animation
    } catch (err) {
      setSpinning(false);
      setError('An error occurred. Please try again.');
    }
  };

  // Update references to match backend response structure
  const handleAddToCart = async () => {
    if (!result || !result.wonItem) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/shopping_cart`,
        {
          foodItemId: result.wonItem.id,
          restaurantId: wheelData.restaurantId, // Use restaurantId from wheel response
          foodItemCount: 1,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'CUSTOMER'
          }
        }
      );

      // Notify cart updated
      window.dispatchEvent(new Event('cart-updated'));
      
      // Show success message
      alert('Item added to cart!');
      
      // Reset result after adding to cart
      setResult(null);

    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('Could not add item to cart. Please try again.');
    }
  };

  const handleBackToRestaurant = () => {
    navigate(`/restaurant/${wheelData.restaurantId}`);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="spinwheel-page loading">
          <div className="spinner"></div>
          <p>Loading spinwheel...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !wheelData) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="spinwheel-page error">
          <h2>Oops!</h2>
          <p>{error || 'Could not load this spinwheel'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Return to Homepage
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Prepare wheel segments - extract from wheel items
  const segments = wheelData.items?.map(item => ({
    id: item.id,
    text: item.name,
    color: getRandomColor(item.id),
    price: item.price,
    value: item.id
  })) || [];

  // If segments are empty, display error
  if (segments.length === 0) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="spinwheel-page error">
          <h2>Empty Spinwheel</h2>
          <p>This spinwheel has no items to win.</p>
          <button onClick={handleBackToRestaurant} className="btn btn-primary">
            Back to Restaurant
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="spinwheel-page">
        <div className="spinwheel-container">
          <div className="spinwheel-header">
            <h1>{wheelData.name}</h1>
            <p className="spinwheel-description">{wheelData.description || 'Spin the wheel to win delicious items!'}</p>
            <div className="restaurant-info">
              <p>
                <span role="img" aria-label="restaurant">🍽️</span>
                <strong>{wheelData.restaurantName || 'Restaurant'}</strong>
              </p>
            </div>
          </div>

          <div className="wheel-section">
            <div className="wheel-wrapper">
              <div className="wheel-indicator">
                <div className="indicator-arrow"></div>
              </div>
              
              <SpinWheel 
                segments={segments}
                spinning={spinning}
                onSpinStart={handleSpin}
                onSpinEnd={(segment) => console.log('Spin ended on:', segment)}
                prizeSegment={result?.wonItem?.id}
              />
            </div>

            <div className="spin-controls">
              <p className="spin-price">
                <strong>Cost per spin:</strong> ${wheelData.price?.toFixed(2) || '5.00'}
              </p>
              
              <p className="user-credits">
                <strong>Your balance:</strong> ${userCredits.toFixed(2)}
              </p>

              {!spinning && !result && (
                <button 
                  className={`btn btn-spin ${spinning ? 'disabled' : ''} ${userCredits < (wheelData.price || 5) ? 'insufficient-funds' : ''}`}
                  onClick={handleSpin}
                  disabled={spinning || userCredits < (wheelData.price || 5)}
                >
                  {spinning ? 'Spinning...' : 'SPIN NOW'}
                </button>
              )}

              {userCredits < (wheelData.price || 5) && (
                <p className="error-message">Insufficient balance. Please add more credits.</p>
              )}
            </div>
          </div>

          {result && (
            <div className="result-section">
              <h2 className="result-title">
                {result.wonItem ? '🎉 Congratulations! 🎉' : 'Better luck next time!'}
              </h2>
              
              {result.wonItem && (
                <div className="won-item">
                  <h3>{result.wonItem.name}</h3>
                  {result.wonItem.description && <p>{result.wonItem.description}</p>}
                  <p><strong>Value:</strong> ${result.wonItem.price?.toFixed(2) || '0.00'}</p>
                  
                  <button 
                    className="btn btn-add-to-cart"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                </div>
              )}
              
              <button 
                className="btn btn-secondary"
                onClick={() => setResult(null)}
              >
                Spin Again
              </button>
            </div>
          )}

          <div className="spinwheel-footer">
            <button 
              className="btn btn-secondary"
              onClick={handleBackToRestaurant}
            >
              Back to Restaurant
            </button>
          </div>
        </div>

        <div className="spinwheel-prizes">
          <h3>Potential Prizes</h3>
          <div className="prizes-list">
            {wheelData.items?.map(item => (
              <div key={item.id} className="prize-item">
                <h4>{item.name}</h4>
                {item.description && <p>{item.description}</p>}
                <p><strong>Value:</strong> ${item.price?.toFixed(2) || '0.00'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Helper function to generate random colors for wheel segments
function getRandomColor(seed) {
  // Use seed to generate consistent color for the same item
  const hash = String(seed).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#8AC926', '#FF595E',
    '#1982C4', '#6A4C93', '#F3722C', '#90BE6D'
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default SpinwheelPage;
