// components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../ContextAdmin.jsx';
import Loading from './Loading/Loading.jsx';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AdminContext);

  if (loading) {
    return <Loading />; // Display loading page while checking auth state
  }

  if (!admin) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/admin/login/" />;
  }

  return children; // If authenticated, render the child component (AdminDashboard)
};

export default ProtectedRoute;
