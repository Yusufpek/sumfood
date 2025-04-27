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
  const [selectedFile, setSelectedFile] = useState(null); // State for the image file
  const fileInputRef = React.useRef(null); // Ref for file input
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
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
        
        
        // Fetch food items
        const foodResponse = await axios.get('http://localhost:8080/api/food/items', {
          headers: { 'Authorization': `Bearer ${token}`,
          'Role': `RESTAURANT` }
        });
        console.log('API Food Items Response:', foodResponse);
        setFoodItems(foodResponse.data || []);

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
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setSelectedFile(files[0]); // Store the file object
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: ''
    });
    setSelectedFile(null); // Clear the selected file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input visually
    }
    setEditingItem(null);
  };

  const openForm = (item = null) => {
    setSelectedFile(null); // Clear file on opening form
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input visually
    }
    if (item) {
      // Edit mode
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        category: item.categories[0] || '' // Use optional chaining and provide default value
      });
      console.log('Editing item:', item);
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

    // Create FormData object for both add and update
    const data = new FormData();
    const foodItemData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      category: formData.category
    };
    // Append food item data as a JSON blob
    data.append('foodItem', new Blob([JSON.stringify(foodItemData)], { type: 'application/json' }));

    // Append the file only if it's selected (for both add and update)
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    try {
      let response;
      if (editingItem) {
        // Update existing item (PUT request with FormData)
        console.log('Updating item with ID:', editingItem.id, 'using FormData');
        try {
          response = await axios.put(`http://localhost:8080/api/food/item/${editingItem.id}`, data, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Role': 'RESTAURANT'
              // Axios sets Content-Type to multipart/form-data automatically
            }
          });
          console.log('Update response:', response.data);
        } catch (updateErr) {
          console.error('Error in update request:', updateErr);
          const errorMsg = getErrorMessage(updateErr);
          throw new Error(errorMsg);
        }
      } else {
        // Add new item (POST request with FormData)
        if (!selectedFile) {
          setError('Please select an image file for the new item.');
          return; // Prevent submission without a file for new items
        }
        console.log('Submitting new item with FormData...');
        try {
          response = await axios.post('http://localhost:8080/api/food/item', data, {
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

      // Refresh food items after successful save/update
      const foodResponse = await axios.get('http://localhost:8080/api/food/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Role': 'RESTAURANT'
        }
      });

      console.log('API Food Items Response after save/update:', foodResponse);
      setFoodItems(foodResponse.data || []);

      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving food item:', err);
      setError(`Failed to save food item: ${err.message || 'Unknown error'}`);
    }
  };

  // Helper function to extract meaningful error messages from Axios errors
  const getErrorMessage = (error) => {
    if (error.response) {
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
      return 'No response from server. Please check your connection.';
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unknown error occurred';
    }
  };

  const handleDelete = (itemId) => {
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

  const getCategoryDisplayName = (item) => {
    if (item.categories && item.categories.length > 0) {
      return item.categories.map(cat => {
        return typeof cat === 'object' ? cat.name : 
          categories.find(c => c.id === cat)?.name || cat;
      }).join(', ');
    }
    
    if (item.category) {
      if (typeof item.category === 'object') {
        return item.category.name;
      }
      const categoryObj = categories.find(c => c.id === item.category);
      return categoryObj ? categoryObj.name : item.category;
    }
    
    return 'Uncategorized';
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
      <RestaurantNavbar restaurantName={restaurantInfo.displayName || 'Your Restaurant'} currentPage="menu" />
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
              {error && <p className="error form-error">{error}</p>}
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
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
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
                
                <div className="form-group full-width">
                  <label htmlFor="image">Image {editingItem && '(Optional: Leave blank to keep current image)'}</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleInputChange}
                    ref={fileInputRef}
                    required={!editingItem} // Only required when adding a new item
                  />
                  {selectedFile && <p className="file-info">Selected: {selectedFile.name}</p>}
                  {editingItem && !selectedFile && editingItem.imageName && (
                    <div className="current-image-preview">
                      <p>Current Image:</p>
                      <img
                        src={`http://localhost:8080/api/food/public/image/${editingItem.restaurantName}/${editingItem.imageName}`}
                        alt="Current item"
                        style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }}
                      />
                    </div>
                  )}
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
                  <img
                    src={`http://localhost:8080/api/food/public/image/${item.restaurantName}/${item.imageName}`}
                    alt={item.name}
                    className="menu-item-image"
                    onError={(e) => { e.target.onerror = null; e.target.src="/path/to/default/image.png" }}
                  />
                  <div className="menu-item-status">
                    <span className="stock-info">{item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <p className="item-category">{getCategoryDisplayName(item)}</p>
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
