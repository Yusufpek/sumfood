import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage/main';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantMenu from './pages/RestaurantMenu';
import './App.css';
import './styles/global.css';
import './styles/auth.css';

function App() {
  return (
    <Router>
      <div className="App">
        {}
        <Routes>
          <Route path="/main" element={<MainPage />} />
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route 
            path="/register" 
            element={<Register />} 
          />
          <Route 
            path="/" 
            element={<Login />} 
          />
          <Route 
            path="/restaurant-dashboard" 
            element={<RestaurantDashboard />} 
          />
          <Route 
            path="/restaurant-dashboard/menu" 
            element={<RestaurantMenu />} 
          />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
