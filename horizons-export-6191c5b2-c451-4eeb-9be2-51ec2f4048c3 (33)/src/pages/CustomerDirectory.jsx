import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  Search,
  Save,
  MessageSquare,
  Clock,
  Trash2,
  Zap,
  Gift,
  Star,
  Award,
  Undo2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';

const CustomerDetailsModal = ({ customer, storeId, isOpen, onClose, onUpdate }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [stampHistory, setStampHistory] = useState([]);
    const [unclaimedRewards, setUnclaimedRewards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [actionState, setActionState] = useState({});
    const { toast } = useToast();

    const fetchDetails = useCallback(async () => {
      if (!customer?.id || !storeId) return;
      setIsLoading(true);
      
      const [notesRes, historyRes, unclaimedRes, cardsRes] = await Promise.all([
        supabase.from('customer_notes').select('*').eq('customer_id', customer.id).eq('store_id', storeId).order('created_at', { ascending: false }),
        supabase.rpc('get_customer_stamp_history', { p_customer_id: customer.id }),
        supabase.rpc('get_unclaimed_rewards', { p_customer_id: customer.id }),
        supabase.from('loyalty_cards').select('id').eq('customer_id', customer.id).limit(1).single(),
      ]);
      
      setNotes(notesRes.data || []);
      setStampHistory(historyRes.data || []);
      setUnclaimedRewards(unclaimedRes.data || []);
      
      if(customer && !customer.loyalty_card_id && cardsRes.data) {
        customer.loyalty_card_id = cardsRes.data.id;
      }

      setIsLoading(false);
    }, [customer, storeId]);

    useEffect(() => {
        if (isOpen) {
            fetchDetails();
        }
    }, [isOpen, fetchDetails]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (newNote.trim() === '') return;
        setIsAddingNote(true);
        const { data, error } = await supabase.from('customer_notes').insert({ customer_id: customer.id, store_id: storeId, note: newNote.trim() }).select().single();
        if (error) { toast({ title: 'Error adding note', variant: 'destructive' }); } 
        else { setNotes([data, ...notes]); setNewNote(''); }
        setIsAddingNote(false);
    };

    const handleDeleteNote = async (noteId) => {
        const originalNotes = [...notes];
        setNotes(notes.filter(n => n.id !== noteId));
        const { error } = await supabase.from('customer_notes').delete().eq('id', noteId);
        if (error) { setNotes(originalNotes); toast({ title: "Error deleting note", variant: "destructive" }); }
    };

    const handleAction = async (actionType, payload, undo = false) => {
        if (!customer.loyalty_card_id) {
          toast({ title: 'Error', description: 'Customer loyalty card not found.', variant: 'destructive' });
          return;
        }

        const actionId = actionType === 'stamp' ? 'addStamp' : payload.reward_id;
        setActionState(prev => ({ ...prev, [actionId]: { status: 'loading' } }));

        const functionName = actionType === 'stamp' ? 'add-stamp-manually' : 'redeem-reward';
        const body = actionType === 'stamp' 
            ? { loyalty_card_id: customer.loyalty_card_id, storeId, undo }
            : { loyalty_card_id: customer.loyalty_card_id, reward_id: payload.reward_id, undo };

        const { data, error } = await supabase.functions.invoke(functionName, { body });

        if (error || data.error) {
            toast({ title: "Error", description: data?.error || error.message, variant: "destructive" });
            setActionState(prev => ({ ...prev, [actionId]: null }));
        } else {
            toast({ title: undo ? "Action Undone!" : "Success!", description: `Action for ${customer.full_name} was successful.` });
            onUpdate();
            fetchDetails();
            if (!undo) {
                const timeoutId = setTimeout(() => setActionState(p => ({...p, [actionId]: null})), 3000);
                setActionState(prev => ({ ...prev, [actionId]: { status: 'undo', timeoutId, actionType, payload } }));
            } else {
                setActionState(prev => ({ ...prev, [actionId]: null }));
            }
        }
    };

    const handleUndo = (actionId) => {
        const state = actionState[actionId];
        if (state && state.timeoutId) {
            clearTimeout(state.timeoutId);
        }
        handleAction(state.actionType, state.payload, true);
    };

    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-effect max-w-4xl text-white border-purple-500/30">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-2xl">{customer.full_name}</DialogTitle>
                    <DialogDescription>Member since {new Date(customer.created_at).toLocaleDateString()}</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mb-6">
                        <div className="flex items-center space-x-2 text-yellow-400 text-xl">
                            <Star className="w-6 h-6" />
                            <p className="font-bold">{customer.total_stamps || 0}</p>
                            <p className="text-sm text-gray-400">stamps</p>
                        </div>
                        {actionState['addStamp']?.status === 'undo' ? (
                            <Button onClick={() => handleUndo('addStamp')} variant="secondary"><Undo2 className="w-4 h-4 mr-2" />Undo Stamp</Button>
                        ) : (
                            <Button onClick={() => handleAction('stamp')} disabled={actionState['addStamp']?.status === 'loading'}>
                                <Zap className="w-4 h-4 mr-2" />
                                {actionState['addStamp']?.status === 'loading' ? 'Adding...' : 'Add Stamp'}
                            </Button>
                        )}
                    </div>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div></div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center"><Gift className="w-5 h-5 mr-2 text-green-400" /> Unclaimed Rewards</h3>
                            <div className="space-y-2">
                                {unclaimedRewards.length > 0 ? unclaimedRewards.map(reward => (
                                    <div key={reward.reward_id} className="text-sm p-3 bg-green-900/50 rounded-md">
                                        <p className="font-medium text-white">{reward.description}</p>
                                        <p className="text-xs text-green-300 mb-2">{reward.stamps_required} stamps</p>
                                        {actionState[reward.reward_id]?.status === 'undo' ? (
                                            <Button onClick={() => handleUndo(reward.reward_id)} size="sm" variant="secondary" className="w-full"><Undo2 className="w-4 h-4 mr-2" />Undo Redeem</Button>
                                        ) : (
                                            <Button onClick={() => handleAction('redeem', reward)} size="sm" variant="outline" className="w-full" disabled={actionState[reward.reward_id]?.status === 'loading'}>
                                                {actionState[reward.reward_id]?.status === 'loading' ? 'Redeeming...' : 'Redeem for Customer'}
                                            </Button>
                                        )}
                                    </div>
                                )) : <p className="text-gray-400 text-sm text-center py-4">No unclaimed rewards.</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-purple-400" /> Private Notes</h3>
                            <form onSubmit={handleAddNote} className="flex space-x-2 mb-4">
                                <Textarea placeholder="Add notes..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="bg-gray-800/50 border-gray-600 h-24 text-white" />
                                <Button type="submit" size="icon" disabled={isAddingNote}><Save className="w-4 h-4" /></Button>
                            </form>
                            <div className="space-y-2">
                                {notes.length > 0 ? notes.map(note => (
                                    <div key={note.id} className="text-sm p-3 bg-gray-800/50 rounded-md group relative">
                                        <p className="text-gray-300">{note.note}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteNote(note.id)}><Trash2 className="h-4 w-4 text-red-400"/></Button>
                                    </div>
                                )) : <p className="text-gray-400 text-sm text-center py-4">No notes yet.</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-400" /> Activity History</h3>
                            <div className="space-y-2">
                                {stampHistory.length > 0 ? stampHistory.map((event, index) => (
                                    <div key={index} className="text-sm p-3 bg-gray-800/50 rounded-md flex items-start space-x-3">
                                        <div className="mt-1">{event.event_type === 'stamp' ? <Star className="w-4 h-4 text-yellow-400" /> : <Award className="w-4 h-4 text-green-400" />}</div>
                                        <div>
                                            <p className="font-medium text-white">{event.description}</p>
                                            <p className="text-xs text-gray-400">{new Date(event.event_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-400 text-sm text-center py-4">No activity history.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

const CustomerDirectory = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [store, setStore] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [actionState, setActionState] = useState({});
    const { toast } = useToast();

    const fetchCustomers = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data: storeData, error: storeError } = await supabase.from('stores').select('id, store_name, locations(*)').eq('owner_id', user.id).single();
        if (storeError || !storeData) { setLoading(false); return; }
        setStore(storeData);
        setLocations(storeData.locations || []);

        const { data, error } = await supabase.rpc('get_store_customers', { p_store_id: storeData.id });

        if (error) { console.error('Error fetching customers:', error); } 
        else {
            const { data: cards } = await supabase.from('loyalty_cards').select('id, customer_id').in('location_id', storeData.locations.map(l => l.id));
            const cardMap = new Map(cards.map(c => [c.customer_id, c.id]));
            const customersWithCards = (data || []).map(c => ({...c, loyalty_card_id: cardMap.get(c.id)}));
            setCustomers(customersWithCards);
        }
        setLoading(false);
    }, [user]);
    
    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const handleAddStamp = async (e, customer, undo = false) => {
        e.stopPropagation();
        const customerId = customer.id;
        setActionState(prev => ({ ...prev, [customerId]: { status: 'loading' } }));

        const { data, error } = await supabase.functions.invoke('add-stamp-manually', {
            body: { loyalty_card_id: customer.loyalty_card_id, storeId: store.id, undo },
        });

        if (error || data.error) {
            toast({ title: "Error", variant: "destructive", description: data?.error || error.message });
            setActionState(prev => ({ ...prev, [customerId]: null }));
        } else {
            toast({ title: undo ? "Stamp Undone!" : "Stamp Added! ⭐" });
            fetchCustomers();
            if (!undo) {
                const timeoutId = setTimeout(() => setActionState(p => ({...p, [customerId]: null})), 3000);
                setActionState(prev => ({ ...prev, [customerId]: { status: 'undo', timeoutId } }));
            } else {
                setActionState(prev => ({ ...prev, [customerId]: null }));
            }
        }
    };

    const handleUndo = (e, customer) => {
        const state = actionState[customer.id];
        if (state && state.timeoutId) {
            clearTimeout(state.timeoutId);
        }
        handleAddStamp(e, customer, true);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Helmet><title>Customer Directory - {store?.store_name || 'Puff Perks'}</title></Helmet>
            <div className="min-h-screen bg-gray-900 text-white">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-2">Customer Directory</h1>
                        <p className="text-gray-400 mb-6">Search, view, and manage all your customers.</p>
                    </motion.div>
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-12 text-lg bg-gray-800/50 border-gray-700 rounded-xl focus:border-purple-500" />
                    </div>

                    {loading ? (
                         <div className="text-center text-gray-400 grid grid-cols-1 gap-2">{[...Array(5)].map((_, i) => (<div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg animate-pulse"><div className="space-y-2"><div className="h-4 bg-gray-700 rounded w-32"></div><div className="h-3 bg-gray-700 rounded w-24"></div></div><div className="h-8 bg-gray-700 rounded w-24"></div></div>))}</div>
                    ) : (
                        <motion.div className="bg-gray-900/50 rounded-xl border border-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="divide-y divide-gray-800">
                                <AnimatePresence>
                                {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                                    <motion.div key={customer.id} layout className="flex items-center justify-between p-4 hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelectedCustomer(customer)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <div>
                                            <p className="font-medium text-white text-lg">{customer.full_name}</p>
                                            <p className="text-sm text-gray-400">Total Stamps: {customer.total_stamps || 0}</p>
                                        </div>
                                        {actionState[customer.id]?.status === 'undo' ? (
                                            <Button size="sm" variant="secondary" onClick={(e) => handleUndo(e, customer)}><Undo2 className="w-4 h-4 mr-2" />Undo</Button>
                                        ) : (
                                            <Button size="sm" onClick={(e) => handleAddStamp(e, customer)} disabled={!customer.loyalty_card_id || actionState[customer.id]?.status === 'loading'}>
                                                <Zap className="w-4 h-4 mr-2" />
                                                {actionState[customer.id]?.status === 'loading' ? 'Adding...' : 'Add Stamp'}
                                            </Button>
                                        )}
                                    </motion.div>
                                )) : (
                                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center p-8 text-gray-400">
                                        <p className="mb-6">No customers found. Get your first customer by sharing your QR code!</p>
                                        {locations.length > 0 && (<div className="max-w-md mx-auto"><QRCodeCard selectedLocation={locations[0]} storeName={store.store_name} onCardDesignSave={() => {}} rewards={[]} /></div>)}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
            
            <CustomerDetailsModal customer={selectedCustomer} storeId={store?.id} isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} onUpdate={fetchCustomers} />
        </>
    );
};

export default CustomerDirectory;