import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) {
      return; // Wait until the auth state is loaded
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const redirectUser = async () => {
      const isStoreOwner = user.user_metadata?.is_store_owner;

      if (isStoreOwner) {
        navigate('/store/dashboard');
      } else {
        try {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (customerError || !customerData) {
            throw new Error("Customer profile not found. Please sign up via a store's QR code.");
          }

          const { data: cardData, error: cardError } = await supabase
            .from('loyalty_cards')
            .select('id')
            .eq('customer_id', customerData.id)
            .limit(1)
            .single();
            
          if (cardError || !cardData) {
            throw new Error("No loyalty card found. Please sign up via a store's QR code.");
          }
          
          navigate(`/customer/card/${cardData.id}`);

        } catch (e) {
          toast({ title: "Redirect Error", description: e.message, variant: "destructive" });
          navigate('/');
        }
      }
    };

    redirectUser();

  }, [user, loading, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-lg">Redirecting...</div>
    </div>
  );
};

export default AuthRedirect;