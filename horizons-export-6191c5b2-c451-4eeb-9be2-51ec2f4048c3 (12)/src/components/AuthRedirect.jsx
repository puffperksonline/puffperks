import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';

const AuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking user role...');

  useEffect(() => {
    const redirectUser = async () => {
      if (!user) {
        // Wait for user object to be available
        return;
      }

      setStatus('Verifying account type...');
      
      // Check if user is a store owner
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (storeError) {
        console.error("Error checking for store:", storeError);
        setStatus('Error verifying account. Redirecting to home.');
        navigate('/');
        return;
      }

      if (store) {
        // User is a store owner, redirect to dashboard
        setStatus('Redirecting to your dashboard...');
        navigate('/store/dashboard');
      } else {
        // User is a customer, find their loyalty card
        setStatus('Finding your loyalty card...');
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('id, loyalty_cards(id)')
          .eq('user_id', user.id)
          .single();
        
        if (customerError) {
          console.error("Error fetching customer data:", customerError);
          setStatus('Could not find your customer profile. Redirecting to home.');
          navigate('/');
          return;
        }

        if (customer && customer.loyalty_cards.length > 0) {
           // Redirect to the first loyalty card
           const loyaltyCardId = customer.loyalty_cards[0].id;
           setStatus('Redirecting to your loyalty card...');
           navigate(`/customer/card/${loyaltyCardId}`);
        } else {
           // This case might happen if signup process was interrupted.
           // For now, redirect to a safe page.
           setStatus('Could not find your loyalty card. Redirecting to home.');
           navigate('/');
        }
      }
    };

    redirectUser();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-white text-lg flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {status}
      </div>
    </div>
  );
};

export default AuthRedirect;