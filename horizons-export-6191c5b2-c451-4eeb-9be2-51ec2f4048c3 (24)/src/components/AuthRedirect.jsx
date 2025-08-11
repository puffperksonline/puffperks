
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';
import { Loader2 } from 'lucide-react';

const AuthRedirect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying your account...');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        let redirectCheckInterval;

        const checkUserRoleAndRedirect = async () => {
            // Check for store owner
            const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
            if (store) {
                navigate('/store/dashboard', { replace: true });
                return true;
            }
            
            // Check for customer
            const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).maybeSingle();
            if (customer) {
                const { data: loyaltyCard } = await supabase.from('loyalty_cards').select('id').eq('customer_id', customer.id).maybeSingle();
                if (loyaltyCard) {
                    navigate(`/customer/card/${loyaltyCard.id}`, { replace: true });
                    return true;
                }
            }

            return false;
        };

        const startPolling = () => {
             // Initial check
             checkUserRoleAndRedirect().then(resolved => {
                if(!resolved){
                    setStatus('Account setup is still in progress. Please wait a moment...');
                    // If not resolved, start polling
                    redirectCheckInterval = setInterval(async () => {
                        const wasResolved = await checkUserRoleAndRedirect();
                        if (wasResolved) {
                            clearInterval(redirectCheckInterval);
                        }
                    }, 2000); // Check every 2 seconds
                }
             });
        }
        
        startPolling();

        const timeout = setTimeout(() => {
            if (redirectCheckInterval) {
                clearInterval(redirectCheckInterval);
                setStatus('Could not complete setup. Please try logging in again.');
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        }, 30000); // 30-second timeout for the whole process


        return () => {
            if (redirectCheckInterval) clearInterval(redirectCheckInterval);
            clearTimeout(timeout);
        };

    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="flex flex-col items-center space-y-4">
             <Loader2 className="animate-spin h-8 w-8 text-purple-400" />
             <p className="text-lg">{status}</p>
          </div>
        </div>
      );
};

export default AuthRedirect;
