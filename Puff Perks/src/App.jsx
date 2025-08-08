
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { DashboardHeader } from '@/components/dashboard/DashboardHeader.jsx';
import { AnimatePresence } from 'framer-motion';
import AdminDashboard from '@/pages/AdminDashboard.jsx';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isSuperAdmin) {
    return <Navigate to="/store/dashboard" replace />;
  }

  return children;
};

const MainAppContent = () => {
  const location = useLocation();
  const { user, signOut, isSuperAdmin } = useAuth();
  const isDashboard = location.pathname.startsWith('/store') || (location.pathname.startsWith('/admin') && isSuperAdmin);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isDashboard && user && <DashboardHeader onLogout={signOut} />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/store/signup" element={<StoreSignup />} />
          <Route path="/faq" element={<FaqPage />} />
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
        </Routes>
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

const AdminAppContent = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
             <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </div>
    );
};

function App() {
  const host = window.location.host;
  const isAdminSubdomain = host.startsWith('admin.');

  return (
    <>
      <Helmet>
        <title>Puff Perks - Digital Loyalty Cards for Vape Stores</title>
        <meta name="description" content="Ditch the paper punch cards. Puff Perks is the simplest way to reward your regulars, keep them coming back, and grow your business!" />
      </Helmet>
      <Router>
        {isAdminSubdomain ? <AdminAppContent /> : <MainAppContent />}
      </Router>
    </>
  );
}

export default App;
