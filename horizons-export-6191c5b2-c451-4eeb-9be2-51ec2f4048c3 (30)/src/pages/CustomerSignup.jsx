import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx'; // Make sure this path is correct

const CustomerSignup = () => {
	const navigate = useNavigate();
	const { locationId } = useParams();
	const { signUp, signIn } = useAuth();
	const [formData, setFormData] = useState({ name: '', email: '', password: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		const { error: signUpError } = await signUp(formData.email, formData.password, {
			full_name: formData.name,
			is_store_owner: false // Explicitly state this is NOT a store owner
		});

		if (signUpError) {
			setError(signUpError.message);
			setIsLoading(false);
			return;
		}

		const { error: signInError } = await signIn(formData.email, formData.password);
		if (signInError) {
			setError(signInError.message);
			setIsLoading(false);
			return;
		}

		// After successful sign-in, send user to the AuthRedirect component to be sorted
		navigate('/auth/redirect');
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
			<h1>Join Loyalty Program</h1>
			<p>Create an account to start earning rewards.</p>
			<form onSubmit={handleSubmit} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '2rem auto' }}>
				<input name="name" type="text" required onChange={handleInputChange} placeholder="Your Name" style={{ padding: '0.5rem', borderRadius: '4px' }} />
				<input name="email" type="email" required onChange={handleInputChange} placeholder="your@email.com" style={{ padding: '0.5rem', borderRadius: '4px' }} />
				<input name="password" type="password" required onChange={handleInputChange} placeholder="Create a password" style={{ padding: '0.5rem', borderRadius: '4px' }} />
				<button type="submit" disabled={isLoading} style={{ padding: '0.75rem', borderRadius: '4px', background: 'purple', color: 'white', border: 'none' }}>
					{isLoading ? 'Creating Account...' : 'Create Account'}
				</button>
				{error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
			</form>
		</div>
	);
};

export default CustomerSignup;