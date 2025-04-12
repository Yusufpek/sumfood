import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantNavbar from '../components/layout/RestaurantNavbar';
import '../styles/restaurant-menu.css';

function RestaurantMenu() {
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    isDonated: false
  });

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant profile
        const restaurantResponse = await axios.get('http://localhost:8080/api/restaurant/profile', {
          headers: { 'Authorization': `Bearer ${token}`,
          'Role': `RESTAURANT` }
        });
        console.log('API Restaurant Response:', restaurantResponse);
        setRestaurantInfo(restaurantResponse.data);
        
        
        // Ensure we're setting an array to the state
        if (restaurantResponse.data.foodItems && Array.isArray(restaurantResponse.data.foodItems)) {
          if (Array.isArray(restaurantResponse.data.foodItems)) {
            setFoodItems(restaurantResponse.data.foodItems);
          } else if (restaurantResponse.data.content && Array.isArray(restaurantResponse.data.content)) {
            // If the data is nested in a content property (common pagination format)
            setFoodItems(restaurantResponse.data.content);
          } else {
            console.error('Unexpected data format:', restaurantResponse.data);
            setFoodItems([]); // Set empty array as fallback
            setError('Received invalid data format from server');
          }
        } else {
          setFoodItems([]);
        }

        // Hardcoded categories instead of fetching from API
        const hardcodedCategories = [
          { id: 'PIZZA', name: 'Pizza' },
          { id: 'DESERT', name: 'Desert' },
          { id: 'STREET_FOOD', name: 'Street Food' },
          { id: 'HAMBURGER', name: 'Hamburger' },
          { id: 'DONER', name: 'Doner' },
          { id: 'KEBAB', name: 'Kebab' },
          { id: 'CHICKEN', name: 'Chicken' },
          { id: 'PIDE_LAHMACUN', name: 'Pide & Lahmacun' },
          { id: 'HOMEMADE', name: 'Homemade' },
          { id: 'MEATBALL', name: 'Meatball' },
          { id: 'VEGETARIAN', name: 'Vegetarian' },
          { id: 'SALAD', name: 'Salad' },
          { id: 'GLOBAL', name: 'Global' },
          { id: 'MANTI', name: 'Manti' },
          { id: 'PASTA', name: 'Pasta' },
          { id: 'SEAFOOD', name: 'Seafood' },
          { id: 'GRILL', name: 'Grill' }
        ];
        setCategories(hardcodedCategories);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      isDonated: false
    });
    setEditingItem(null);
  };

  const openForm = (item = null) => {
    if (item) {
      // Edit mode
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        categoryId: item.category?.id || '', // Use optional chaining and provide default value
        isDonated: item.isDonated
      });
      setEditingItem(item);
    } else {
      // Add mode
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setError(''); // Clear any previous error

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      console.log('Submitting with payload:', payload);
      
      if (editingItem) {
        // Update existing item - fixed to match the controller parameter name
        console.log('Updating item with ID:', editingItem.id);
        try {
          // Fix: We need to use 'editingItem.id' as the idString parameter
          const response = await axios.put(`http://localhost:8080/api/food/item/${editingItem.id}`, payload, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Role': 'RESTAURANT'
            }
          });
          console.log('Update response:', response.data);
        } catch (updateErr) {
          console.error('Error in update request:', updateErr);
          if (updateErr.response) {
            console.error('Response data:', updateErr.response.data);
            console.error('Response status:', updateErr.response.status);
          }
          const errorMsg = getErrorMessage(updateErr);
          throw new Error(errorMsg);
        }
      } else {
        // Add new item
        try {
          const response = await axios.post('http://localhost:8080/api/food/item', payload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Role': 'RESTAURANT'
            }
          });
          console.log('Create response:', response.data);
        } catch (createErr) {
          console.error('Error in create request:', createErr);
          const errorMsg = getErrorMessage(createErr);
          throw new Error(errorMsg);
        }
      }

      // Refresh food items
      const restaurantResponse = await axios.get('http://localhost:8080/api/restaurant/profile', {
        headers: { 'Authorization': `Bearer ${token}`,
        'Role': `RESTAURANT` }
      });
      console.log('API Restaurant Response after update:', restaurantResponse);
      if (restaurantResponse.data.foodItems && Array.isArray(restaurantResponse.data.foodItems)) {
        setFoodItems(restaurantResponse.data.foodItems);
      }
      setError(''); // Clear any previous error

      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving food item:', err);
      setError(`Failed to save food item: ${err.message}`);
    }
  };

  // Helper function to extract meaningful error messages from Axios errors
  const getErrorMessage = (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const responseData = error.response.data;
      if (typeof responseData === 'string') {
        return responseData;
      } else if (responseData && typeof responseData.message === 'string') {
        return responseData.message;
      } else if (responseData && typeof responseData.error === 'string') {
        return responseData.error;
      } else {
        return `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      return 'No response from server. Please check your connection.';
    } else if (error.message) {
      // Something happened in setting up the request that triggered an Error
      return error.message;
    } else {
      return 'An unknown error occurred';
    }
  };

  const handleDelete = (itemId) => {
    // Find the item to delete by ID
    const itemToRemove = foodItems.find(item => item.id === itemId);
    setItemToDelete(itemToRemove);
    setIsDeleteConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8080/api/food/item/${itemToDelete.id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Role': 'RESTAURANT' 
        }
      });

      // Remove item from state
      setFoodItems(foodItems.filter(item => item.id !== itemToDelete.id));
      setIsDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting food item:', err);
      setError('Failed to delete food item');
      setIsDeleteConfirmOpen(false);
    }
  };
  
  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  if (loading) return (
    <>
      <RestaurantNavbar restaurantName="Loading..." currentPage="menu" />
      <div className="loading">Loading menu data...</div>
    </>
  );

  if (error) return (
    <>
      <RestaurantNavbar restaurantName="Error" currentPage="menu" />
      <div className="error">{error}</div>
    </>
  );

  return (
    <>
      <RestaurantNavbar restaurantName={restaurantInfo.businessName || 'Your Restaurant'} currentPage="menu" />
      <div className="restaurant-menu-container">
        <header className="menu-header">
          <h1>Menu Management</h1>
          <button
            className="add-item-button"
            onClick={() => openForm()}
          >
            Add New Item
          </button>
        </header>

        {isFormOpen && (
          <div className="menu-form-overlay">
            <div className="menu-form-container">
              <h2 className="form-title">{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</h2>
              <form onSubmit={handleSubmit} className="menu-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="categoryId">Category</label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {Array.isArray(categories) && categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price ($)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stock">Stock</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group checkbox-container">
                  <input
                    type="checkbox"
                    id="isDonated"
                    name="isDonated"
                    checked={formData.isDonated}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isDonated" className="checkbox-label">Donation Item</label>
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="save-button">
                    {editingItem ? 'Update' : 'Save'}
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirmation popup */}
        {isDeleteConfirmOpen && (
          <div className="menu-form-overlay">
            <div className="delete-confirm-container">
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete "{itemToDelete?.name}"?</p>
              <p>This action cannot be undone.</p>
              <div className="form-buttons">
                <button className="delete-button" onClick={confirmDelete}>
                  Delete
                </button>
                <button className="cancel-button" onClick={cancelDelete}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="menu-items-container">
          {!Array.isArray(foodItems) || foodItems.length === 0 ? (
            <div className="empty-menu-message">
              <p>No menu items found. Add your first menu item to get started!</p>
            </div>
          ) : (
            <div className="menu-items-grid">
              {foodItems.map(item => (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-status">
                    {item.isDonated && <span className="donation-badge">Donation</span>}
                    <span className="stock-info">{item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <p className="item-category">
                    {item.categories && item.categories.length > 0 
                      ? item.categories.map(cat => cat.name || cat).join(', ') 
                      : item.category && item.category.name 
                        ? item.category.name 
                        : 'Uncategorized'}
                  </p>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  <div className="item-actions">
                    <button
                      className="edit-button"
                      onClick={() => openForm(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RestaurantMenu;
