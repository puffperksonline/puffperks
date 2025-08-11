
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage.jsx';
import StoreDashboard from '@/pages/StoreDashboard.jsx';
import CustomerCard from '@/pages/CustomerCard.jsx';
import Login from '@/pages/Login.jsx';
import StoreSignup from '@/pages/StoreSignup.jsx';
import CustomerSignup from '@/pages/CustomerSignup.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import { SettingsPage } from '@/pages/SettingsPage.jsx';
import CustomerDirectory from '@/pages/CustomerDirectory.jsx';
import FaqPage from '@/pages/FaqPage.jsx';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage.jsx';
import PricingPage from '@/pages/PricingPage.jsx';

export const AppRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/store/signup" element={<StoreSignup />} />
            <Route path="/customer/signup/:locationId" element={<CustomerSignup />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Store Owner Routes */}
            <Route path="/store/dashboard" element={<ProtectedRoute ownerOnly><StoreDashboard /></ProtectedRoute>} />
            <Route path="/store/customers" element={<ProtectedRoute ownerOnly><CustomerDirectory /></ProtectedRoute>} />
            <Route path="/store/settings" element={<ProtectedRoute ownerOnly><SettingsPage /></ProtectedRoute>} />

            {/* Customer Routes */}
            <Route path="/customer/card/:loyaltyCardId" element={<ProtectedRoute><CustomerCard /></ProtectedRoute>} />
        </Routes>
    );
};
