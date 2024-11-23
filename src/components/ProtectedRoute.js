// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = auth.currentUser; // Checks if a user is authenticated

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
