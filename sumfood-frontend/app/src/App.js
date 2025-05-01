import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainPage from './pages/MainPage/main';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantMenu from './pages/RestaurantMenu';
import ProtectedRoute from './components/ProtectedRoute';
import OrdersPage from './pages/OrdersPage/OrderPage'; // Add this import
import './App.css';
import './styles/global.css';
import './styles/auth.css';
import Profile from "./pages/Profile/Profile";
import CreateOrderPage from './pages/CreateOrderPage/CreateOrderPage';

function App() {
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('API loaded')} onError={(error) => console.error('Google Maps API error:', error)}>
      <Router>
        <div className="App">
          { }
          <Routes>
            { }
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
            <Route
              path="/restaurant-dashboard/menu"
              element={
                <ProtectedRoute>
                  <RestaurantMenu />
                </ProtectedRoute>
              }
            />
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
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create_order"
              element={
                <ProtectedRoute>
                  <CreateOrderPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </Router>
    </APIProvider>
  );
}

export default App;
