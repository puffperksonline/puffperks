
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

const AuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkUserRoleAndRedirect = async () => {
      // Check if user is a store owner
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (store) {
        navigate('/store/dashboard');
        return;
      }

      // Check if user is a customer with a loyalty card
      // We query the customer table first to get the customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customer) {
        const { data: loyaltyCard } = await supabase
          .from('loyalty_cards')
          .select('id')
          .eq('customer_id', customer.id)
          .limit(1)
          .single();
        
        if (loyaltyCard) {
          navigate(`/customer/card/${loyaltyCard.id}`);
          return;
        }
      }
      
      // If neither record is found yet, it might be due to replication delay.
      // We'll retry after a short moment.
      const retry = setTimeout(() => {
        checkUserRoleAndRedirect();
      }, 500);

      return () => clearTimeout(retry);
    };

    checkUserRoleAndRedirect();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-lg flex items-center mb-4">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Finalizing your account...
      </div>
       <p className="text-sm text-gray-400">Please wait, we're getting things ready for you.</p>
    </div>
  );
};

export default AuthRedirect;
