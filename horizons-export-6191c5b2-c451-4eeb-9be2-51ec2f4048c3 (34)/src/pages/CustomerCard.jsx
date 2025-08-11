import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
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

const CustomerCard = () => {
  const { loyaltyCardId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unclaimedRewards, setUnclaimedRewards] = useState([]);
  const [stampHistory, setStampHistory] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [showReferralButton, setShowReferralButton] = useState(false);

  const fetchCardData = useCallback(async () => {
    if (!user || !loyaltyCardId) return;

    setLoading(true);

    try {
      const { data, error: cardError } = await supabase
        .from('loyalty_cards')
        .select(`
          id,
          stamps,
          max_stamps,
          customer:customers!inner(id, full_name, user_id, referral_code),
          location:locations!inner(id, name, card_bg_color, card_text_color, card_stamp_color, logo_url, store:stores!inner(id, store_name, referral_enabled))
        `)
        .eq('id', loyaltyCardId)
        .eq('customer.user_id', user.id)
        .single();
        
      if (cardError) throw cardError;
      if (!data) throw new Error("Card not found or you do not have permission to view it.");

      setCardData(data);
      const textColor = getTextColor(data.location.card_bg_color);
      document.documentElement.style.setProperty('--card-dynamic-text-color', textColor);
      document.documentElement.style.setProperty('--card-dynamic-bg-color', data.location.card_bg_color);
      document.body.style.backgroundColor = data.location.card_bg_color;

      const { data: storeSettings, error: storeError } = await supabase
        .from('stores')
        .select('referral_enabled')
        .eq('id', data.location.store.id)
        .maybeSingle();

      if (storeError) {
        console.error("Error fetching store settings:", storeError);
        setShowReferralButton(false);
      } else {
        setShowReferralButton(storeSettings?.referral_enabled === true);
      }

      const [rewardsResult, historyResult] = await Promise.all([
        supabase.rpc('get_unclaimed_rewards', { p_customer_id: data.customer.id }),
        supabase.rpc('get_customer_stamp_history', { p_customer_id: data.customer.id })
      ]);

      if (rewardsResult.error) console.error("Error fetching rewards:", rewardsResult.error);
      else setUnclaimedRewards(rewardsResult.data || []);

      if (historyResult.error) console.error("Error fetching history:", historyResult.error);
      else setStampHistory(historyResult.data || []);

    } catch (e) {
      console.error(e);
      setError(e.message);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [loyaltyCardId, user, toast]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Your Loyalty Card...
        </div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/store/dashboard" />;
  }
  
  if (!cardData) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{cardData.location.store.store_name} - Loyalty Card</title>
        <meta name="description" content={`Your digital loyalty card for ${cardData.location.store.store_name}.`} />
      </Helmet>

      <div className="min-h-screen w-full font-sans transition-colors duration-500" style={{ backgroundColor: cardData.location.card_bg_color }}>
        <div className="container mx-auto max-w-md p-4 relative text-[var(--card-dynamic-text-color)]">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LoyaltyCard cardData={cardData} />
              
              <ActionButtons 
                onSettingsClick={() => setIsSettingsOpen(true)} 
                onReferralClick={() => setIsReferralOpen(true)}
                showReferralButton={showReferralButton}
              />
              
              <RewardList
                unclaimedRewards={unclaimedRewards}
                stampHistory={stampHistory}
                cardData={cardData}
                onRedeem={fetchCardData}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
      />

      {cardData.customer.referral_code &&
        <ReferralDialog
          isOpen={isReferralOpen}
          onClose={() => setIsReferralOpen(false)}
          referralCode={cardData.customer.referral_code}
          storeName={cardData.location.store.store_name}
        />
      }
    </>
  );
};

export default CustomerCard;