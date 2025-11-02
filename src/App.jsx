import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'sonner';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import CreateOrganization from './pages/CreateOrganization';
import EditOrganization from './pages/EditOrganization';
import OrganizationDetails from './pages/OrganizationDetails';
import OrganizationUsers from './pages/OrganizationUsers';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SubdomainRoutes from './routes/SubdomainRoutes';
import { fetchUserProfile } from './store/slices/authSlice';
import {Landing} from './pages/Landing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Detect subdomain synchronously before first render to avoid initial routing mismatch
  const detectSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const baseLabel = import.meta.env.VITE_APP_BASE_SUBDOMAIN || 'app';
    const mainHost = (import.meta.env.VITE_MAIN_APP_HOST || '').toLowerCase();

    // Dev: allow ?subdomain=demo or localStorage override
    const urlParams = new URLSearchParams(window.location.search);
    const paramSub = urlParams.get('subdomain');
    const devSub = localStorage.getItem('dev_subdomain');
    if (paramSub || devSub) return true;

    if (hostname.includes('localhost')) {
      return parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== baseLabel;
    }

    // If main host is configured, drive behavior from it
    if (mainHost) {
      const hn = hostname.toLowerCase();
      if (hn === mainHost) return false; // exact main host -> main app
      if (hn.endsWith(`.${mainHost}`)) return true; // tenant.mainHost -> tenant app
      // Otherwise, fall back to heuristic
    }

    // Treat as tenant only if left-most label is not reserved or the base app label
    return parts.length > 2 && parts[0] !== 'www' && parts[0] !== baseLabel;
  };
  const [isSubdomain] = useState(() => detectSubdomain());

  useEffect(() => {
    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      const subdomain = detectSubdomain();
    }

    // Only fetch profile if we have a token but no user data and we're not already loading
    if (token && !isAuthenticated && !isLoading) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token, isAuthenticated, isLoading]);

  // If it's a subdomain, use the subdomain routes
  if (isSubdomain) {
    return (
      <>
        <SubdomainRoutes />
        {/* <Toaster position="top-right" /> */}
        <Toaster position="top-center"  richColors />
      </>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />
        
        {/* Public information pages */}
        {/* <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} /> */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="organizations/create" element={<CreateOrganization />} />
          <Route path="organizations/:id" element={<OrganizationDetails />} />
          <Route path="organizations/:id/edit" element={<EditOrganization />} />
          <Route path="organizations/:organizationId/users" element={<OrganizationUsers />} />
        </Route>
     
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <Navigate to="/" replace />
          } 
        />
      </Routes>
      
      <Toaster position="top-right" />
    </>
  );
}

export default App;