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
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRestaurantInfo(restaurantResponse.data);
        
        // Fetch food items
        const itemsResponse = await axios.get('http://localhost:8080/api/restaurant/menu-items', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFoodItems(itemsResponse.data);
        
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:8080/api/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Ensure categories is always an array
        const categoriesData = categoriesResponse.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
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
        categoryId: item.category.id,
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
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };
      
      if (editingItem) {
        // Update existing item
        await axios.put(`http://localhost:8080/api/restaurant/menu-items/${editingItem.id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Add new item
        await axios.post('http://localhost:8080/api/restaurant/menu-items', payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      // Refresh food items
      const response = await axios.get('http://localhost:8080/api/restaurant/menu-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFoodItems(response.data);
      
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving food item:', err);
      setError('Failed to save food item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8080/api/restaurant/menu-items/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Remove item from state
      setFoodItems(foodItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting food item:', err);
      setError('Failed to delete food item');
    }
  };

  if (loading) return (
    <>
      <RestaurantNavbar restaurantName="Loading..." />
      <div className="loading">Loading menu data...</div>
    </>
  );
  
  if (error) return (
    <>
      <RestaurantNavbar restaurantName="Error" />
      <div className="error">{error}</div>
    </>
  );

  return (
    <>
      <RestaurantNavbar restaurantName={restaurantInfo.name || 'Your Restaurant'} />
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
              <h2>{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</h2>
              <form onSubmit={handleSubmit} className="menu-form">
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
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="isDonated"
                    name="isDonated"
                    checked={formData.isDonated}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isDonated">Donation Item</label>
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

        <div className="menu-items-container">
          {foodItems.length === 0 ? (
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
                  <p className="item-category">{item.category ? item.category.name : 'Uncategorized'}</p>
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
