import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Mail, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet';
import { LocationsManager } from '@/components/dashboard/LocationsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from 'react-router-dom';

export const SettingsPage = () => {
    const { user } = useAuth();
    const { defaultTab } = useParams();
    const [store, setStore] = useState(null);
    const [storeName, setStoreName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchStoreData = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', user.id)
            .single();
        
        if (data) {
            setStore(data);
            setStoreName(data.store_name);
            setOwnerName(data.owner_name);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStoreData();
    }, [user]);

    const handleInfoSave = async () => {
        setIsSaving(true);
        const { data, error } = await supabase
            .from('stores')
            .update({ store_name: storeName, owner_name: ownerName })
            .eq('id', store.id)
            .select()
            .single();

        if (error) {
            toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Settings saved!', description: 'Your store details have been updated.' });
            setStore(data);
        }
        setIsSaving(false);
    };

    const handleEmailChange = async () => {
        if (!newEmail) {
            toast({ title: 'Email required', description: 'Please enter a new email address.', variant: 'destructive' });
            return;
        }
        setIsSavingEmail(true);
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        
        if (error) {
            toast({ title: 'Error updating email', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Confirmation sent!', description: 'Please check both your old and new email addresses to confirm the change.' });
            setNewEmail('');
        }
        setIsSavingEmail(false);
    }
    
    const onLocationsUpdate = () => {
        fetchStoreData();
    };


    if (loading) {
        return <div className="flex justify-center items-center h-96 text-white">Loading settings...</div>;
    }

    return (
        <>
        <Helmet>
            <title>Settings - {store?.store_name || 'Puff Perks'}</title>
        </Helmet>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
            <Tabs defaultValue={defaultTab || "profile"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile & Account</TabsTrigger>
                    <TabsTrigger value="locations">
                        <Building2 className="w-4 h-4 mr-2" /> Locations
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <div className="space-y-8 text-white p-4 glass-effect rounded-xl mt-4">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Profile Information</h3>
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="storeName">Store Name</Label>
                                    <Input
                                        id="storeName"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        className="bg-gray-800/50 border-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ownerName">Owner Name</Label>
                                    <Input
                                        id="ownerName"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        className="bg-gray-800/50 border-gray-600"
                                    />
                                </div>
                            </>
                            <Button onClick={handleInfoSave} disabled={isSaving} className="w-full">
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-semibold">Account Email</h3>
                            <p className="text-sm text-gray-400">Current email: {user.email}</p>
                            <div className="space-y-2">
                                <Label htmlFor="newEmail">New Email Address</Label>
                                <Input
                                    id="newEmail"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="bg-gray-800/50 border-gray-600"
                                    placeholder="Enter your new email"
                                />
                            </div>
                            <Button onClick={handleEmailChange} disabled={isSavingEmail} className="w-full">
                                <Mail className="w-4 h-4 mr-2" />
                                {isSavingEmail ? 'Updating...' : 'Update Email'}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="locations">
                    <div className="text-white p-4 glass-effect rounded-xl mt-4">
                         <h2 className="text-xl font-semibold mb-4">Manage Locations</h2>
                        <LocationsManager store={store} onUpdate={onLocationsUpdate} />
                    </div>
                </TabsContent>
            </Tabs>
        </main>
        </>
    );
};