
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActionButtons = ({ onReferClick, onSettingsClick, onLogout, showReferral }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.4 }} 
      className="flex flex-col space-y-3 mt-6"
    >
      {showReferral && (
        <Button variant="outline" onClick={onReferClick} className="bg-purple-600/20 border-purple-500 hover:bg-purple-600/30">
          <Users className="w-4 h-4 mr-2" />
          Refer a Friend
        </Button>
      )}
      <Button variant="outline" onClick={onSettingsClick}>
        <Settings className="w-4 h-4 mr-2" />
        Account Settings
      </Button>
      <Button variant="ghost" className="text-red-400 hover:bg-red-500/10 hover:text-red-400" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </motion.div>
  );
};
