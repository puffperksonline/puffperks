
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient.js';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Users, Repeat, Gift, Award } from 'lucide-react';
import { TrialCard } from '@/components/dashboard/TrialCard.jsx';
import { StatsCard } from '@/components/dashboard/StatsCard.jsx';
import { LocationsManager } from '@/components/dashboard/LocationsManager.jsx';
import { RewardsCard } from '@/components/dashboard/RewardsCard.jsx';
import NoticeBoard from '@/components/dashboard/NoticeBoard.jsx';
import ReferralToggle from '@/components/dashboard/ReferralToggle.jsx';
import { VisitAnalyticsCard } from '@/components/dashboard/VisitAnalyticsCard.jsx';
import { ActiveCustomersPanel } from '@/components/dashboard/ActiveCustomersPanel.jsx';

const StoreDashboard = () => {
    const { user } = useAuth();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [segments, setSegments] = useState(null);
    const [rewards, setRewards] = useState([]);

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

                const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke('get-analytics', { body: { store_id: data.id } });
                if (analyticsError) console.error('Analytics Error:', analyticsError.message);
                setAnalytics(analyticsData);

                const { data: segmentsData, error: segmentsError } = await supabase.functions.invoke('get-customer-segments', { body: { store_id: data.id } });
                if (segmentsError) console.error('Segments Error:', segmentsError.message);
                setSegments(segmentsData);
            }
        } catch (error) {
            console.error('Error fetching store data:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [user]);

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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {store.subscription_status === 'trialing' && store.trial_ends_at && (
                           <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}} className="lg:col-span-4">
                               <TrialCard trialEndsAt={store.trial_ends_at} paymentLink={store.stripe_payment_link} />
                           </motion.div>
                        )}
                        
                        <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}} className="lg:col-span-4">
                           <NoticeBoard storeId={store.id} />
                        </motion.div>

                        <StatsCard icon={Users} title="Total Customers" data={analytics?.total_customers} isLoading={!analytics} />
                        <StatsCard icon={Repeat} title="Repeat Customers" data={analytics?.repeat_customers} isLoading={!analytics} />
                        <StatsCard icon={Award} title="Stamps Issued" data={analytics?.stamps_issued} isLoading={!analytics} />
                        <StatsCard icon={Gift} title="Prizes Redeemed" data={analytics?.prizes_redeemed} isLoading={!analytics} />

                        <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}} className="lg:col-span-2">
                            <ActiveCustomersPanel store={store} rewards={rewards} />
                        </motion.div>
                        
                        <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}} className="lg:col-span-2">
                           <RewardsCard storeId={store.id} rewards={rewards} onUpdate={() => fetchStoreData(true)} />
                        </motion.div>

                        <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}} className="lg:col-span-4 xl:col-span-2">
                           <VisitAnalyticsCard segments={segments} isLoading={!segments} />
                        </motion.div>
                         
                        <motion.div variants={{hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }}} className="lg:col-span-4 xl:col-span-2 glass-effect rounded-xl p-6 flex flex-col justify-between">
                            <LocationsManager store={store} onUpdate={() => fetchStoreData(true)} />
                             <div className="pt-6 mt-6 border-t border-gray-700">
                                <ReferralToggle storeId={store.id} initialValue={store.referral_enabled} />
                            </div>
                        </motion.div>

                    </motion.div>
                </AnimatePresence>
            </main>
        </>
    );
};

export default StoreDashboard;
