import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const RewardList = ({ rewards, currentStamps, isRedeeming, onRedeem }) => {
  const activeRewards = rewards.filter(r => r.is_active);

  if (activeRewards.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3 }} 
      className="glass-effect rounded-xl p-6 mb-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Gift className="w-5 h-5 mr-2 text-yellow-400" />
        Available Rewards
      </h3>
      <div className="space-y-3">
        {activeRewards.map((reward) => {
          const canRedeem = currentStamps >= reward.stamps_required;
          return (
            <div key={reward.id} className={`p-4 rounded-lg border ${canRedeem ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-800/50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{reward.description}</div>
                  <div className="text-sm text-gray-400">{reward.stamps_required} stamps required</div>
                </div>
                <Button 
                  onClick={() => onRedeem(reward)} 
                  disabled={isRedeeming !== null || !canRedeem} 
                  size="sm" 
                  className={canRedeem ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}
                >
                  {isRedeeming === reward.id ? 'Redeeming...' : (canRedeem ? (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Redeem
                    </>
                  ) : 'Locked')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};