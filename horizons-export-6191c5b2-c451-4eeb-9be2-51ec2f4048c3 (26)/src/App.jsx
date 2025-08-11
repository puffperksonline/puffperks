
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage.jsx';
import StoreDashboard from '@/pages/StoreDashboard.jsx';
import CustomerCard from '@/pages/CustomerCard.jsx';
import Login from '@/pages/Login.jsx';
import StoreSignup from '@/pages/StoreSignup.jsx';
import CustomerSignup from '@/pages/CustomerSignup.jsx';
import { Helmet } from 'react-helmet';
import AuthRedirect from '@/components/AuthRedirect.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import CustomerDirectory from '@/pages/CustomerDirectory.jsx';
import { SettingsPage } from '@/pages/SettingsPage.jsx';
import { LocationsPage } from '@/pages/LocationsPage.jsx';
import FaqPage from '@/pages/FaqPage.jsx';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage.jsx';
import SignOut from '@/pages/SignOut.jsx';
import { useAuth } from './contexts/SupabaseAuthContext.jsx';
import { DashboardHeader } from './components/dashboard/DashboardHeader.jsx';


const AppContent = () => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const isDashboard = location.pathname.startsWith('/store');

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {isDashboard && user && <DashboardHeader onLogout={signOut} />}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/store/signup" element={<StoreSignup />} />
                <Route path="/customer/signup/:locationId" element={<CustomerSignup />} />
                <Route path="/customer/signup/:locationId/:referralCode" element={<CustomerSignup />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/auth/signout" element={<SignOut />} />

                {/* This is the single entry point for authenticated users */}
                <Route path="/auth/redirect" element={<ProtectedRoute><AuthRedirect /></ProtectedRoute>} />

                {/* Protected Routes */}
                <Route path="/store/dashboard" element={<ProtectedRoute><StoreDashboard /></ProtectedRoute>} />
                <Route path="/store/customers" element={<ProtectedRoute><CustomerDirectory /></ProtectedRoute>} />
                <Route path="/store/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/store/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
                <Route path="/customer/card/:loyaltyCardId" element={<ProtectedRoute><CustomerCard /></ProtectedRoute>} />
            </Routes>
            <Toaster />
        </div>
    );
};


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
