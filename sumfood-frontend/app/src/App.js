import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage/main';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import './styles/global.css';
import './styles/auth.css';
import Profile from "./pages/Profile/Profile";

function App() {
  return (
    <Router>
      <div className="App">
        {}
        <Routes>
          {}
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-dashboard"
            element={
              <ProtectedRoute>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />
          {}
          {}
          {}
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
            path="/restaurant-dashboard/menu" 
            element={<RestaurantMenu />} 
          />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
