
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

export const TrialCard = ({ trialEndsAt }) => {
  const { user } = useAuth();
  const upgradeUrl = `https://buy.stripe.com/6oUfZgdOF64K7UQ9XT5kk01?prefilled_email=${encodeURIComponent(user?.email || '')}`;
  const [timeLeft, setTimeLeft] = useState('');
  const [useCountdown, setUseCountdown] = useState(false);

  useEffect(() => {
    if (!trialEndsAt) return;

    const intervalId = setInterval(() => {
      const trialEndDate = new Date(trialEndsAt);
      const now = new Date();
      const difference = trialEndDate - now;

      if (difference <= 0) {
        setTimeLeft("0 days");
        setUseCountdown(false);
        clearInterval(intervalId);
        return;
      }
      
      const oneDayInMs = 1000 * 60 * 60 * 24;

      if (difference < oneDayInMs) {
        setUseCountdown(true);
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setUseCountdown(false);
        const days = Math.ceil(difference / oneDayInMs);
        setTimeLeft(`${days} day${days !== 1 ? 's' : ''} remaining`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [trialEndsAt]);

  if (!trialEndsAt) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-effect rounded-xl p-6 border border-purple-500/30">
      <h3 className="text-lg font-medium text-white mb-2">Free Trial</h3>
      <div className="text-center mb-4">
        {useCountdown ? (
            <p className="text-2xl font-bold text-red-400 animate-pulse">{timeLeft}</p>
        ) : (
            <p className="text-lg text-gray-300">{timeLeft}</p>
        )}
      </div>
      <a href={upgradeUrl} target="_blank" rel="noopener noreferrer" className="w-full">
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          Upgrade to Pro
        </Button>
      </a>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Ready to upgrade early? Upgrade now, and extend your trial to 14 days!
      </p>
    </motion.div>
  );
};
