import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

const AuthHandler = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If the auth state is still loading, do nothing yet.
    if (loading) {
      return;
    }

    // If a user IS logged in, then we perform the redirect logic.
    if (user) {
      const checkUserRoleAndRedirect = async () => {
        // Check for a store owner first
        const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();

        if (store) {
          // It's a store owner. If they are not on a store path, redirect them to their dashboard.
          if (!location.pathname.startsWith('/store')) {
            navigate('/store/dashboard', { replace: true });
          }
          return;
        }

        // If not an owner, check for a customer's loyalty card by looking at the customer profile first
        const { data: customerProfile } = await supabase.from('customers').select('id').eq('user_id', user.id).maybeSingle();
        
        if (customerProfile) {
            const { data: loyaltyCard } = await supabase.from('loyalty_cards').select('id').eq('customer_id', customerProfile.id).maybeSingle();

            if (loyaltyCard) {
              // It's a customer. If they are not on their card page, redirect them.
              if (location.pathname !== `/customer/card/${loyaltyCard.id}`) {
                navigate(`/customer/card/${loyaltyCard.id}`, { replace: true });
              }
              return;
            }
        }
      };

      checkUserRoleAndRedirect();
    }
    // If there is NO user (and not loading), we do nothing. This allows public pages like
    // the signup form to be displayed without interference.

  }, [user, loading, navigate, location.pathname]);


  // Show a loading screen ONLY while the initial user session is being determined.
  if (loading) {
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

  // Once loading is false, show the requested page. The useEffect will handle redirects if needed.
  return children;
};

export default AuthHandler;