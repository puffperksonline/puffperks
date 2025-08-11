import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit } from 'lucide-react';

export const RewardsCard = ({ rewards, storeId, onUpdate, storeData, setStoreData }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReferralEnabled, setIsReferralEnabled] = useState(storeData?.referral_enabled ?? false);
  const [isUpdatingReferral, setIsUpdatingReferral] = useState(false);

  useEffect(() => {
    if (storeData) {
      setIsReferralEnabled(storeData.referral_enabled);
    }
  }, [storeData]);

  const openAddModal = () => {
    setEditingReward(null);
    setIsModalOpen(true);
  };

  const openEditModal = (reward) => {
    setEditingReward(reward);
    setIsModalOpen(true);
  };
  
  const handleSaveReward = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      
      const formData = new FormData(e.target);
      const rewardData = {
          stamps_required: parseInt(formData.get('stamps_required')),
          description: formData.get('description'),
          is_active: formData.get('is_active') === 'on',
          store_id: storeId,
      };

      let error;
      if (editingReward) {
          ({ error } = await supabase.from('rewards').update(rewardData).eq('id', editingReward.id));
      } else {
          ({ error } = await supabase.from('rewards').insert(rewardData));
      }

      if (error) {
          toast({ title: 'Error saving reward', description: error.message, variant: 'destructive' });
      } else {
          toast({ title: `Reward ${editingReward ? 'updated' : 'added'}!`, description: 'Your rewards list has been updated.' });
          const { data: updatedRewards } = await supabase.from('rewards').select('*').eq('store_id', storeId).order('stamps_required');
          onUpdate(updatedRewards || []);
          setIsModalOpen(false);
      }
      setIsLoading(false);
  };
  
  const handleDeleteReward = async (rewardId) => {
    const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
    if(error){
      toast({ title: 'Error deleting reward', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reward deleted!' });
      onUpdate(rewards.filter(r => r.id !== rewardId));
    }
  };

  const handleToggleActive = async (reward) => {
    const { error } = await supabase
      .from('rewards')
      .update({ is_active: !reward.is_active })
      .eq('id', reward.id);

    if (error) {
      toast({ title: 'Error updating reward', description: error.message, variant: 'destructive' });
    } else {
      onUpdate(rewards.map(r => r.id === reward.id ? { ...r, is_active: !r.is_active } : r));
    }
  };

  const handleReferralToggle = async (checked) => {
    setIsUpdatingReferral(true);
    setIsReferralEnabled(checked); // Optimistically update UI
    const { data, error } = await supabase
      .from('stores')
      .update({ referral_enabled: checked })
      .eq('id', storeId)
      .select()
      .single();
    
    if (error) {
      toast({ title: "Error updating setting", description: "Could not update referral setting. Please try again.", variant: "destructive" });
      // Revert UI on error
      setIsReferralEnabled(!checked);
    } else {
      toast({ title: `Referral Program ${checked ? 'Enabled' : 'Disabled'}` });
      if(setStoreData) {
        setStoreData(data);
      }
    }
    setIsUpdatingReferral(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Reward Tiers & Referrals</h3>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Reward
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
            <Label htmlFor="referral-switch" className="text-white cursor-pointer">Referral Scheme</Label>
            <Switch
              id="referral-switch"
              checked={isReferralEnabled}
              onCheckedChange={handleReferralToggle}
              disabled={isUpdatingReferral}
            />
          </div>

          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className={`flex items-center justify-between p-3 bg-gray-800/50 rounded-lg ${!reward.is_active ? 'opacity-50' : ''}`}>
                <div>
                  <span className="text-purple-400 font-medium">{reward.stamps_required} stamps</span>
                  <span className="text-white ml-2">→ {reward.description}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                      checked={reward.is_active}
                      onCheckedChange={() => handleToggleActive(reward)}
                  />
                  <Button onClick={() => openEditModal(reward)} variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDeleteReward(reward.id)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {rewards.length === 0 && <p className="text-gray-400 text-center py-4">No rewards yet. Add one to get started!</p>}
          </div>
        </div>
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-effect">
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveReward} className="space-y-4">
              <div>
                  <Label htmlFor="stamps_required" className="text-white">Stamps Required</Label>
                  <Input 
                      id="stamps_required" 
                      name="stamps_required"
                      type="number" 
                      defaultValue={editingReward?.stamps_required || ''} 
                      required 
                      className="bg-gray-800/50 border-gray-600 mt-1"
                  />
              </div>
              <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Input 
                      id="description" 
                      name="description"
                      type="text" 
                      defaultValue={editingReward?.description || ''} 
                      required 
                      className="bg-gray-800/50 border-gray-600 mt-1"
                  />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  name="is_active"
                  defaultChecked={editingReward ? editingReward.is_active : true}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Reward'}</Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};