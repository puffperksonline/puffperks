import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient.js';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Building } from 'lucide-react';
import { TrialCard } from '@/components/dashboard/TrialCard.jsx';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard.jsx';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard.jsx';
import { RewardsCard } from '@/components/dashboard/RewardsCard.jsx';
import NoticeBoard from '@/components/dashboard/NoticeBoard.jsx';
import ReferralToggle from '@/components/dashboard/ReferralToggle.jsx';
import { LiveCustomerPanel } from '@/components/dashboard/LiveCustomerPanel.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FirstLocationPrompt = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center glass-effect p-8 rounded-xl max-w-lg"
            >
                <Building className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Puff Perks!</h2>
                <p className="text-gray-300 mb-6">
                    Your store is ready. The first step is to add your first business location. This will generate a unique QR code for customers to sign up.
                </p>
                <Button size="lg" onClick={() => navigate('/store/settings/locations')}>
                    Add Your First Location
                </Button>
            </motion.div>
        </div>
    );
};

const StoreDashboard = () => {
    const { user } = useAuth();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rewards, setRewards] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const fetchStoreData = useCallback(async (isSilent = false) => {
        if (!user) return;
        if (!isSilent) setLoading(true);

        try {
            const { data, error } = await supabase
                .from('stores')
                .select('*, locations(*), rewards(*)')
                .eq('owner_id', user.id)
                .maybeSingle(); 

            if (error) throw error;
            
            if (data) {
                setStore(data);
                const sortedRewards = data.rewards ? [...data.rewards].sort((a, b) => a.stamps_required - b.stamps_required) : [];
                setRewards(sortedRewards);
                if (data.locations && data.locations.length > 0 && !selectedLocation) {
                    setSelectedLocation(data.locations[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching store data:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [user, selectedLocation]);

    useEffect(() => {
        fetchStoreData();
    }, [fetchStoreData]);
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        );
    }
    
    if (!store) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-900 text-center">
                <div>
                    <p className="text-white text-lg">Your account is being set up.</p>
                    <p className="text-sm text-gray-400 mt-2">If this screen persists, please refresh the page.</p>
                </div>
            </div>
        )
    }

    if (!store.locations || store.locations.length === 0) {
        return <FirstLocationPrompt />;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    return (
        <>
            <Helmet>
                <title>Dashboard - {store?.store_name || 'Puff Perks'}</title>
            </Helmet>
            <main className="p-4 sm:p-6 lg:p-8">
                <AnimatePresence>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}}>
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                                    {store.locations && store.locations.length > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    {selectedLocation?.name || 'Select Location'}
                                                    <ChevronDown className="w-4 h-4 ml-2" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="glass-effect">
                                                {store.locations.map(loc => (
                                                    <DropdownMenuItem key={loc.id} onSelect={() => setSelectedLocation(loc)}>
                                                        {loc.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                <QRCodeCard selectedLocation={selectedLocation} storeName={store.store_name} onCardDesignSave={() => fetchStoreData(true)} rewards={rewards} />
                            </motion.div>
                            
                            <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}}>
                                <AnalyticsCard storeId={store.id} />
                            </motion.div>

                            <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}}>
                                <RewardsCard storeId={store.id} rewards={rewards} onUpdate={() => fetchStoreData(true)} />
                            </motion.div>
                            
                            <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}} className="glass-effect rounded-xl p-6">
                                <ReferralToggle storeId={store.id} initialValue={store.referral_enabled} />
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {store.subscription_status === 'trialing' && store.trial_ends_at && (
                               <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}}>
                                   <TrialCard trialEndsAt={store.trial_ends_at} paymentLink={store.stripe_payment_link} />
                               </motion.div>
                            )}
                            
                            <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}}>
                                <LiveCustomerPanel selectedLocation={selectedLocation} onCustomerUpdate={() => fetchStoreData(true)} />
                            </motion.div>

                            <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}}>
                               <NoticeBoard storeId={store.id} />
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </>
    );
};

export default StoreDashboard;