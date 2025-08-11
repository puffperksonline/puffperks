
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, LogIn as LoginIcon, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient.js';

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await signIn(formData.email, formData.password);

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Check user role and redirect
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', data.user.id)
        .maybeSingle();

      if (store) {
        navigate('/store/dashboard');
      } else {
        const { data: loyaltyCard } = await supabase
          .from('loyalty_cards')
          .select('id, customers!inner(user_id)')
          .eq('customers.user_id', data.user.id)
          .limit(1)
          .maybeSingle();
        
        if (loyaltyCard) {
          navigate(`/customer/card/${loyaltyCard.id}`);
        } else {
          toast({ title: "Login Failed", description: "Could not determine your account type. Please contact support.", variant: "destructive" });
          setIsLoading(false);
        }
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - Puff Perks</title>
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
                  <LoginIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
                <p className="text-gray-300">Sign in to access your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button onClick={() => navigate('/store/signup')} className="text-purple-400 hover:text-purple-300">Sign up</button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
