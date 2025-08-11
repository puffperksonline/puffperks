
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';
import { ArrowLeft, User, Mail, Lock, Users } from 'lucide-react';

const CustomerSignup = () => {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const { signUp, signIn } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [isLocationValid, setIsLocationValid] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!locationId) {
        setIsLocationValid(false);
        return;
      }
      const { data, error } = await supabase
        .from('locations')
        .select('name, stores(store_name)')
        .eq('id', locationId)
        .single();

      if (error || !data) {
        console.error('Error fetching location:', error);
        setIsLocationValid(false);
        toast({
          title: "Invalid Link",
          description: "This signup link is invalid or has expired.",
          variant: "destructive"
        });
      } else {
        setStoreName(data.stores.store_name);
      }
    };
    fetchLocationDetails();
  }, [locationId, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      is_store_owner: false,
      location_id: locationId
    });

    if (signUpError) {
      setIsLoading(false);
      return;
    }

    const { data: signInData, error: signInError } = await signIn(formData.email, formData.password);

    if (!signInError && signInData.user) {
        const { data: loyaltyCard } = await supabase
          .from('loyalty_cards')
          .select('id, customers!inner(user_id)')
          .eq('customers.user_id', signInData.user.id)
          .limit(1)
          .maybeSingle();
        
        if (loyaltyCard) {
            toast({ title: "Welcome! 🎉", description: "You've joined the loyalty program!" });
            navigate(`/customer/card/${loyaltyCard.id}`);
        } else {
            toast({ title: "Error", description: "Could not find your new loyalty card. Please try logging in.", variant: "destructive" });
            navigate('/login');
        }
    } else {
        setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isLocationValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Invalid Signup Link</h1>
          <p className="text-gray-400 mt-2">Please check the URL or contact the store for a new link.</p>
          <Button onClick={() => navigate('/')} className="mt-6">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Join Loyalty Program - Puff Perks</title>
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
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Join {storeName || 'the'} Loyalty Program</h1>
                <p className="text-gray-300">Create an account to start earning rewards.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} placeholder="Your Name" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} placeholder="Create a password" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" className="pl-10 bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg">
                  {isLoading ? 'Creating Account...' : 'Create Account & Get Rewards'}
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

export default CustomerSignup;
