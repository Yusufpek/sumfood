import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainPage from './pages/MainPage/main';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantMenu from './pages/RestaurantMenu';
import ProtectedRoute from './components/ProtectedRoute';
import CourierDashboard from './pages/CourierDashboard';
import CourierOrdersHistory from './pages/CourierOrdersHistory';
import OrdersPage from './pages/OrdersPage/OrderPage';
import './App.css';
import './styles/global.css';
import './styles/auth.css';
import Profile from "./pages/Profile/Profile";
import CreateOrderPage from './pages/CreateOrderPage/CreateOrderPage';
import RestaurantOrders from './pages/RestaurantOrders';
import RestaurantPublicPage from './pages/RestaurantPublicPage/RestaurantPublicPage';
import OrderReviewPage from './pages/OrderReviewPage/OrderReviewPage';
import CourierReviews from './pages/CourierReviews/CourierReviews';
import NotFoundPage from './pages/NotFoundPage';
import SpinwheelPage from './pages/SpinwheelPage';
import RestaurantSpinwheelPage from './pages/RestaurantSpinwheelPage';
import FavoriteRestaurantsPage from './pages/FavoriteRestaurantsPage/FavoriteRestaurantsPage';

function App() {
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('API loaded')} onError={(error) => console.error('Google Maps API error:', error)}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/main"
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              }
            />

            <Route path="/restaurant/:restaurantId" element={<RestaurantPublicPage />} />

            {/* Restaurant dashboard routes */}
            <Route
              path="/restaurant-dashboard"
              element={
                <ProtectedRoute>
                  <RestaurantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant-dashboard/orders"
              element={
                <ProtectedRoute>
                  <RestaurantOrders />
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
              path="/courier-dashboard"
              element={
                <ProtectedRoute>
                  <CourierDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courier-dashboard/orders-history"
              element={
                <ProtectedRoute>
                  <CourierOrdersHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courier-dashboard/reviews"
              element={
                <ProtectedRoute>
                  <CourierReviews />
                </ProtectedRoute>
              }
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
            <Route path="/order/:orderId/review" element={<OrderReviewPage />} />

            {/* Direct spinwheel routes - replaces SpinwheelRouter */}
            <Route path="/restaurant/:restaurantId/spinwheel/:spinwheelId" element={<SpinwheelPage />} />
            <Route path="/restaurant-dashboard/spinwheel" element={<RestaurantSpinwheelPage />} />

            <Route path="/restaurant/:restaurantId" element={<RestaurantPublicPage />} />
            <Route path="/favorites" element={<FavoriteRestaurantsPage />} />

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </APIProvider>
  );
}

export default App;
