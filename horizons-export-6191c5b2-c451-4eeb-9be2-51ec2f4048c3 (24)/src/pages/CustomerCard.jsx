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
import { Loader2 } from 'lucide-react';

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
    if (!user) {
        if (!authLoading) setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
        let cardIdToFetch = loyaltyCardId;
        
        // If loyaltyCardId is 'new', it means the user just signed up.
        // We need to find their newly created loyalty card.
        if (loyaltyCardId === 'new') {
            const { data: newCard, error: newCardError } = await supabase
                .from('loyalty_cards')
                .select('id, customer:customers!inner(user_id)')
                .eq('customer.user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (newCardError || !newCard) {
                throw new Error("Could not find your new loyalty card. Please try signing up again.");
            }
            cardIdToFetch = newCard.id;
            // IMPORTANT: Replace the URL to reflect the actual card ID
            // This prevents re-running this block on refresh
            navigate(`/customer/card/${cardIdToFetch}`, { replace: true });
        }


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
        .eq('id', cardIdToFetch)
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
  }, [loyaltyCardId, user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading) {
      fetchCardData();
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [authLoading, fetchCardData]);

  useEffect(() => {
    if (!cardData?.customer?.id || !cardData.id) return;
    
    const channel = supabase.channel(`customer-card-${cardData.customer.id}`);

    const handleStampUpdate = (payload) => {
        if(payload.new.id === cardData.id) {
            setCardData(prev => ({ ...prev, stamps: payload.new.stamps }));
            fetchCardData();
        }
    };

    channel
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'loyalty_cards', filter: `id=eq.${cardData.id}`}, handleStampUpdate)
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardData, fetchCardData]);

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
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
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
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center p-4">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h2>
            <p className="text-gray-300 mb-6 max-w-md">No Loyalty Card Found. Please sign up using a valid QR code from a store.</p>
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </div>
    );
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