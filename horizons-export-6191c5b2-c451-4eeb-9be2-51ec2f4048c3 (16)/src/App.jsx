
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage.jsx';
import StoreDashboard from '@/pages/StoreDashboard.jsx';
import CustomerCard from '@/pages/CustomerCard.jsx';
import Login from '@/pages/Login.jsx';
import StoreSignup from '@/pages/StoreSignup.jsx';
import CustomerSignup from '@/pages/CustomerSignup.jsx';
import { Helmet } from 'react-helmet';
import AuthHandler from '@/components/AuthHandler.jsx';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import CustomerDirectory from '@/pages/CustomerDirectory.jsx';
import { SettingsPage } from '@/pages/SettingsPage.jsx';
import FaqPage from '@/pages/FaqPage.jsx';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage.jsx';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader.jsx';
import SignOut from '@/pages/SignOut.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </div>
            </div>
        );
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
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/store/signup" element={<StoreSignup />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/customer/signup/:locationId" element={<CustomerSignup />} />
                <Route path="/customer/signup/:locationId/:referralCode" element={<CustomerSignup />} />
                <Route path="/auth/signout" element={<SignOut />} />
                
                <Route path="/store/dashboard" element={<ProtectedRoute><StoreDashboard /></ProtectedRoute>} />
                <Route path="/store/customers" element={<ProtectedRoute><CustomerDirectory /></ProtectedRoute>} />
                <Route path="/store/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/store/settings/:defaultTab" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/customer/card/:loyaltyCardId" element={<ProtectedRoute><CustomerCard /></ProtectedRoute>} />
            </Routes>
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
                <AuthHandler>
                    <AppContent />
                </AuthHandler>
            </Router>
        </>
    );
}

export default App;
