
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Clock, UserPlus, Zap, Sparkles, Undo2, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import CustomerDetailsModal from '@/pages/CustomerDirectory';
import ManualStampModal from '@/components/dashboard/ManualStampModal';

export const LiveCustomerPanel = ({ selectedLocation, onCustomerUpdate }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeCustomers, setActiveCustomers] = useState({});
  const [actionState, setActionState] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  const handlePresenceStateChange = (newPresenceState) => {
    const newActiveCustomers = {};
    for (const id in newPresenceState) {
        const presences = newPresenceState[id];
        const customerPresence = presences.find(p => p.user_id !== user.id && p.loyalty_card_id);
        if(customerPresence) {
            newActiveCustomers[customerPresence.user_id] = customerPresence;
        }
    }
    setActiveCustomers(newActiveCustomers);
  };

  useEffect(() => {
    if (!selectedLocation?.store_id || !user) return;

    const channel = supabase.channel(`store-dashboard-${selectedLocation.store_id}`, {
      config: { presence: { key: user.id } },
    });

    const handleStampUpdate = (payload) => {
      const updatedCard = payload.new;
      setActiveCustomers(prev => {
        const customerKey = Object.keys(prev).find(key => prev[key].loyalty_card_id === updatedCard.id);
        if (customerKey) {
          return { ...prev, [customerKey]: { ...prev[customerKey], stamps: updatedCard.stamps } };
        }
        return prev;
      });
      onCustomerUpdate();
    };

    channel
      .on('presence', { event: 'sync' }, () => handlePresenceStateChange(channel.presenceState()))
      .on('presence', { event: 'join' }, () => handlePresenceStateChange(channel.presenceState()))
      .on('presence', { event: 'leave' }, () => handlePresenceStateChange(channel.presenceState()))
      .on('broadcast', { event: 'stamp_update' }, ({payload}) => handleStampUpdate(payload))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, is_owner: true });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [selectedLocation?.store_id, user, onCustomerUpdate]);

  const handleAction = async (actionType, customer, undo = false) => {
    const { loyalty_card_id, name, user_id } = customer;
    if (!loyalty_card_id) {
      toast({ title: "Error", description: "Loyalty Card ID is missing.", variant: "destructive" });
      return;
    }

    setActionState(prev => ({ ...prev, [user_id]: { status: 'loading' } }));

    const { data, error } = await supabase.functions.invoke('add-stamp-manually', {
        body: { loyalty_card_id, storeId: selectedLocation.store_id, undo },
    });

    if (error || data.error) {
        toast({ title: "Error", description: data.error || error.message, variant: "destructive" });
        setActionState(prev => ({ ...prev, [user_id]: null }));
    } else {
        toast({ title: undo ? "Action Undone!" : "Stamp Added! ⭐", description: `Action for ${name} was successful.` });
        if (!undo) {
            setActionState(prev => ({ ...prev, [user_id]: { status: 'undo', timeoutId: setTimeout(() => setActionState(p => ({...p, [user_id]: null})), 3000) } }));
        } else {
            setActionState(prev => ({ ...prev, [user_id]: null }));
        }
    }
  };

  const handleUndo = (customer) => {
    const state = actionState[customer.user_id];
    if (state && state.timeoutId) {
        clearTimeout(state.timeoutId);
    }
    handleAction('addStamp', customer, true);
  };

  const customers = Object.values(activeCustomers);

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.4 }} 
      className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-purple-900/20 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-green-400 animate-pulse" />
          Live Sessions
        </h3>
        <div className="w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
      </div>
      
      <div className="flex-grow min-h-[16rem] max-h-[16rem] overflow-y-auto pr-2 -mr-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50">
        <AnimatePresence>
          {customers.length === 0 ? (
            <motion.div key="no-customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8 flex flex-col items-center justify-center h-full">
              <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No active customers</p>
              <p className="text-sm text-gray-500 mt-1">Customers viewing their card will appear here.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {customers.map(customer => (
                <motion.div key={customer.user_id} layout initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="cursor-pointer flex-grow" onClick={() => setSelectedCustomer(customer)}>
                    <div className="text-white font-medium">{customer.name || 'Customer'}</div>
                    <div className="text-sm text-gray-400 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1.5 text-yellow-400" />
                      {customer.stamps} / {customer.max_stamps} stamps
                    </div>
                  </div>
                  {actionState[customer.user_id]?.status === 'undo' ? (
                    <Button onClick={() => handleUndo(customer)} size="sm" variant="secondary" className="px-4 py-3">
                        <Undo2 className="w-4 h-4 mr-2" /> Undo
                    </Button>
                  ) : (
                    <Button onClick={() => handleAction('addStamp', customer)} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3" disabled={actionState[customer.user_id]?.status === 'loading'}>
                      {actionState[customer.user_id]?.status === 'loading' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Zap className="w-4 h-4" />}
                      <span className="ml-2">Add Stamp</span>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
       <div className="mt-4 pt-4 border-t border-gray-700/50 text-center">
        <button onClick={() => setIsManualAddOpen(true)} className="text-xs text-gray-400 hover:text-purple-400 transition-colors flex items-center justify-center w-full">
          <HelpCircle className="w-3 h-3 mr-2" />
          Having trouble adding stamps?
        </button>
      </div>
    </motion.div>
    {selectedLocation && (
        <CustomerDetailsModal
            customer={{...selectedCustomer, id: selectedCustomer?.user_id}}
            storeId={selectedLocation.store_id}
            isOpen={!!selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onUpdate={onCustomerUpdate}
        />
    )}
    <ManualStampModal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        storeId={selectedLocation.store_id}
        onUpdate={onCustomerUpdate}
    />
    </>
  );
};
