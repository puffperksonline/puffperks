import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

const AuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your account...');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkUserRoleAndRedirect = async () => {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (store) {
        setStatus('Welcome back! Redirecting to your dashboard...');
        navigate('/store/dashboard', { replace: true });
        return;
      }

      setStatus('Finding your loyalty card...');
      
      const { data: customerProfile } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if(customerProfile){
        const { data: loyaltyCard } = await supabase
            .from('loyalty_cards')
            .select('id')
            .eq('customer_id', customerProfile.id)
            .maybeSingle();
        
        if (loyaltyCard) {
            setStatus('Redirecting to your loyalty card...');
            navigate(`/customer/card/${loyaltyCard.id}`, { replace: true });
            return;
        }
      }
      
      setStatus('Could not find an active store or loyalty card for your account. Redirecting to login.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    };

    checkUserRoleAndRedirect();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="flex items-center space-x-3">
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{status}</span>
      </div>
    </div>
  );
};

export default AuthRedirect;