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
        const itemsResponse = await axios.get('http://localhost:8080/api/restaurant/items', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': `RESTAURANT`
          }
        });
        console.log(itemsResponse);
        setFoodItems(itemsResponse.data);

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
          { id: 'VEGATERIAN', name: 'Vegetarian' },
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
        // Add new item - updated to use the correct endpoint from the controller
        await axios.post('http://localhost:8080/api/food/item', payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'RESTAURANT'
          }
        });
      }

      // Refresh food items - using the public endpoint from the controller
      const response = await axios.get('http://localhost:8080/api/food/public/items', {
        headers: { 'Authorization': `Bearer ${token}`,
        'Role': 'RESTAURANT' }
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
      await axios.delete(`http://localhost:8080/api/food/item/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}`,
        'Role': 'RESTAURANT' }
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
