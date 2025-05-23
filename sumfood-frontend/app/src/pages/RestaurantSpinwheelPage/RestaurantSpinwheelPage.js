import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantNavbar from '../../components/restaurant/RestaurantNavbar';
import './RestaurantSpinwheelPage.css';

// API Constants
const API_BASE_URL = 'http://localhost:8080/api';
const ENDPOINTS = {
  WHEELS: `${API_BASE_URL}/wheels`,
  RESTAURANT_ITEMS: `${API_BASE_URL}/food/items`
};

const RestaurantSpinwheelPage = () => {
  const navigate = useNavigate();
  
  const [wheels, setWheels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentWheel, setCurrentWheel] = useState({
    id: null,
    name: '',
    description: '',
    price: 5.00,
    items: []
  });
  
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Fetch spinwheels and restaurant food items
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchWheelsAndItems = async () => {
      setLoading(true);
      try {
        // Fetch restaurant's spinwheels
        const wheelsResponse = await axios.get(ENDPOINTS.WHEELS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        
        setWheels(wheelsResponse.data || []);
        
        // Fetch restaurant's food items
        const itemsResponse = await axios.get(ENDPOINTS.RESTAURANT_ITEMS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        
        setFoodItems(itemsResponse.data || []);
      } catch (err) {
        console.error('Error fetching spinwheels:', err);
        setError('Could not load your spinwheels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWheelsAndItems();
  }, [navigate]);
  
  const handleCreateNew = () => {
    setCurrentWheel({
      id: null,
      name: '',
      description: '',
      price: 5.00,
      items: []
    });
    setSelectedItems([]);
    setIsEditing(true);
  };
  
  const handleEdit = (wheel) => {
    setCurrentWheel({
      ...wheel
    });
    setSelectedItems(wheel.items || []);
    setIsEditing(true);
  };
  
  const handleDelete = async (wheelId) => {
    if (!window.confirm('Are you sure you want to delete this spinwheel?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`${ENDPOINTS.WHEELS}/${wheelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'RESTAURANT'
        }
      });
      
      setWheels(wheels.filter(wheel => wheel.id !== wheelId));
    } catch (err) {
      console.error('Error deleting spinwheel:', err);
      alert('Could not delete the spinwheel. Please try again.');
    }
  };
  
  const handleSave = async () => {
    if (!currentWheel.name) {
      alert('Please provide a name for the spinwheel.');
      return;
    }
    
    if (selectedItems.length < 2) {
      alert('Please add at least 2 items to the spinwheel.');
      return;
    }
    
    const token = localStorage.getItem('token');
    const isNew = !currentWheel.id;
    
    try {
      const wheelData = {
        ...currentWheel,
        items: selectedItems.map(item => item.id)
      };
      
      let response;
      
      if (isNew) {
        response = await axios.post(ENDPOINTS.WHEELS, wheelData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        
        setWheels([...wheels, response.data]);
      } else {
        response = await axios.put(`${ENDPOINTS.WHEELS}/${currentWheel.id}`, wheelData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
        
        setWheels(wheels.map(wheel => 
          wheel.id === currentWheel.id ? response.data : wheel
        ));
      }
      
      setIsEditing(false);
      setCurrentWheel({
        id: null,
        name: '',
        description: '',
        price: 5.00,
        items: []
      });
      setSelectedItems([]);
      
    } catch (err) {
      console.error('Error saving spinwheel:', err);
      alert('Could not save the spinwheel. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setCurrentWheel({
      id: null,
      name: '',
      description: '',
      price: 5.00,
      items: []
    });
    setSelectedItems([]);
  };
  
  const handleToggleItem = (item) => {
    // Check if the item is already selected
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      // Remove item from selection
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      // Add item to selection
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentWheel({
      ...currentWheel,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };
  
  if (loading) {
    return (
      <div>
        <RestaurantNavbar />
        <div className="restaurant-spinwheel-page loading">
          <div className="spinner"></div>
          <p>Loading spinwheels...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <RestaurantNavbar />
      <div className="restaurant-spinwheel-page">
        <h1>Manage Spinwheels</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {isEditing ? (
          <div className="spinwheel-editor">
            <h2>{currentWheel.id ? 'Edit Spinwheel' : 'Create New Spinwheel'}</h2>
            
            <div className="form-group">
              <label htmlFor="name">Spinwheel Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={currentWheel.name}
                onChange={handleInputChange}
                placeholder="Enter a name for your spinwheel"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={currentWheel.description}
                onChange={handleInputChange}
                placeholder="Describe your spinwheel (optional)"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price per Spin ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={currentWheel.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            
            <div className="items-selector">
              <h3>Select Items for the Wheel</h3>
              <p className="help-text">Items selected will be potential prizes on the wheel</p>
              
              {foodItems.length === 0 ? (
                <p>You need to create some food items first.</p>
              ) : (
                <div className="items-grid">
                  {foodItems.map(item => (
                    <div 
                      key={item.id}
                      className={`item-card ${selectedItems.some(selected => selected.id === item.id) ? 'selected' : ''}`}
                      onClick={() => handleToggleItem(item)}
                    >
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="selected-count">
                Selected: {selectedItems.length} item(s)
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
              >
                Save Spinwheel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="controls">
              <button 
                className="btn btn-primary"
                onClick={handleCreateNew}
              >
                Create New Spinwheel
              </button>
            </div>
            
            {wheels.length === 0 ? (
              <div className="empty-state">
                <h3>No Spinwheels Yet</h3>
                <p>Create your first spinwheel to attract more customers!</p>
              </div>
            ) : (
              <div className="spinwheels-list">
                {wheels.map(wheel => (
                  <div key={wheel.id} className="spinwheel-card">
                    <h3>{wheel.name}</h3>
                    {wheel.description && <p>{wheel.description}</p>}
                    <p className="price-info">Price per spin: ${wheel.price.toFixed(2)}</p>
                    
                    <div className="item-count">
                      {wheel.items?.length || 0} items in wheel
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEdit(wheel)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDelete(wheel.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantSpinwheelPage;
