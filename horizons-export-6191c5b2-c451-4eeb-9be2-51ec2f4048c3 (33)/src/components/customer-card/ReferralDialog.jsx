import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const ReferralDialog = ({ isOpen, setIsOpen, customer, location }) => {
  const referralLink = customer?.referral_code && location?.id
    ? `${window.location.origin}/customer/signup/${location.id}/${customer.referral_code}`
    : '';

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied to Clipboard!",
      description: "You can now share your referral link.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] glass-effect">
        <DialogHeader>
          <DialogTitle>Refer a Friend</DialogTitle>
          <DialogDescription>
            Share your link! You and your friend will both receive a free stamp when they sign up and get their first stamp.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 space-y-4">
          <Label htmlFor="referral-link">Your Unique Referral Link</Label>
          <div className="flex space-x-2">
            <Input id="referral-link" value={referralLink} readOnly className="bg-gray-800/50 border-gray-600"/>
            <Button onClick={copyToClipboard} size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};