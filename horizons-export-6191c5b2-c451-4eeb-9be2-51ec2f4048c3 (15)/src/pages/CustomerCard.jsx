
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient.js';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { LoyaltyCard } from '@/components/customer-card/LoyaltyCard.jsx';
import { ActionButtons } from '@/components/customer-card/ActionButtons.jsx';
import { RewardList } from '@/components/customer-card/RewardList.jsx';
import { SettingsDialog } from '@/components/customer-card/SettingsDialog.jsx';
import { ReferralDialog } from '@/components/customer-card/ReferralDialog.jsx';
import { getTextColor } from '@/lib/colorUtils.js';
import { Button } from '@/components/ui/button';

const CustomerCard = () => {
  const { loyaltyCardId } = useParams();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unclaimedRewards, setUnclaimedRewards] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(null);

  const fetchCardData = useCallback(async () => {
    if (!user || !loyaltyCardId) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: cardError } = await supabase
        .from('loyalty_cards')
        .select(`
          id,
          created_at,
          stamps,
          max_stamps,
          customer:customers!inner(id, full_name, user_id, referral_code),
          location:locations!inner(id, name, card_bg_color, card_text_color, card_stamp_color, logo_url, store:stores!inner(id, store_name, referral_enabled))
        `)
        .eq('id', loyaltyCardId)
        .eq('customer.user_id', user.id)
        .single();
        
      if (cardError || !data) {
        throw new Error("No Loyalty Card Found. Please sign up using a valid QR code from a store.");
      }

      setCardData(data);
      const textColor = getTextColor(data.location.card_bg_color);
      document.documentElement.style.setProperty('--card-dynamic-text-color', textColor);
      document.documentElement.style.setProperty('--card-dynamic-bg-color', data.location.card_bg_color);
      document.body.style.backgroundColor = data.location.card_bg_color;

      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('store_id', data.location.store.id)
        .eq('is_active', true);

      if (rewardsError) console.error("Error fetching rewards:", rewardsError);
      else setUnclaimedRewards(rewardsData || []);

    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loyaltyCardId, user, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchCardData();
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [authLoading, fetchCardData]);

  useEffect(() => {
    if (!cardData?.customer?.id) return;
    
    const channel = supabase.channel(`customer-card-${cardData.customer.id}`);

    const handleStampUpdate = (payload) => {
        if(payload.new.id === loyaltyCardId) {
            setCardData(prev => ({ ...prev, stamps: payload.new.stamps }));
            fetchCardData();
        }
    };

    channel
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'loyalty_cards', filter: `id=eq.${loyaltyCardId}`}, handleStampUpdate)
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardData, loyaltyCardId, fetchCardData]);

  const handleRedeem = async (reward) => {
    setIsRedeeming(reward.id);
    try {
      const { error } = await supabase.functions.invoke('redeem-reward', {
        body: { loyalty_card_id: cardData.id, reward_id: reward.id }
      });
      if (error) throw error;
      toast({ title: "Reward Redeemed!", description: `You've successfully redeemed: ${reward.description}` });
      await fetchCardData();
    } catch (e) {
      toast({ title: "Redemption Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsRedeeming(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-lg flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your card...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h2>
        <p className="text-gray-300 mb-6 max-w-md">{error}</p>
        <Button onClick={() => navigate('/')}>Go to Homepage</Button>
      </div>
    );
  }
  
  if (!cardData) {
    return null; // Should be handled by error state
  }

  return (
    <>
      <Helmet>
        <title>{cardData.location.store.store_name} - Loyalty Card</title>
        <meta name="description" content={`Your digital loyalty card for ${cardData.location.store.store_name}.`} />
      </Helmet>

      <div className="min-h-screen w-full font-sans transition-colors duration-500" style={{ backgroundColor: cardData.location.card_bg_color || '#111827' }}>
        <div className="container mx-auto max-w-md p-4 relative text-[var(--card-dynamic-text-color)]">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LoyaltyCard 
                  cardData={cardData} 
                  locationData={cardData.location}
                  customerData={cardData.customer}
                  rewards={unclaimedRewards}
              />
              
              <ActionButtons 
                onSettingsClick={() => setIsSettingsOpen(true)} 
                onReferClick={() => setIsReferralOpen(true)}
                onLogout={signOut}
                showReferral={cardData.location.store?.referral_enabled}
              />
              
              <RewardList
                rewards={unclaimedRewards}
                currentStamps={cardData.stamps}
                isRedeeming={isRedeeming}
                onRedeem={handleRedeem}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        setIsOpen={setIsSettingsOpen}
        customer={cardData.customer}
        onCustomerUpdate={fetchCardData}
      />

      {cardData.customer.referral_code &&
        <ReferralDialog
          isOpen={isReferralOpen}
          setIsOpen={setIsReferralOpen}
          customer={cardData.customer}
          location={cardData.location}
        />
      }
    </>
  );
};

export default CustomerCard;
