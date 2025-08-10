
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

const Stamp = ({ isFilled, stampColor, textColor, isAnimating, delay }) => {
  const stampVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20, delay }
    }
  };

  const flyingStampVariants = {
    initial: { opacity: 0, y: -100, x: 50, scale: 1.5, rotate: 45 },
    animate: { 
      opacity: 1, 
      y: 0, 
      x: 0, 
      scale: 1, 
      rotate: 0,
      transition: { duration: 0.5, ease: 'easeOut', delay: 0.1 }
    }
  };

  return (
    <div 
      className="aspect-square rounded-full flex items-center justify-center border-2"
      style={{ 
        backgroundColor: isFilled ? stampColor : 'rgba(255, 255, 255, 0.05)',
        borderColor: isFilled ? stampColor : 'rgba(255, 255, 255, 0.2)',
      }}
    >
      {isFilled && (
        <motion.div
          variants={isAnimating ? flyingStampVariants : stampVariants}
          initial="initial"
          animate="animate"
          className="w-full h-full flex items-center justify-center"
        >
          <Sparkles className="w-1/2 h-1/2" style={{ color: textColor }} />
        </motion.div>
      )}
    </div>
  );
};

export const LoyaltyCard = ({ cardData, locationData, customerData, rewards, isAnimating }) => {
  const cardStyle = {
    background: `linear-gradient(135deg, ${locationData.card_bg_color || '#1c1c22'} 0%, ${locationData.card_stamp_color || '#8b5cf6'} 200%)`,
    color: locationData.card_text_color || '#ffffff',
    boxShadow: `0 0 30px -5px ${locationData.card_stamp_color || '#8b5cf6'}55`
  };

  const currentRewards = Array.isArray(rewards) ? rewards : [];
  const sortedRewards = currentRewards.filter(r => r.is_active).sort((a, b) => a.stamps_required - b.stamps_required);
  const nextReward = sortedRewards.find(r => r.stamps_required > cardData.stamps);
  
  const stampsForNextReward = nextReward 
    ? nextReward.stamps_required 
    : (sortedRewards.length > 0 ? sortedRewards[sortedRewards.length - 1].stamps_required : 10);
    
  const totalStampsToShow = sortedRewards.length > 0 
    ? Math.max(...sortedRewards.map(r => r.stamps_required)) 
    : 10;
  
  const progress = (cardData.stamps / stampsForNextReward) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.5 }} 
      className="rounded-2xl p-6 flex flex-col relative" 
      style={cardStyle}
    >
      {locationData.logo_url && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-900">
            <img src={locationData.logo_url} alt="Store Logo" className="w-full h-full object-cover rounded-full" crossOrigin="anonymous" />
        </div>
      )}
      
      <div className={`flex justify-between items-start ${locationData.logo_url ? 'mt-12' : ''} mb-6`}>
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-1">Welcome, {customerData.full_name.split(' ')[0]}!</h2>
          <div className="flex items-center space-x-2 opacity-80 text-sm">
            <Trophy className="w-4 h-4" />
            <span>Member since {new Date(cardData.created_at).toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {Array.from({ length: totalStampsToShow }, (_, index) => (
          <Stamp
            key={index}
            isFilled={index < cardData.stamps}
            stampColor={locationData.card_stamp_color || '#8b5cf6'}
            textColor={locationData.card_text_color || '#ffffff'}
            isAnimating={isAnimating && index === cardData.stamps - 1}
            delay={index * 0.05}
          />
        ))}
      </div>

      <div className="mt-auto">
        <div className="flex justify-between text-sm opacity-80 mb-2">
          <span>{cardData.stamps} stamps</span>
          {nextReward ? (
            <span>{nextReward.stamps_required - cardData.stamps} to next reward</span>
          ) : (
             sortedRewards.length > 0 && cardData.stamps >= totalStampsToShow ? <span>All rewards unlocked!</span> : <span></span>
          )}
        </div>
        <div className="w-full bg-black/20 rounded-full h-2.5">
          <motion.div 
            className="h-2.5 rounded-full" 
            style={{ backgroundColor: locationData.card_text_color || '#ffffff' }} 
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
          />
        </div>
      </div>
    </motion.div>
  );
};
