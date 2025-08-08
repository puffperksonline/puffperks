
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Search, Edit, Save, X, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const StoreListItem = ({ store, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(store.trial_ends_at ? new Date(store.trial_ends_at).toISOString().split('T')[0] : '');
  const [isTrialActive, setIsTrialActive] = useState(!!store.trial_ends_at);
  const { toast } = useToast();

  const handleSave = async () => {
    const newTrialDate = isTrialActive ? new Date(trialEndDate).toISOString() : null;
    const { error } = await supabase.from('stores').update({ trial_ends_at: newTrialDate }).eq('id', store.id);
    if (error) {
      toast({ title: 'Error saving store', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Store updated successfully' });
      onUpdate();
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg text-sm space-y-2">
       <div className="font-bold text-lg text-white mb-2">{store.store_name}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><strong className="text-gray-300 block">Owner:</strong> {store.owner_name}</div>
        <div><strong className="text-gray-300 block">Email:</strong> {store.owner_email || 'N/A'}</div>
        <div><strong className="text-gray-300 block">Customers:</strong> {store.customers_count}</div>
      </div>
      <div className="flex items-center space-x-4 pt-2 border-t border-gray-700/50 mt-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor={`trial-switch-${store.id}`}>Trial Active</Label>
          <Switch id={`trial-switch-${store.id}`} checked={isTrialActive} onCheckedChange={setIsTrialActive} disabled={!isEditing} />
        </div>
        {isTrialActive && (
          <Input type="date" value={trialEndDate} onChange={(e) => setTrialEndDate(e.target.value)} disabled={!isEditing} className="bg-gray-700 w-auto" />
        )}
        <div className="flex-grow" />
        {isEditing ? (
          <>
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
            <Button size="icon" onClick={handleSave}><Save className="h-4 w-4" /></Button>
          </>
        ) : (
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
        )}
      </div>
    </div>
  );
};

const NoticeModal = ({ isOpen, onClose, onSave, noticeToEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showToAll, setShowToAll] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (noticeToEdit) {
            setTitle(noticeToEdit.title);
            setContent(noticeToEdit.content);
            setShowToAll(noticeToEdit.show_to_all_stores);
        } else {
            setTitle('');
            setContent('');
            setShowToAll(true);
        }
    }, [noticeToEdit]);

    const handleSave = async () => {
        const noticeData = { title, content, show_to_all_stores: showToAll };
        let error;
        if (noticeToEdit) {
            ({ error } = await supabase.from('notices').update(noticeData).eq('id', noticeToEdit.id));
        } else {
            ({ error } = await supabase.from('notices').insert([noticeData]));
        }
        if (error) {
            toast({ title: "Error saving notice", description: error.message, variant: "destructive" });
        } else {
            toast({ title: `Notice ${noticeToEdit ? 'updated' : 'created'}!` });
            onSave();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle>{noticeToEdit ? 'Edit Notice' : 'Create New Notice'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-700" />
                    <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="bg-gray-700 h-32" />
                    <div className="flex items-center space-x-2">
                        <Switch id="show-all" checked={showToAll} onCheckedChange={setShowToAll} />
                        <Label htmlFor="show-all">Show to all stores</Label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save Notice</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AdminDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*, owner:users(email)');

    if (storesError) {
      console.error("Error fetching stores:", storesError);
      toast({ title: 'Error', description: 'Could not fetch stores.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const storesWithCounts = await Promise.all(storesData.map(async (store) => {
      const { data: locations, error: locationsError } = await supabase.from('locations').select('id').eq('store_id', store.id);
      if (locationsError) return { ...store, customers_count: 0 };
      
      const locationIds = locations.map(l => l.id);
      const { count, error: customerCountError } = await supabase
        .from('loyalty_cards')
        .select('customer_id', { count: 'exact', head: true })
        .in('location_id', locationIds);

      return { ...store, customers_count: count || 0, owner_email: store.owner?.email };
    }));

    setStores(storesWithCounts);

    const { data: noticesData, error: noticesError } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (noticesError) console.error("Error fetching notices:", noticesError);
    setNotices(noticesData || []);

    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredStores = stores.filter(store =>
    store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleOpenNoticeModal = (notice = null) => {
    setEditingNotice(notice);
    setIsNoticeModalOpen(true);
  };
  
  const handleDeleteNotice = async (noticeId) => {
    const { error } = await supabase.from('notices').delete().eq('id', noticeId);
    if(error){ toast({title: "Error", description: error.message, variant: "destructive"})}
    else { toast({title: "Notice deleted!"}); fetchData(); }
  };

  return (
    <>
      <Helmet><title>Admin Dashboard - Puff Perks</title></Helmet>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold mb-8">Admin Dashboard</motion.h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">All Stores ({filteredStores.length})</h2>
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input type="text" placeholder="Search stores..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border-gray-700 h-12" />
              </div>
              <div className="bg-gray-800/50 rounded-xl p-2 md:p-4 space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {loading ? <p className="text-center p-4">Loading stores...</p> : filteredStores.map(store => <StoreListItem key={store.id} store={store} onUpdate={fetchData} />)}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Notices</h2>
                <Button onClick={() => handleOpenNoticeModal()}><PlusCircle className="w-4 h-4 mr-2" />New</Button>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-2 md:p-4 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {notices.length > 0 ? notices.map(notice => (
                  <div key={notice.id} className="bg-gray-900/50 p-3 rounded-lg">
                    <h3 className="font-semibold text-white">{notice.title}</h3>
                    <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                      <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                      <div className='flex items-center'>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenNoticeModal(notice)}><Edit className="h-3 w-3" /></Button>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteNotice(notice.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                      </div>
                    </div>
                  </div>
                )) : <p className="text-center text-gray-400 py-4">No notices yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <NoticeModal isOpen={isNoticeModalOpen} onClose={() => setIsNoticeModalOpen(false)} onSave={fetchData} noticeToEdit={editingNotice} />
    </>
  );
};

export default AdminDashboard;