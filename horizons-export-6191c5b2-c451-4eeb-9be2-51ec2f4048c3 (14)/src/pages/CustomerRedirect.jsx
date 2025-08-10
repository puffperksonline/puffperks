
    import React, { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { supabase } from '@/lib/customSupabaseClient.js';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle } from 'lucide-react';

    const CustomerRedirect = () => {
      const { user } = useAuth();
      const navigate = useNavigate();
      const [message, setMessage] = useState('Setting up your loyalty card...');
      const [error, setError] = useState(null);

      useEffect(() => {
        const findCardAndRedirect = async () => {
          if (!user) {
            // Wait for the user object to be available from the context
            return;
          }

          try {
            // First, find the customer record linked to the authenticated user
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (customerError || !customerData) {
              throw new Error('Could not find your customer profile. Please try logging in again.');
            }

            // Now, find the loyalty card associated with that customer
            const { data: loyaltyCard, error: cardError } = await supabase
              .from('loyalty_cards')
              .select('id')
              .eq('customer_id', customerData.id)
              .limit(1)
              .single();

            if (cardError || !loyaltyCard) {
              throw new Error('Could not find your loyalty card. Please try logging in.');
            }

            // Success! Redirect to the specific card URL
            navigate(`/customer/card/${loyaltyCard.id}`, { replace: true });

          } catch (e) {
            setError(e.message);
            setMessage('');
          }
        };

        findCardAndRedirect();
      }, [user, navigate]);

      if (error) {
        return (
          <div className="min-h-screen flex items-center justify-center px-4 text-center text-white">
            <div>
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h1>
              <p className="text-gray-400">{error}</p>
              <Button onClick={() => navigate('/login')} className="mt-6">Go to Login</Button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-white text-lg flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {message}
          </div>
        </div>
      );
    };

    export default CustomerRedirect;
  