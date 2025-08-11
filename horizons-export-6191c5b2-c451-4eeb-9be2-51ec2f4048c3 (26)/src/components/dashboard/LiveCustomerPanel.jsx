import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Users, Zap, Search, X, RefreshCw, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const RedeemRewardDialog = ({ customer, rewards, onRedeem }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleRedeem = async (reward) => {
        setIsRedeeming(true);
        await onRedeem(reward);
        setIsRedeeming(false);
        setIsOpen(false);
    };

    const availableRewards = rewards.filter(r => r.is_active && customer.stamps >= r.stamps_required);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuItem onSelect={e => e.preventDefault()} onClick={() => setIsOpen(true)} disabled={availableRewards.length === 0}>
                Redeem Reward
            </DropdownMenuItem>
            <DialogContent className="glass-effect">
                <DialogHeader>
                    <DialogTitle>Redeem Reward for {customer.full_name}</DialogTitle>
                    <DialogDescription>
                        They have {customer.stamps} stamps. Choose a reward to redeem.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    {availableRewards.length > 0 ? (
                        availableRewards.map(reward => (
                            <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-white">{reward.description}</p>
                                    <p className="text-sm text-gray-400">{reward.stamps_required} stamps</p>
                                </div>
                                <Button onClick={() => handleRedeem(reward)} disabled={isRedeeming}>
                                    {isRedeeming ? 'Redeeming...' : 'Redeem'}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400">Not enough stamps for any rewards.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const LiveCustomerPanel = ({ store, rewards }) => {
    const { toast } = useToast();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [addingStampFor, setAddingStampFor] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const fetchCustomers = useCallback(async (isSilent = false) => {
        if (!selectedLocation?.id) return;
        if (!isSilent) setLoading(true);

        const { data, error } = await supabase
            .from('loyalty_cards')
            .select('id, stamps, max_stamps, customers:customers!inner(id, full_name)')
            .eq('location_id', selectedLocation.id)
            .order('full_name', { foreignTable: 'customers' });

        if (error) {
            if (!isSilent) toast({ title: "Error fetching customers", description: error.message, variant: "destructive" });
            setCustomers([]);
        } else {
            const formattedCustomers = data.filter(c => c.customers).map(c => ({
                ...c,
                full_name: c.customers.full_name,
                customer_id: c.customers.id,
            }));
            setCustomers(formattedCustomers);
        }
        if (!isSilent) setLoading(false);
    }, [selectedLocation?.id, toast]);

    useEffect(() => {
        if (store?.locations && store.locations.length > 0) {
            setSelectedLocation(store.locations[0]);
        }
    }, [store]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleAddStamp = async (loyaltyCardId, customerName) => {
        setAddingStampFor(loyaltyCardId);
        const { data, error } = await supabase.functions.invoke('add-stamp-manually', {
            body: { loyalty_card_id: loyaltyCardId, storeId: store.id, locationId: selectedLocation.id }
        });
        if (error || data.error) {
            toast({ title: "Error Adding Stamp", description: data?.error || error?.message, variant: "destructive" });
        } else {
            toast({ title: "Stamp Added! ⭐", description: `Added stamp for ${customerName}.` });
            fetchCustomers(true);
        }
        setAddingStampFor(null);
    };
    
    const handleRedeemReward = async (customer, reward) => {
        const { data, error } = await supabase.functions.invoke('redeem-reward', {
            body: { loyalty_card_id: customer.id, reward_id: reward.id }
        });
        if (error || data?.error) {
            toast({ title: "Redemption Error", description: data?.error || error.message, variant: "destructive" });
        } else {
            toast({ title: "Reward Redeemed! 🎉", description: `Redeemed '${reward.description}' for ${customer.full_name}.` });
            fetchCustomers(true);
        }
    };

    const filteredCustomers = useMemo(() => {
        if (!customers) return [];
        return customers.filter(customer => customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [customers, searchTerm]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-effect rounded-xl p-6 h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-lg font-medium text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Live Customer Session
                </h3>
                <div className="flex items-center gap-2">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">{selectedLocation?.name || 'Select Location'}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-effect">
                            {store?.locations?.map(loc => (
                                <DropdownMenuItem key={loc.id} onSelect={() => setSelectedLocation(loc)}>
                                    {loc.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="sm" onClick={() => fetchCustomers()} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input type="text" placeholder="Search customers..." className="pl-9 bg-gray-800/50 border-gray-600 focus:border-purple-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {searchTerm && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer" onClick={() => setSearchTerm('')} />}
            </div>

            <div className="flex-grow overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <AnimatePresence>
                    {loading ? (
                        <motion.div key="loading" className="text-center py-8 text-gray-400">Loading customers...</motion.div>
                    ) : filteredCustomers.length === 0 ? (
                        <motion.div key="no-customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-400">{searchTerm ? 'No customers match your search.' : `No customers at ${selectedLocation?.name || 'this location'} yet.`}</p>
                            <p className="text-sm text-gray-500 mt-1">New customers will appear here.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCustomers.map(customer => (
                                <motion.div key={customer.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                    <div>
                                        <div className="text-white font-medium">{customer.full_name}</div>
                                        <div className="text-sm text-gray-400">{customer.stamps} / {customer.max_stamps} stamps</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                                    <Zap className="w-4 h-4 mr-1" /> Action
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="glass-effect">
                                                <DropdownMenuItem onClick={() => handleAddStamp(customer.id, customer.full_name)} disabled={addingStampFor === customer.id}>
                                                    {addingStampFor === customer.id ? 'Adding...' : 'Add Stamp'}
                                                </DropdownMenuItem>
                                                <RedeemRewardDialog customer={customer} rewards={rewards} onRedeem={(reward) => handleRedeemReward(customer, reward)} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};