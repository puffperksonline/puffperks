
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

const AuthRedirect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying your account...');
    const attempts = useRef(0);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const checkUserRoleAndRedirect = async () => {
            attempts.current += 1;

            // Check if the user is a STORE OWNER
            const { data: store, error: storeError } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
            if (storeError && storeError.code !== 'PGRST116') {
                console.error("AuthRedirect Store Check Error:", storeError);
                setStatus('There was an error verifying your account. Please try again.');
                return;
            }
            if (store) {
                navigate('/store/dashboard');
                return;
            }

            // If not an owner, check if they are a CUSTOMER
            const { data: loyaltyCard, error: cardError } = await supabase.from('loyalty_cards').select('id, customers!inner(user_id)').eq('customers.user_id', user.id).maybeSingle();

            if (cardError && cardError.code !== 'PGRST116') { // PGRST116 = no rows found, which is okay
                console.error("AuthRedirect Card Check Error:", cardError);
                setStatus('Could not find an active account. Please contact support.');
                return;
            }
            if (loyaltyCard) {
                navigate(`/customer/card/${loyaltyCard.id}`);
                return;
            }

            // If neither is found, it might be due to replication delay. Retry a few times.
            if (attempts.current < 5) { // Retry up to 5 times (total of ~2.5 seconds)
                setStatus(`Finalizing account setup...`);
                setTimeout(checkUserRoleAndRedirect, 500); 
            } else {
                setStatus('Could not find an active account. Please contact support.');
            }
        };

        // Give the database a moment to run the handle_new_user function before checking
        const initialTimer = setTimeout(checkUserRoleAndRedirect, 500); // Start first check after 0.5s

        return () => clearTimeout(initialTimer);
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>{status}</p>
            </div>
        </div>
    );
};

export default AuthRedirect;
