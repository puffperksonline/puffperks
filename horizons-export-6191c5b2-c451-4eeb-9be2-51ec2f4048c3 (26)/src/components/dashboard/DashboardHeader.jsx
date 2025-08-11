
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  Settings,
  Users,
  Menu,
  X,
  LayoutDashboard,
  CreditCard,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

export const DashboardHeader = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (user) {
        const { data } = await supabase
          .from('stores')
          .select('store_name, subscription_status')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (data) {
          setStore(data);
        }
      }
    };
    fetchStoreData();
  }, [user]);

  const navLinks = [
    { path: '/store/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/store/customers', label: 'Customers', icon: Users },
    { path: '/store/locations', label: 'Locations', icon: Building2 },
    { path: '/store/settings', label: 'Settings', icon: Settings },
  ];
  
  const manageSubscriptionUrl = 'https://billing.stripe.com/p/login/test_7sI5m6bKqg5obYYaEE';

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/store/dashboard" className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
              >
                Puff Perks
              </motion.div>
              <span className="text-gray-500 hidden sm:inline">|</span>
              <span className="font-semibold text-white hidden sm:inline">{store?.store_name}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(link => (
              <Button key={link.path} variant="ghost" onClick={() => navigate(link.path)}>
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Button>
            ))}
            {store?.subscription_status === 'active' && (
                <a href={manageSubscriptionUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Subscription
                    </Button>
                </a>
            )}
            <Button variant="ghost" onClick={onLogout} className="text-red-400 hover:bg-red-500/10 hover:text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-gray-900/90 pb-4"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map(link => (
              <Button key={link.path} variant="ghost" className="w-full justify-start" onClick={() => { navigate(link.path); setIsMenuOpen(false); }}>
                <link.icon className="w-4 h-4 mr-3" />
                {link.label}
              </Button>
            ))}
            {store?.subscription_status === 'active' && (
                <a href={manageSubscriptionUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="ghost" className="w-full justify-start">
                        <CreditCard className="w-4 h-4 mr-3" />
                        Manage Subscription
                    </Button>
                </a>
            )}
            <Button variant="ghost" onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-400">
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};
