
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';

const ReferralToggle = ({ initialIsEnabled, storeId }) => {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked) => {
    setIsUpdating(true);
    setIsEnabled(checked);

    const { error } = await supabase
      .from('stores')
      .update({ referral_enabled: checked })
      .eq('id', storeId);

    if (error) {
      toast({
        title: "Error updating setting",
        description: "Could not update referral setting. Please try again.",
        variant: "destructive"
      });
      setIsEnabled(!checked);
    } else {
      toast({ title: `Referral Program ${checked ? 'Enabled' : 'Disabled'}` });
    }
    setIsUpdating(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="referral-switch" className="text-lg font-medium text-white cursor-pointer">
          Referral Scheme
        </Label>
        <Switch
          id="referral-switch"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
        />
      </div>
       <p className="text-sm text-gray-400 mt-2">
        Enable this to award a bonus stamp to both the referrer and the new customer on their first stamp.
      </p>
    </motion.div>
  );
};

export default ReferralToggle;
