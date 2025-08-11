import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';
import { toast } from '@/components/ui/use-toast';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [message, setMessage] = useState('Authenticating...');

  useEffect(() => {
    const handleRedirect = async () => {
      if (loading) return;

      if (!user) {
        setMessage('No user session found. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      setMessage('Checking your account type...');

      // Check if the user is a store owner from their metadata
      const isStoreOwner = user.user_metadata?.is_store_owner;

      if (isStoreOwner) {
        setMessage('Welcome, Store Owner! Redirecting to your dashboard...');
        setTimeout(() => navigate('/store/dashboard'), 1500);
        return;
      }

      // If not a store owner, they must be a customer. Find their loyalty card.
      setMessage('Finding your loyalty card...');
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('loyalty_cards(id)')
          .eq('user_id', user.id)
          .single();

        if (error || !data || !data.loyalty_cards || data.loyalty_cards.length === 0) {
          toast({
            title: "No Loyalty Card Found",
            description: "Please sign up using a valid QR code from a store.",
            variant: "destructive",
          });
          setMessage('No loyalty card found. Please sign up via a store QR code.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        const loyaltyCardId = data.loyalty_cards[0].id;
        setMessage('Success! Taking you to your card...');
        setTimeout(() => navigate(`/customer/card/${loyaltyCardId}`), 1500);

      } catch (e) {
        toast({
          title: "Error",
          description: "An unexpected error occurred while finding your card.",
          variant: "destructive",
        });
        setMessage('An error occurred. Redirecting home...');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleRedirect();
  }, [user, loading, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-lg flex items-center mb-4">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {message}
      </div>
      <p className="text-sm text-gray-400">Please wait, we're getting things ready for you.</p>
    </div>
  );
};

export default AuthRedirect;