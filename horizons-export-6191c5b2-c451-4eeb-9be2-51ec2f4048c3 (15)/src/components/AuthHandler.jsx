
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

const AuthHandler = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthResolved, setIsAuthResolved] = useState(false);

    useEffect(() => {
        if (loading) {
            return; // Wait until Supabase has determined the auth state
        }

        const resolveAuth = async () => {
            if (!user) {
                // If there's no user, we don't need to do anything, let them access public pages
                setIsAuthResolved(true);
                return;
            }

            // User is logged in, now check their role
            // Check for a store owner first
            const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
            if (store) {
                // This is a store owner. If they are not on a store path, redirect them.
                if (!location.pathname.startsWith('/store')) {
                    navigate('/store/dashboard', { replace: true });
                } else {
                    setIsAuthResolved(true);
                }
                return;
            }

            // If not a store owner, check for a loyalty card
            const { data: loyaltyCard } = await supabase.from('loyalty_cards').select('id').eq('customer_id', user.id).maybeSingle();
            if (loyaltyCard) {
                // This is a customer. If they are not on their card page, redirect them.
                if (!location.pathname.startsWith('/customer/card')) {
                    navigate(`/customer/card/${loyaltyCard.id}`, { replace: true });
                } else {
                    setIsAuthResolved(true);
                }
                return;
            }

            // If user exists but has no role (e.g., interrupted signup), check if they were trying to sign up as customer
            if (location.pathname.includes('/customer/signup')) {
                 const { data: customerProfile, error: customerError } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                
                 if(customerProfile){
                     const { data: loyaltyCard, error: cardError } = await supabase
                         .from('loyalty_cards')
                         .select('id')
                         .eq('customer_id', customerProfile.id)
                         .limit(1)
                         .single();

                    if(loyaltyCard){
                        navigate(`/customer/card/${loyaltyCard.id}`, { replace: true });
                        return;
                    }
                 }
            }


            // If user exists but has no role (e.g., interrupted signup), mark as resolved
            setIsAuthResolved(true);
        };

        resolveAuth();
    }, [user, loading, navigate, location.pathname]);

    if (!isAuthResolved) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying session...</span>
                </div>
            </div>
        );
    }

    return children;
};

export default AuthHandler;
