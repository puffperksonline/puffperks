import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Gift, Trash2, PlusCircle, ToggleLeft, ToggleRight, Info, Star } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const RewardsCard = ({ rewards, storeId, onUpdate, storeData, setStoreData }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReward, setNewReward] = useState({ stamps_required: '', description: '' });
  const [isReferralLoading, setIsReferralLoading] = useState(false);

  const handleAddReward = async () => {
    if (!newReward.stamps_required || !newReward.description) {
      toast({ title: 'Missing Information', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    
    const { data, error } = await supabase
      .from('rewards')
      .insert({
        store_id: storeId,
        stamps_required: parseInt(newReward.stamps_required, 10),
        description: newReward.description,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error Adding Reward', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reward Added!', description: 'Your new reward is now live.' });
      onUpdate([...rewards, data]);
      setIsModalOpen(false);
      setNewReward({ stamps_required: '', description: '' });
    }
  };
  
  const handleDeleteReward = async (rewardId) => {
    const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
    if (error) {
      toast({ title: 'Error Deleting Reward', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reward Removed', description: 'The reward has been deleted.' });
      onUpdate(rewards.filter(r => r.id !== rewardId));
    }
  };
  
  const handleReferralToggle = async (checked) => {
    setIsReferralLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .update({ referral_enabled: checked })
      .eq('id', storeId)
      .select()
      .single();
      
    if (error) {
      toast({ title: 'Error Updating Setting', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: `Referrals ${checked ? 'Enabled' : 'Disabled'}`,
        description: `Customers ${checked ? 'can now refer friends for bonus stamps.' : 'can no longer refer friends.'}`
      });
      setStoreData(data);
    }
    setIsReferralLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3 }}
      className="glass-effect p-6 rounded-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Gift className="w-5 h-5 mr-2 text-pink-400" />
          Reward Tiers & Referrals
        </h3>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Add Reward
        </Button>
      </div>
      
      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {rewards.length > 0 ? (
            rewards.map((reward) => (
              <motion.div
                key={reward.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="bg-purple-600/20 text-purple-300 rounded-md h-8 w-8 flex items-center justify-center font-bold mr-3">{reward.stamps_required}</div>
                  <span className="text-white">{reward.description}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReward(reward.id)}>
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </Button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p>No rewards set up yet. Add one to get started!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-gray-700/50 pt-4">
        <div className="flex items-center justify-between p-3 rounded-lg">
          <div className="flex items-center">
            {storeData?.referral_enabled ? 
              <ToggleRight className="w-5 h-5 mr-3 text-green-400" /> :
              <ToggleLeft className="w-5 h-5 mr-3 text-gray-500" />
            }
            <Label htmlFor="referral-switch" className="text-white text-md">
              Referral Scheme
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gray-800 text-white border-gray-700">
                  <p>When enabled, a new customer who signs up via another customer's referral link will get a bonus stamp on their first visit. The referrer also gets a bonus stamp!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="referral-switch"
            checked={storeData?.referral_enabled || false}
            onCheckedChange={handleReferralToggle}
            disabled={isReferralLoading}
          />
        </div>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Create a New Reward</DialogTitle>
            <DialogDescription>
              Set how many stamps a customer needs to earn this prize.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stamps_required" className="text-right">
                Stamps
              </Label>
              <Input
                id="stamps_required"
                type="number"
                value={newReward.stamps_required}
                onChange={(e) => setNewReward({ ...newReward, stamps_required: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-600"
                placeholder="e.g., Free 30ml E-Liquid"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddReward}>Add Reward</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};