
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage.jsx';
import StoreDashboard from '@/pages/StoreDashboard.jsx';
import CustomerCard from '@/pages/CustomerCard.jsx';
import Login from '@/pages/Login.jsx';
import StoreSignup from '@/pages/StoreSignup.jsx';
import CustomerSignup from '@/pages/CustomerSignup.jsx';
import AuthRedirect from '@/components/AuthRedirect.jsx';
import { Helmet } from 'react-helmet';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <>
      <Helmet>
        <title>Puff Perks - Digital Loyalty Cards for Vape Stores</title>
        <meta name="description" content="Ditch the paper punch cards. Puff Perks is the simplest way to reward your regulars, keep them coming back, and grow your business!" />
      </Helmet>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/store/signup" element={<StoreSignup />} />
              <Route path="/customer/signup/:locationId" element={<CustomerSignup />} />
              <Route path="/customer/signup/:locationId/:referralCode" element={<CustomerSignup />} />

              {/* Single entry point for authenticated users */}
              <Route path="/auth/redirect" element={<ProtectedRoute><AuthRedirect /></ProtectedRoute>} />

              {/* Protected Routes */}
              <Route path="/store/dashboard" element={<ProtectedRoute><StoreDashboard /></ProtectedRoute>} />
              <Route path="/customer/card/:loyaltyCardId" element={<ProtectedRoute><CustomerCard /></ProtectedRoute>} />
            </Routes>
          </AnimatePresence>
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;
