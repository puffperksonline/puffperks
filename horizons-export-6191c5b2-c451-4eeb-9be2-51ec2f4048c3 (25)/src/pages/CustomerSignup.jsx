
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

const CustomerSignup = () => {
    const navigate = useNavigate();
    const { locationId, referralCode } = useParams();
    const { signUp, signIn } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { error: signUpError } = await signUp(formData.email, formData.password, {
            full_name: formData.name,
            location_id: locationId,
            referral_code: referralCode,
        });

        if (signUpError) {
            toast({ title: "Signup Failed", description: signUpError.message, variant: "destructive" });
            setIsLoading(false);
            return;
        }

        const { error: signInError } = await signIn(formData.email, formData.password);

        if (!signInError) {
            toast({ title: "Welcome! 🎉", description: "You've joined the loyalty program!" });
            navigate('/customer/card/new');
        } else {
            toast({ title: "Sign-in Failed", description: signInError.message, variant: "destructive" });
        }
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <Helmet>
                <title>Join Loyalty Program - Puff Perks</title>
                <meta name="description" content={`Join the digital loyalty program and start earning rewards today!`} />
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
                                <h1 className="text-2xl font-bold text-white mb-2">Join the Loyalty Program</h1>
                                <p className="text-gray-300">Create your digital loyalty card.</p>
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
