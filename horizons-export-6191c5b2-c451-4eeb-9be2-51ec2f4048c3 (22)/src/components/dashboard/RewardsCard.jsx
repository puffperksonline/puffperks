
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Trash2, Gift, Edit, Save, ToggleLeft, ToggleRight } from 'lucide-react';

const RewardForm = ({ storeId, onSave, editingReward, setEditingReward }) => {
  const [description, setDescription] = useState('');
  const [stampsRequired, setStampsRequired] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingReward) {
      setDescription(editingReward.description);
      setStampsRequired(editingReward.stamps_required);
    } else {
      setDescription('');
      setStampsRequired(10);
    }
  }, [editingReward]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || stampsRequired <= 0) {
      toast({ title: 'Invalid reward details', description: 'Please provide a description and a valid stamp count.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    const rewardData = { description, stamps_required: stampsRequired, store_id: storeId, is_active: editingReward ? editingReward.is_active : true };
    
    let error;
    if (editingReward) {
      ({ error } = await supabase.from('rewards').update(rewardData).eq('id', editingReward.id));
    } else {
      ({ error } = await supabase.from('rewards').insert(rewardData));
    }

    if (error) {
      toast({ title: 'Error saving reward', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Reward ${editingReward ? 'updated' : 'added'}!` });
      onSave();
      setEditingReward(null);
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-dashed border-gray-700 rounded-lg mb-6">
      <h3 className="text-lg font-semibold">{editingReward ? 'Edit Reward' : 'Add New Reward'}</h3>
      <div className="space-y-2">
        <Label htmlFor="rewardDescription">Reward Description</Label>
        <Input id="rewardDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Free 10ml E-Liquid" required className="bg-gray-800/50 border-gray-600" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stampsRequired">Stamps Required</Label>
        <Input id="stampsRequired" type="number" value={stampsRequired} onChange={(e) => setStampsRequired(parseInt(e.target.value, 10))} required min="1" className="bg-gray-800/50 border-gray-600" />
      </div>
      <div className="flex justify-end space-x-2">
        {editingReward && <Button type="button" variant="ghost" onClick={() => setEditingReward(null)}>Cancel</Button>}
        <Button type="submit" disabled={isSaving}>
            {editingReward ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isSaving ? 'Saving...' : (editingReward ? 'Save Changes' : 'Add Reward')}
        </Button>
      </div>
    </form>
  );
};

export const RewardsCard = ({ storeId, rewards, onUpdate }) => {
  const [editingReward, setEditingReward] = useState(null);
  const { toast } = useToast();

  const handleToggleActive = async (reward) => {
    const { error } = await supabase
      .from('rewards')
      .update({ is_active: !reward.is_active })
      .eq('id', reward.id);
    
    if (error) {
      toast({ title: 'Error updating reward status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reward status updated!' });
      onUpdate();
    }
  };

  const handleDelete = async (rewardId) => {
    const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
    if (error) {
      toast({ title: 'Error deleting reward', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reward deleted' });
      onUpdate();
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-medium text-white flex items-center mb-4">
        <Gift className="w-5 h-5 mr-2" />
        Manage Rewards
      </h3>
      <RewardForm storeId={storeId} onSave={onUpdate} editingReward={editingReward} setEditingReward={setEditingReward} />
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="space-y-3">
          {rewards?.length > 0 ? (
            rewards.map(reward => (
              <div key={reward.id} className={`flex items-center justify-between p-3 bg-gray-800/50 rounded-lg ${!reward.is_active && 'opacity-50'}`}>
                <div>
                  <p className="text-white font-medium">{reward.description}</p>
                  <p className="text-sm text-gray-400">{reward.stamps_required} stamps</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button onClick={() => handleToggleActive(reward)} variant="ghost" size="icon" className="h-8 w-8 hover:text-green-400">
                    {reward.is_active ? <ToggleRight className="h-5 w-5"/> : <ToggleLeft className="h-5 w-5" />}
                  </Button>
                  <Button onClick={() => setEditingReward(reward)} variant="ghost" size="icon" className="h-8 w-8" disabled={!reward.is_active}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(reward.id)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">No rewards created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
