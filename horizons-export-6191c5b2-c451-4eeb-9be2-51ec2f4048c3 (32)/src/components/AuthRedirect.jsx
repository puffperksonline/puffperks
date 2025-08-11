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
      // First, check if the user is a STORE OWNER
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (store) {
        navigate('/store/dashboard');
        return;
      }

      // If not an owner, they must be a CUSTOMER. Find their loyalty card.
      const { data: loyaltyCard, error: cardError } = await supabase
        .from('loyalty_cards')
        .select('id')
        .eq('customer_id', user.id)
        .maybeSingle();

      if (loyaltyCard) {
        navigate(`/customer/card/${loyaltyCard.id}`);
        return;
      }

      setStatus('Could not find an active account. Please contact support.');
    };

    checkUserRoleAndRedirect();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p>{status}</p>
    </div>
  );
};

export default AuthRedirect;