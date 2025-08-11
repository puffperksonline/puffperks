import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Lock, Store, Gift } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

const CustomerSignup = () => {
  const navigate = useNavigate();
  const { locationId, referralCode } = useParams();
  const { signUp, signIn } = useAuth();
  const [locationData, setLocationData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      if (!locationId) {
        toast({ title: "Error", description: "No location specified.", variant: "destructive" });
        setIsFetchingLocation(false);
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('locations')
          .select(`
            name,
            stores ( store_name )
          `)
          .eq('id', locationId)
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Invalid store link.");
        }
        
        setLocationData(data);

      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        navigate('/');
      } finally {
        setIsFetchingLocation(false);
      }
    };
    
    fetchLocationData();
  }, [locationId, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!locationData) {
      toast({ title: "Store Not Found", description: "Invalid store QR code.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      is_store_owner: false,
      location_id: locationId,
      referral_code: referralCode
    });

    if (signUpError) {
        setIsLoading(false);
        return;
    }

    const { error: signInError } = await signIn(formData.email, formData.password);

    if (!signInError) {
      toast({
        title: "Welcome! 🎉",
        description: `You've joined ${locationData.stores.store_name}'s loyalty program!`
      });
      navigate('/auth/redirect');
    }
    
    setIsLoading(false);
  };
  
    const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isFetchingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading store information...
        </div>
      </div>
    );
  }

  if (!locationData) {
    return null; 
  }

  return (
    <>
      <Helmet>
        <title>Join {locationData.stores.store_name} - Puff Perks</title>
        <meta name="description" content={`Join ${locationData.stores.store_name}'s digital loyalty program and start earning rewards today!`} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-effect rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Join {locationData.stores.store_name}</h1>
                <p className="text-gray-300">Create your digital loyalty card</p>
                {referralCode && (
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg text-green-300 border border-green-500/30 flex items-center justify-center space-x-2">
                    <Gift className="w-5 h-5"/>
                    <span>Referral applied! You'll get a bonus stamp!</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

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
                      placeholder="Enter your email"
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
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
                >
                  {isLoading ? 'Creating Account...' : 'Join Loyalty Program'}
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