import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage.jsx';
import StoreDashboard from '@/pages/StoreDashboard.jsx';
import CustomerCard from '@/pages/CustomerCard.jsx';
import Login from '@/pages/Login.jsx';
import StoreSignup from '@/pages/StoreSignup.jsx';
import CustomerSignup from '@/pages/CustomerSignup.jsx';
import AuthRedirect from '@/components/AuthRedirect.jsx';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import CustomerDirectory from '@/pages/CustomerDirectory.jsx';
import { SettingsPage } from '@/pages/SettingsPage.jsx';
import FaqPage from '@/pages/FaqPage.jsx';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage.jsx';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader.jsx';
import { AnimatePresence } from 'framer-motion';
import AdminDashboard from '@/pages/AdminDashboard.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isDashboard = location.pathname.startsWith('/store');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isDashboard && user && <DashboardHeader onLogout={signOut} />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/store/signup" element={<StoreSignup />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/customer/signup/:locationId" element={<CustomerSignup />} />
          <Route path="/customer/signup/:locationId/:referralCode" element={<CustomerSignup />} />
          <Route path="/auth/redirect" element={<AuthRedirect />} />
          
          <Route 
            path="/store/dashboard" 
            element={
              <ProtectedRoute>
                <StoreDashboard />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/store/customers" 
            element={
              <ProtectedRoute>
                <CustomerDirectory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/store/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/card/:loyaltyCardId" 
            element={
              <ProtectedRoute>
                <CustomerCard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </div>
  );
}


function App() {
  return (
    <>
      <Helmet>
        <title>Puff Perks - Digital Loyalty Cards for Vape Stores</title>
        <meta name="description" content="Ditch the paper punch cards. Puff Perks is the simplest way to reward your regulars, keep them coming back, and grow your business!" />
      </Helmet>
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;