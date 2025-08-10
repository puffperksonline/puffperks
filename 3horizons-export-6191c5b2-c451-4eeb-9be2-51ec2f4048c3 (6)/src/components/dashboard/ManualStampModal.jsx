
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Zap } from 'lucide-react';

const ManualStampModal = ({ isOpen, onClose, storeId, onUpdate }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [stamps, setStamps] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);

  const handleFindCustomer = async () => {
    if (!email) {
      toast({ title: 'Please enter an email address.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    
    const { data: customers, error } = await supabase.rpc('get_store_customers', { p_store_id: storeId });
    
    if (error) {
      toast({ title: "Error finding customer", description: error.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const found = customers.find(c => c.email.toLowerCase() === email.toLowerCase());

    if (found) {
      const { data: card } = await supabase.from('loyalty_cards').select('id').eq('customer_id', found.id).limit(1).single();
      if(card) {
        setCustomerFound({ ...found, loyalty_card_id: card.id });
        toast({ title: 'Customer Found!', description: `${found.full_name} is ready for stamps.`});
      } else {
        toast({ title: "No loyalty card found for this customer.", description: "They may have an account but haven't used your QR code yet.", variant: "destructive" });
      }
    } else {
      toast({ title: "Customer not found", description: "No customer with this email is registered at your store.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleAddStamps = async () => {
    if (!customerFound) {
      toast({ title: 'Please find a customer first.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const promises = [];
    for (let i = 0; i < stamps; i++) {
        promises.push(supabase.functions.invoke('add-stamp-manually', {
            body: { loyalty_card_id: customerFound.loyalty_card_id, storeId: storeId },
        }));
    }
    
    try {
        const results = await Promise.all(promises);
        const firstError = results.find(r => r.error);
        if(firstError) throw new Error(firstError.error.message);

        toast({ title: "Stamps Added!", description: `${stamps} stamp(s) added for ${customerFound.full_name}.` });
        onUpdate();
        handleClose();
    } catch (error) {
        toast({ title: "Error adding stamps", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setEmail('');
    setStamps(1);
    setCustomerFound(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Manual Stamp Add</DialogTitle>
          <DialogDescription>
            If a customer is having trouble, you can manually add stamps for them here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="customer-email">Customer Email</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="customer-email"
                type="email"
                placeholder="customer@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!customerFound}
                className="bg-gray-800/50 border-gray-600"
                onKeyDown={(e) => { if (e.key === 'Enter') handleFindCustomer(); }}
              />
              <Button onClick={handleFindCustomer} disabled={isLoading || !!customerFound}>
                {isLoading && !customerFound ? 'Searching...' : 'Find'}
              </Button>
            </div>
          </div>
          {customerFound && (
            <div className="p-3 bg-green-900/50 rounded-md">
              <p className="text-white font-medium">Found: {customerFound.full_name}</p>
            </div>
          )}
          <div>
            <Label htmlFor="stamps-to-add">Stamps to Add</Label>
            <Input
              id="stamps-to-add"
              type="number"
              min="1"
              value={stamps}
              onChange={(e) => setStamps(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={!customerFound}
              className="bg-gray-800/50 border-gray-600 mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddStamps} disabled={isLoading || !customerFound}>
            {isLoading && customerFound ? 'Adding...' : 'Add Stamps'} <Zap className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualStampModal;
