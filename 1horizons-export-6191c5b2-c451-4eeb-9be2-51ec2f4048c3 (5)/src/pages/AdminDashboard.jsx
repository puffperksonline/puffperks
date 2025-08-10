
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Store, Users, Bell, PlusCircle, Trash2, Edit, X } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4">
    <div className="bg-gray-700 p-3 rounded-full">
      <Icon className="h-6 w-6 text-indigo-400" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ stores: 0, customers: 0 });
  const [stores, setStores] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', show_to_all_stores: true, target_store_ids: [] });
  const [editingNotice, setEditingNotice] = useState(null);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*, owner:users!owner_id(email)');

      if (storesError) throw storesError;
      setStores(storesData || []);
      setStats(prev => ({ ...prev, stores: storesData?.length || 0 }));

      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true });
      
      if (customersError) throw customersError;
      setStats(prev => ({ ...prev, customers: customersData?.count || 0 }));

      const { data: noticesData, error: noticesError } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (noticesError) throw noticesError;
      setNotices(noticesData || []);

    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: 'Error Fetching Data',
        description: `Could not fetch admin data: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) {
      toast({ title: 'Error', description: 'Title and content are required.', variant: 'destructive' });
      return;
    }

    try {
      let query;
      const noticePayload = {
        ...newNotice,
        target_store_ids: newNotice.show_to_all_stores ? null : newNotice.target_store_ids,
      };

      if (editingNotice) {
        query = supabase.from('notices').update(noticePayload).eq('id', editingNotice.id);
      } else {
        query = supabase.from('notices').insert(noticePayload);
      }

      const { error } = await query;
      if (error) throw error;

      toast({ title: 'Success', description: `Notice ${editingNotice ? 'updated' : 'created'} successfully.` });
      setShowNoticeForm(false);
      setNewNotice({ title: '', content: '', show_to_all_stores: true, target_store_ids: [] });
      setEditingNotice(null);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to save notice: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', noticeId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Notice deleted.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: `Failed to delete notice: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      content: notice.content,
      show_to_all_stores: notice.show_to_all_stores,
      target_store_ids: notice.target_store_ids || [],
    });
    setShowNoticeForm(true);
  };

  const closeForm = () => {
    setShowNoticeForm(false);
    setEditingNotice(null);
    setNewNotice({ title: '', content: '', show_to_all_stores: true, target_store_ids: [] });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Admin Portal...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Admin Portal - Puff Perks</title>
      </Helmet>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold flex items-center"><Shield className="mr-3 text-indigo-400" />Admin Portal</h1>
          <p className="text-gray-400">Global oversight and management dashboard.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Stores" value={stats.stores} icon={Store} />
          <StatCard title="Total Customers" value={stats.customers} icon={Users} />
          <StatCard title="Active Notices" value={notices.length} icon={Bell} />
        </div>

        {/* Notices Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Notice Board</h2>
            <Button onClick={() => setShowNoticeForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Notice
            </Button>
          </div>
          <AnimatePresence>
            {showNoticeForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleNoticeSubmit} className="bg-gray-800 p-4 rounded-md mb-4 space-y-4">
                   <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{editingNotice ? 'Edit Notice' : 'Create New Notice'}</h3>
                    <Button variant="ghost" size="icon" onClick={closeForm} type="button">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Title"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                  <Textarea
                    placeholder="Content (supports markdown)"
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                    rows={4}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-stores"
                      checked={newNotice.show_to_all_stores}
                      onCheckedChange={(checked) => setNewNotice({ ...newNotice, show_to_all_stores: checked })}
                    />
                    <Label htmlFor="all-stores">Show to all stores</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={closeForm} type="button">Cancel</Button>
                    <Button type="submit">{editingNotice ? 'Update Notice' : 'Save Notice'}</Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-3">
            {notices.map(notice => (
              <div key={notice.id} className="bg-gray-700 p-4 rounded-md flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white">{notice.title}</h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{notice.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {notice.show_to_all_stores ? 'Visible to all stores' : `Visible to ${notice.target_store_ids?.length || 0} stores`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditNotice(notice)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteNotice(notice.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stores Table */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Stores</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3">Store Name</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Owner Email</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Trial Ends</th>
                  <th className="p-3">Referrals</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id} className="border-b border-gray-800 hover:bg-gray-700/50">
                    <td className="p-3">{store.store_name}</td>
                    <td className="p-3">{store.owner_name}</td>
                    <td className="p-3 text-indigo-400">{store.owner?.email || 'N/A'}</td>
                    <td className="p-3">{new Date(store.created_at).toLocaleDateString()}</td>
                    <td className="p-3">{store.trial_ends_at ? new Date(store.trial_ends_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3">{store.referral_enabled ? 'Enabled' : 'Disabled'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
