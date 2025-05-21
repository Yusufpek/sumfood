import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantNavbar from '../components/layout/RestaurantNavbar';
import SpinwheelComponent from '../components/spinwheel/SpinwheelComponent';
import '../styles/spinwheel.css';

// API Constants
const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  RESTAURANT_MENU: `${API_BASE_URL}/food/items/restaurant`,
  SPINWHEELS: `${API_BASE_URL}/restaurant/spinwheel`,
};

function RestaurantSpinwheelPage() {
  const navigate = useNavigate();
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [spinwheels, setSpinwheels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New spinwheel form state
  const [newSpinwheel, setNewSpinwheel] = useState({
    name: '',
    description: '',
    price: 5.00,
    active: true,
    items: []
  });

  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [previewItems, setPreviewItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchRestaurantData = async () => {
      try {
        setLoading(true);

        // Fetch restaurant profile
        const profileResponse = await axios.get(`${API_BASE_URL}/restaurant/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        setRestaurantInfo(profileResponse.data);

        // Fetch menu items
        const menuResponse = await axios.get(ENDPOINTS.RESTAURANT_MENU, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        setMenuItems(menuResponse.data || []);

        // Fetch existing spinwheels
        try {
          const spinwheelsResponse = await axios.get(ENDPOINTS.SPINWHEELS, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Role': 'RESTAURANT'
            }
          });
          setSpinwheels(spinwheelsResponse.data || []);
        } catch (err) {
          console.log("Spinwheel endpoint might not exist yet", err);
          setSpinwheels([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError('Failed to load restaurant information');
        setLoading(false);

        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('userType');
          navigate('/login');
        }
      }
    };

    fetchRestaurantData();
  }, [navigate]);

  // Update preview items when selected items change
  useEffect(() => {
    if (selectedItems.length > 0) {
      setPreviewItems(selectedItems.map(item => ({
        ...item,
        id: item.foodItemId,
        probability: item.probability || 1 // Default probability
      })));
    } else {
      setPreviewItems([]);
    }
  }, [selectedItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      // Ensure price is a positive number with max 2 decimal places
      const floatValue = parseFloat(parseFloat(value).toFixed(2));
      setNewSpinwheel({
        ...newSpinwheel,
        [name]: isNaN(floatValue) ? 0 : Math.max(0, floatValue)
      });
    } else {
      setNewSpinwheel({
        ...newSpinwheel,
        [name]: value
      });
    }
  };

  const toggleItemSelection = (item) => {
    // Check if item is already selected
    const existingIndex = selectedItems.findIndex(i => i.foodItemId === item.foodItemId);

    if (existingIndex >= 0) {
      // Remove item
      setSelectedItems(selectedItems.filter(i => i.foodItemId !== item.foodItemId));
    } else {
      // Add item with default probability
      setSelectedItems([...selectedItems, { ...item, probability: 1 }]);
    }
  };

  const updateItemProbability = (foodItemId, probability) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.foodItemId === foodItemId) {
        return { ...item, probability: parseFloat(probability) || 1 };
      }
      return item;
    }));
  };

  const calculateExpectedPrice = () => {
    if (selectedItems.length === 0) return 0;

    const totalProbability = selectedItems.reduce((sum, item) => sum + (item.probability || 1), 0);
    const weightedPriceSum = selectedItems.reduce((sum, item) => {
      return sum + (item.price * (item.probability || 1));
    }, 0);

    return weightedPriceSum / totalProbability;
  };

  const handleCreateSpinwheel = async () => {
    if (selectedItems.length < 2) {
      setError('A spinwheel must have at least 2 items');
      return;
    }

    if (!newSpinwheel.name) {
      setError('Spinwheel name is required');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const spinwheelData = {
        ...newSpinwheel,
        items: selectedItems.map(item => ({
          foodItemId: item.foodItemId,
          probability: item.probability || 1
        })),
        restaurantId: restaurantInfo.id
      };

      const response = await axios.post(ENDPOINTS.SPINWHEELS, spinwheelData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'RESTAURANT'
        }
      });

      // Add the new spinwheel to the list
      setSpinwheels([...spinwheels, response.data]);

      // Reset form
      setNewSpinwheel({
        name: '',
        description: '',
        price: 5.00,
        active: true,
        items: []
      });
      setSelectedItems([]);
      setIsCreating(false);
      setError('');
    } catch (err) {
      console.error('Error creating spinwheel:', err);
      setError('Failed to create spinwheel. Please try again.');
    }
  };

  const toggleSpinwheelActive = async (spinwheelId, currentStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.patch(`${ENDPOINTS.SPINWHEELS}/${spinwheelId}`,
        { active: !currentStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        }
      );

      // Update the local state
      setSpinwheels(spinwheels.map(wheel =>
        wheel.id === spinwheelId ? { ...wheel, active: !currentStatus } : wheel
      ));
    } catch (err) {
      console.error('Error updating spinwheel status:', err);
      setError('Failed to update spinwheel status');
    }
  };

  const deleteSpinwheel = async (spinwheelId) => {
    if (!window.confirm('Are you sure you want to delete this spinwheel?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`${ENDPOINTS.SPINWHEELS}/${spinwheelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'RESTAURANT'
        }
      });

      // Remove the deleted spinwheel from the list
      setSpinwheels(spinwheels.filter(wheel => wheel.id !== spinwheelId));
    } catch (err) {
      console.error('Error deleting spinwheel:', err);
      setError('Failed to delete spinwheel');
    }
  };

  if (loading) {
    return (
      <>
        <RestaurantNavbar restaurantName="Loading..." currentPage="spinwheel" />
        <div className="loading">Loading spinwheel management...</div>
      </>
    );
  }

  return (
    <>
      <RestaurantNavbar restaurantName={restaurantInfo.displayName || 'Restaurant'} currentPage="spinwheel" />
      <div className="spinwheel-management-page">
        <h1>Spinwheel Management</h1>

        {error && <div className="error-message">{error}</div>}

        {/* Simplified content for testing */}
        <div className="spinwheel-actions">
          <button className="create-btn" onClick={() => setIsCreating(true)}>
            Create New Spinwheel
          </button>
        </div>

        {isCreating && (
          <div className="create-spinwheel-form">
            <h2>Create New Spinwheel</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newSpinwheel.name}
                onChange={handleInputChange}
                placeholder="Spinwheel name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={newSpinwheel.description}
                onChange={handleInputChange}
                placeholder="Describe your spinwheel"
              />
            </div>

            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                name="price"
                value={newSpinwheel.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="menu-items-selection">
              <h3>Select Menu Items</h3>
              <p>Choose at least 2 items for your spinwheel</p>

              <div className="selected-items-preview">
                <h4>Selected Items ({selectedItems.length})</h4>
                {selectedItems.length > 0 ? (
                  <div className="selected-items-list">
                    {selectedItems.map(item => (
                      <div key={item.foodItemId} className="selected-item">  {}
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                        <label>
                          Weight:
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={item.probability}
                            onChange={(e) => updateItemProbability(item.foodItemId, e.target.value)}
                          />
                        </label>
                        <button onClick={() => toggleItemSelection(item)}>Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No items selected</p>
                )}

                {selectedItems.length > 0 && (
                  <div className="expected-price">
                    <p>Expected Value: ${calculateExpectedPrice().toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="available-items">
                <h4>Available Menu Items</h4>
                <div className="menu-items-grid">
                  {menuItems.map(item => (
                    <div
                      key={item.foodItemId}  // CHANGED: Use foodItemId
                      className={`menu-item ${selectedItems.find(i => i.foodItemId === item.foodItemId) ? 'selected' : ''}`}
                      onClick={() => toggleItemSelection(item)}
                    >
                      <h5>{item.name}</h5>
                      <p>${item.price.toFixed(2)}</p>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="save-btn"
                onClick={handleCreateSpinwheel}
                disabled={selectedItems.length < 2 || !newSpinwheel.name}
              >
                Create Spinwheel
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setIsCreating(false);
                  setSelectedItems([]);
                  setNewSpinwheel({
                    name: '',
                    description: '',
                    price: 5.00,
                    active: true,
                    items: []
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="spinwheels-list">
          <h2>Your Spinwheels</h2>

          {spinwheels.length === 0 ? (
            <p>No spinwheels created yet. Create your first spinwheel to attract customers!</p>
          ) : (
            <div className="spinwheel-cards">
              {spinwheels.map(wheel => (
                <div key={wheel.id} className="spinwheel-card">
                  <h3>{wheel.name}</h3>
                  <p>{wheel.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RestaurantSpinwheelPage;