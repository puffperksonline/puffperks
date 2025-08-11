import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsPage } from '@/pages/SettingsPage';

export const SettingsDialog = ({ isOpen, setIsOpen, customer, onCustomerUpdate }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] glass-effect">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>
        <SettingsPage 
          customer={customer}
          onCustomerUpdate={onCustomerUpdate}
          isCustomer={true}
        />
      </DialogContent>
    </Dialog>
  );
};