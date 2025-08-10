
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
import { Plus, Trash2, Edit, Gift } from 'lucide-react';

const RewardManager = ({ storeId, initialRewards, onUpdate }) => {
  const { toast } = useToast();
  const [rewards, setRewards] = useState(initialRewards);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRewards = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('rewards')
      .select('*')
      .eq('store_id', storeId)
      .order('stamps_required');
    
    if (fetchError) {
      setError('Could not load rewards. Please refresh the page.');
      console.error(fetchError);
    } else {
      setRewards(data);
      onUpdate(data);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    setRewards(initialRewards);
    setIsLoading(false);
  }, [initialRewards]);

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
      setIsSaving(true);
      
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
          await fetchRewards();
          setIsModalOpen(false);
      }
      setIsSaving(false);
  };
  
  const handleDeleteReward = async (rewardId) => {
    const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
    if(error){
      toast({ title: 'Error deleting reward', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reward deleted!' });
      await fetchRewards();
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
      await fetchRewards();
    }
  };

  if (isLoading) return <div className="glass-effect rounded-xl p-6 text-center">Loading rewards...</div>;
  if (error) return <div className="glass-effect rounded-xl p-6 text-center text-red-500">{error}</div>;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center"><Gift className="mr-2"/>Reward Tiers</h3>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Reward
          </Button>
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
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Reward'}</Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RewardManager;
