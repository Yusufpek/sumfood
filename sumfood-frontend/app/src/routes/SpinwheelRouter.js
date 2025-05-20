import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SpinwheelPage from '../pages/SpinwheelPage';
import RestaurantSpinwheelPage from '../pages/RestaurantSpinwheelPage';
import ProtectedRoute from './ProtectedRoute';

/**
 * Router component specifically for spinwheel-related routes
 */
const SpinwheelRouter = () => {
  return (
    <Routes>
      {/* Customer-facing spinwheel routes */}
      <Route path="/restaurant/:restaurantId/spinwheel/:spinwheelId" element={<SpinwheelPage />} />
      
      {/* Restaurant management spinwheel routes */}
      <Route 
        path="/restaurant-dashboard/spinwheel" 
        element={
          <ProtectedRoute 
            requiredRole="RESTAURANT" 
            redirectPath="/login"
          >
            <RestaurantSpinwheelPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default SpinwheelRouter;
