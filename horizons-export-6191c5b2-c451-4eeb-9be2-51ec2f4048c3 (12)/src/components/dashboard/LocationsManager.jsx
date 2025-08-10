
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Trash2, Edit, Save, QrCode } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LocationRow = ({ location, onEdit, onDelete }) => {
  const qrCodeUrl = `${window.location.origin}/customer/signup/${location.id}`;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div>
        <p className="text-white font-medium">{location.name}</p>
        <p className="text-sm text-gray-400">{location.address || 'No address specified'}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <QrCode className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>QR Code for {location.name}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center p-4 bg-white rounded-lg my-4">
                    <QRCodeGenerator value={qrCodeUrl} size={200} />
                </div>
            </DialogContent>
        </Dialog>
        <Button onClick={() => onEdit(location)} variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
        <Button onClick={() => onDelete(location.id)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 hover:text-red-400">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const LocationForm = ({ storeId, onSave, editingLocation, setEditingLocation }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingLocation) {
      setName(editingLocation.name);
      setAddress(editingLocation.address || '');
    } else {
      setName('');
      setAddress('');
    }
  }, [editingLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast({ title: 'Location name is required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    const locationData = { name, address, store_id: storeId };
    
    let error;
    if (editingLocation) {
      ({ error } = await supabase.from('locations').update(locationData).eq('id', editingLocation.id));
    } else {
      ({ error } = await supabase.from('locations').insert(locationData));
    }

    if (error) {
      toast({ title: 'Error saving location', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Location ${editingLocation ? 'updated' : 'added'}!` });
      onSave();
      setEditingLocation(null);
      setName('');
      setAddress('');
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-700 rounded-lg">
       <h3 className="text-lg font-semibold">{editingLocation ? 'Edit Location' : 'Add New Location'}</h3>
      <div className="space-y-2">
        <Label htmlFor="locationName">Location Name</Label>
        <Input id="locationName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Downtown Branch" required className="bg-gray-800/50 border-gray-600" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locationAddress">Address (Optional)</Label>
        <Input id="locationAddress" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown" className="bg-gray-800/50 border-gray-600" />
      </div>
      <div className="flex justify-end space-x-2">
        {editingLocation && <Button type="button" variant="ghost" onClick={() => setEditingLocation(null)}>Cancel</Button>}
        <Button type="submit" disabled={isSaving}>
            {editingLocation ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isSaving ? 'Saving...' : (editingLocation ? 'Save Changes' : 'Add Location')}
        </Button>
      </div>
    </form>
  );
};

export const LocationsManager = ({ store, onUpdate }) => {
  const [locations, setLocations] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    if (!store?.id) return;
    setLoading(true);
    const { data, error } = await supabase.from('locations').select('*').eq('store_id', store.id).order('name');
    if (error) {
      toast({ title: 'Error fetching locations', description: error.message, variant: 'destructive' });
    } else {
      setLocations(data);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchLocations();
  }, [store?.id]);
  
  const handleSave = () => {
    fetchLocations();
    onUpdate();
  }

  const handleDelete = async (locationId) => {
    const { error } = await supabase.from('locations').delete().eq('id', locationId);
    if (error) {
        toast({ title: 'Error deleting location', description: "You may need to remove associated loyalty cards or other data first. Details: " + error.message, variant: 'destructive' });
    } else {
        toast({ title: 'Location deleted successfully' });
        handleSave();
    }
  };

  return (
    <div className="space-y-6">
      <LocationForm storeId={store?.id} onSave={handleSave} editingLocation={editingLocation} setEditingLocation={setEditingLocation} />
      
      <div className="space-y-3">
        {loading ? (
            <p>Loading locations...</p>
        ) : locations.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No locations added yet.</p>
        ) : (
            locations.map(loc => (
                <LocationRow key={loc.id} location={loc} onEdit={setEditingLocation} onDelete={handleDelete} />
            ))
        )}
      </div>
    </div>
  );
};
