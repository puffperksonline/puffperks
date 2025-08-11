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
			// Check if the user is a STORE OWNER
			const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
			if (store) {
				navigate('/store/dashboard');
				return;
			}

			// If not an owner, check if they are a CUSTOMER
			const { data: loyaltyCard } = await supabase.from('loyalty_cards').select('id').eq('customer_id', user.id).maybeSingle();
			if (loyaltyCard) {
				navigate(`/customer/card/${loyaltyCard.id}`);
				return;
			}

			setStatus('Account setup is still in progress. Please try again in a moment...');
		};

		// Give the database a moment to run the handle_new_user function before checking
		const timer = setTimeout(() => {
			checkUserRoleAndRedirect();
		}, 1500); // 1.5 second delay

		return () => clearTimeout(timer);
	}, [user, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
			<p>{status}</p>
		</div>
	);
};

export default AuthRedirect;