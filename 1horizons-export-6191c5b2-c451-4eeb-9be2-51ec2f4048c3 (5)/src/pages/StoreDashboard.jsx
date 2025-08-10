import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient.js';
import { Button } from '@/components/ui/button';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';
import { RewardsCard } from '@/components/dashboard/RewardsCard';
import { LiveCustomerPanel } from '@/components/dashboard/LiveCustomerPanel';
import { TrialCard } from '@/components/dashboard/TrialCard';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { motion } from 'framer-motion';
import NoticeBoard from '@/components/dashboard/NoticeBoard.jsx';

const TrialExpiredOverlay = ({ storeName, email }) => {
  const upgradeUrl = `https://buy.stripe.com/bJeaEW4e59gWdfa9XT5kk01?prefilled_email=${encodeURIComponent(email || '')}`;
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
          Thanks for trying Puff Perks! To continue using the dashboard and rewarding your customers for {storeName}, please upgrade your plan.
        </p>
        <a href={upgradeUrl} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg h-12 px-10">
            Sign Up Now
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
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  
  const fetchStoreData = useCallback(async () => {
    if (!user) return;
    
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select(`*, locations (*, store_hours(*)), rewards (*)`)
      .eq('owner_id', user.id)
      .single();

    if (storeError || !store) {
      if (storeError && storeError.code === 'PGRST116') {
        toast({ title: "Store Not Found", description: "We couldn't find your store data. Please sign up again or contact support.", variant: "destructive" });
        navigate('/store/signup');
      } else {
        toast({ title: "Error Loading Data", description: `Could not fetch your store's data. Please try again.`, variant: "destructive" });
        if (storeError) console.error("Error fetching store data:", storeError);
        navigate('/login');
      }
      return;
    }

    setStoreData(store);
    setLocations(store.locations || []);
    const sortedRewards = (store.rewards || []).sort((a, b) => a.stamps_required - b.stamps_required);
    setRewards(sortedRewards);
    
    if (store.locations && store.locations.length > 0 && !selectedLocation) {
      setSelectedLocation(store.locations[0]);
    }
    
    if (store.trial_ends_at && new Date(store.trial_ends_at) < new Date()) {
      setIsTrialExpired(true);
    }
    
  }, [user, toast, navigate, selectedLocation]);
  
  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData, user]);
  
  useEffect(() => {
    if (!storeData?.trial_ends_at) return;
    const interval = setInterval(() => {
        if (new Date(storeData.trial_ends_at) < new Date()) {
            setIsTrialExpired(true);
            clearInterval(interval);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [storeData]);

  const handleCardDesignSave = (updatedLocation) => {
    setSelectedLocation(updatedLocation);
    setLocations(locations.map(l => l.id === updatedLocation.id ? updatedLocation : l));
  };
  
  const handleRewardsUpdate = (newRewards) => {
    setRewards(newRewards.sort((a, b) => a.stamps_required - b.stamps_required));
  };
  
  const handleFeatureClick = () => {
    toast({
      title: "🚧 Feature Coming Soon",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  if (!storeData || !selectedLocation) {
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

  return (
    <>
      <Helmet>
        <title>Dashboard - {storeData.store_name}</title>
        <meta name="description" content="Manage your digital loyalty program with real-time analytics and customer insights." />
      </Helmet>
      
      {isTrialExpired && <TrialExpiredOverlay storeName={storeData.store_name} email={user?.email} />}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-screen bg-gray-900 pb-16 ${isTrialExpired ? 'grayscale pointer-events-none' : ''}`}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {storeData.owner_name.split(' ')[0]}!</p>
          </div>

          {locations.length > 1 && (
            <div className="mb-8">
              <div className="flex space-x-2">
                {locations.map((location) => (
                  <Button
                    key={location.id}
                    variant={selectedLocation.id === location.id ? "secondary" : "outline"}
                    onClick={() => setSelectedLocation(location)}
                  >
                    {location.name}
                  </Button>
                ))}
                <Button variant="outline" onClick={handleFeatureClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </div>
          )}
          
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <QRCodeCard selectedLocation={selectedLocation} storeName={storeData.store_name} onCardDesignSave={handleCardDesignSave} rewards={rewards} />
              <AnalyticsCard storeId={storeData.id} />
              <RewardsCard rewards={rewards} storeId={storeData.id} onUpdate={handleRewardsUpdate} storeData={storeData} setStoreData={setStoreData} />
            </div>
            <div className="space-y-8">
              <LiveCustomerPanel selectedLocation={selectedLocation} onCustomerUpdate={fetchStoreData} />
              <TrialCard trialEndsAt={storeData.trial_ends_at} />
              <NoticeBoard storeId={storeData.id} />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            <QRCodeCard selectedLocation={selectedLocation} storeName={storeData.store_name} onCardDesignSave={handleCardDesignSave} rewards={rewards} />
            <LiveCustomerPanel selectedLocation={selectedLocation} onCustomerUpdate={fetchStoreData} />
            <TrialCard trialEndsAt={storeData.trial_ends_at} />
            <NoticeBoard storeId={storeData.id} />
            <AnalyticsCard storeId={storeData.id} />
            <RewardsCard rewards={rewards} storeId={storeData.id} onUpdate={handleRewardsUpdate} storeData={storeData} setStoreData={setStoreData} />
          </div>

        </main>
      </motion.div>
    </>
  );
};

export default StoreDashboard;
