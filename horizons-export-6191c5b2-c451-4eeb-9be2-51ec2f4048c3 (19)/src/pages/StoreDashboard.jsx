
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Ban } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient.js';
import { Button } from '@/components/ui/button';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';
import { LiveCustomerPanel } from '@/components/dashboard/LiveCustomerPanel';
import { TrialCard } from '@/components/dashboard/TrialCard';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { motion } from 'framer-motion';
import NoticeBoard from '@/components/dashboard/NoticeBoard.jsx';
import RewardManager from '@/components/dashboard/RewardManager.jsx';
import ReferralToggle from '@/components/dashboard/ReferralToggle.jsx';

const PastDueBanner = ({ paymentLink }) => (
  <div className="bg-yellow-500/20 border-l-4 border-yellow-400 text-yellow-200 p-4 mb-8 flex items-center justify-between">
    <div className="flex items-center">
      <AlertTriangle className="h-6 w-6 mr-4" />
      <div>
        <p className="font-bold">Payment Issue</p>
        <p>Your subscription payment has failed. Please update your payment information to restore full access.</p>
      </div>
    </div>
    <a href={paymentLink} target="_blank" rel="noopener noreferrer">
      <Button variant="secondary">Update Payment Info</Button>
    </a>
  </div>
);

const CancelledOverlay = ({ paymentLink }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-lg"
    >
      <Ban className="w-16 h-16 mx-auto mb-4 text-red-500" />
      <h2 className="text-4xl font-bold text-white mb-4">Account Cancelled</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Your subscription has been cancelled. To reactivate your account and regain access, please renew your subscription.
      </p>
      <a href={paymentLink} target="_blank" rel="noopener noreferrer">
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg h-12 px-10">
          Renew Subscription
        </Button>
      </a>
    </motion.div>
  </div>
);


const TrialExpiredOverlay = ({ storeName, email, paymentLink }) => {
  const upgradeUrl = paymentLink ? `${paymentLink}?prefilled_email=${encodeURIComponent(email || '')}` : `https://buy.stripe.com/bJeaEW4e59gWdfa9XT5kk01?prefilled_email=${encodeURIComponent(email || '')}`;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-lg"
      >
        <h2 className="text-4xl font-bold text-white mb-4">Your Free Trial Has Expired</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Thanks for trying Puff Perks! To continue using the dashboard and rewarding your customers for {storeName ?? 'your store'}, please subscribe to a plan.
        </p>
        <a href={upgradeUrl} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg h-12 px-10">
            Upgrade Now
          </Button>
        </a>
      </motion.div>
    </div>
  );
};

const StoreDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchStoreData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
        const { data: store, error: storeError } = await supabase
        .from('stores')
        .select(`*, locations (*, store_hours(*)), rewards (*)`)
        .eq('owner_id', user.id)
        .single();

      if (storeError) throw storeError;
      if (!store) throw new Error("No store data found for this user.");

      setStoreData(store);
      const storeLocations = store.locations ?? [];
      setLocations(storeLocations);
      const sortedRewards = (store.rewards ?? []).sort((a, b) => a.stamps_required - b.stamps_required);
      setRewards(sortedRewards);
      
      if (storeLocations.length > 0) {
        setSelectedLocation(prev => storeLocations.find(l => l.id === prev?.id) || storeLocations[0]);
      } else {
        setSelectedLocation(null);
      }
      
    } catch (err) {
      const errorMessage = err.message || "Could not fetch your store's data.";
      setError(errorMessage);
      toast({ title: "Error Loading Data", description: errorMessage, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchStoreData();
  }, [user, fetchStoreData]);

  const handleCardDesignSave = (updatedLocation) => {
    setSelectedLocation(updatedLocation);
    setLocations(currentLocations => (currentLocations ?? []).map(l => l.id === updatedLocation.id ? updatedLocation : l));
  };

  const handleLocationsUpdate = () => {
    fetchStoreData();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-lg flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading Dashboard...
      </div>
    </div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
        <div className="text-center">
          <p>Could not load dashboard: {error}</p>
          <Button onClick={fetchStoreData} className="mt-4">Try Again</Button>
        </div>
      </div>
    );
  }
  
  const ownerFirstName = storeData?.owner_name?.split(' ')[0] ?? 'there';
  
  const isTrialExpired = storeData?.subscription_status === 'trialing' && storeData?.trial_ends_at && new Date(storeData.trial_ends_at) < new Date();
  
  const renderDashboardContent = () => {
      if (storeData?.subscription_status === 'cancelled') {
          return <CancelledOverlay paymentLink={storeData.stripe_payment_link} />;
      }
      
      const isPastDue = storeData?.subscription_status === 'past_due';

      return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen bg-gray-900 pb-16 ${isTrialExpired ? 'grayscale pointer-events-none' : ''}`}
        >
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isPastDue && <PastDueBanner paymentLink={storeData.stripe_payment_link} />}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {ownerFirstName}!</p>
            </div>

            {(locations ?? []).length > 1 && (
                <div className="mb-8">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {locations.map((location) => (
                    <Button
                        key={location.id}
                        variant={selectedLocation?.id === location.id ? "secondary" : "outline"}
                        onClick={() => setSelectedLocation(location)}
                        className="flex-shrink-0"
                    >
                        {location.name}
                    </Button>
                    ))}
                </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                {selectedLocation ? (
                    <QRCodeCard selectedLocation={selectedLocation} storeName={storeData?.store_name} onCardDesignSave={handleCardDesignSave} rewards={rewards} />
                ) : (
                    <div className="glass-effect rounded-xl p-6 text-center">
                    <h3 className="text-lg font-semibold text-white">Welcome to Puff Perks!</h3>
                    <p className="text-gray-400 mt-2">To get started, please add your first store location in the Settings page.</p>
                    <Button onClick={() => navigate('/store/settings')} className="mt-4">Go to Settings</Button>
                    </div>
                )}
                <AnalyticsCard storeId={storeData?.id} />
                <RewardManager storeId={storeData?.id} initialRewards={rewards} onUpdate={setRewards}/>
                <ReferralToggle initialIsEnabled={storeData?.referral_enabled} storeId={storeData?.id} />
                </div>
                <div className="space-y-8">
                {selectedLocation ? (
                    <LiveCustomerPanel selectedLocation={selectedLocation} onCustomerUpdate={fetchStoreData} />
                ) : (
                    <div className="glass-effect rounded-xl p-6 text-center h-[22rem] flex items-center justify-center">
                    <p className="text-gray-400">Live sessions will appear here once a location is set up.</p>
                    </div>
                )}
                {storeData?.subscription_status === 'trialing' && <TrialCard trialEndsAt={storeData?.trial_ends_at} paymentLink={storeData?.stripe_payment_link} />}
                <NoticeBoard storeId={storeData?.id} />
                </div>
            </div>
            </main>
        </motion.div>
      )
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - {storeData?.store_name ?? 'Your Store'}</title>
        <meta name="description" content="Manage your digital loyalty program with real-time analytics and customer insights." />
      </Helmet>
      
      {isTrialExpired && <TrialExpiredOverlay storeName={storeData?.store_name} email={user?.email} paymentLink={storeData?.stripe_payment_link} />}
      
      {renderDashboardContent()}
    </>
  );
};

export default StoreDashboard;
