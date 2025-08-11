
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Store, Mail, Lock } from 'lucide-react';

const StoreSignup = () => {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', store_name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error: signUpError } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      store_name: formData.store_name,
      is_store_owner: true
    });

    if (signUpError) {
      toast({ title: "Signup Failed", description: signUpError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // After a successful signup, Supabase trigger handle_new_user runs.
    // We then sign in to create a session.
    const { data, error: signInError } = await signIn(formData.email, formData.password);
    
    if (signInError) {
      toast({ title: "Sign-in Failed", description: "Your account was created, but we couldn't sign you in. Please try logging in manually.", variant: "destructive" });
      setIsLoading(false);
      navigate('/login');
      return;
    }

    if (data.user) {
      // After sign-in, redirect to the dashboard. The dashboard will handle loading the new store data.
      navigate('/store/dashboard');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Start Free Trial - Puff Perks</title>
        <meta name="description" content="Sign up for a free 7-day trial and see how Puff Perks can grow your business." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-8 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="glass-effect rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Start Your Free Trial</h1>
                <p className="text-gray-300">No credit card required. Get started in seconds.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white">Your Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="name" name="name" type="text" required onChange={handleInputChange} placeholder="e.g., Jane Doe" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="store_name" className="text-white">Store Name</Label>
                  <div className="relative mt-1">
                    <Store className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="store_name" name="store_name" type="text" required onChange={handleInputChange} placeholder="e.g., The Corner Cafe" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="email" name="email" type="email" required onChange={handleInputChange} placeholder="your@email.com" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="password" name="password" type="password" required onChange={handleInputChange} placeholder="6+ characters" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg">
                  {isLoading ? 'Creating Account...' : 'Start Free Trial'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <button onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300">Sign in</button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StoreSignup;
