
import React, { useEffect, useState, useRef } from 'react';
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
            navigate('/login', { replace: true });
            return;
        }

        const checkUserRoleAndRedirect = async () => {
            // This component should now ONLY handle store owner redirects.
            // Customer redirects are handled by the CustomerCard page.
            const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
            if (store) {
                navigate('/store/dashboard', { replace: true });
            } else {
                // This case should ideally not be hit if the flow is correct.
                // It's a fallback.
                setStatus('Could not determine your account type. Please try logging in again.');
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        };

        checkUserRoleAndRedirect();

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
