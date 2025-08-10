
    import React, { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { supabase } from '@/lib/customSupabaseClient.js';

    const AuthRedirect = () => {
      const { user, loading } = useAuth();
      const navigate = useNavigate();
      const [redirectPath, setRedirectPath] = useState(null);

      useEffect(() => {
        const determineRedirect = async () => {
          if (user) {
            try {
              const { data: store, error: storeError } = await supabase
                .from('stores')
                .select('id')
                .eq('owner_id', user.id)
                .maybeSingle();

              if (storeError && storeError.code !== 'PGRST116') {
                throw storeError;
              }

              if (store) {
                setRedirectPath('/store/dashboard');
              } else {
                const { data: card, error: cardError } = await supabase
                  .from('loyalty_cards')
                  .select('id')
                  .eq('user_id', user.id)
                  .limit(1)
                  .single();
                
                if (cardError && cardError.code !== 'PGRST116') {
                   throw cardError;
                }

                if (card) {
                  setRedirectPath(`/customer/card/${card.id}`);
                } else {
                  setRedirectPath('/'); 
                }
              }
            } catch (error) {
              console.error('Error determining redirect path:', error);
              setRedirectPath('/');
            }
          }
        };

        if (!loading) {
          determineRedirect();
        }
      }, [user, loading]);

      useEffect(() => {
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        }
      }, [redirectPath, navigate]);

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-lg flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting...
          </div>
        </div>
      );
    };

    export default AuthRedirect;
  