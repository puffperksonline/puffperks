import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient.js';
import { Users, TrendingUp } from 'lucide-react';

export const StatsCard = ({ selectedLocation }) => {
  const [stats, setStats] = useState({ totalCustomers: 0, stampsToday: 0 });

  const fetchDashboardStats = useCallback(async (locationId) => {
    if (!locationId) return;

    const { count, error } = await supabase
      .from('loyalty_cards')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', locationId);
    
    if (!error) {
      setStats(prev => ({ ...prev, totalCustomers: count || 0 }));
    }
    
    // Placeholder for stamps today
    setStats(prev => ({ ...prev, stampsToday: 0 }));
  }, []);

  useEffect(() => {
      if(selectedLocation) {
          fetchDashboardStats(selectedLocation.id);
      }
  }, [selectedLocation, fetchDashboardStats]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Total Customers</h3>
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div className="text-3xl font-bold text-white mb-2">{stats.totalCustomers}</div>
        <p className="text-sm text-gray-400">At this location</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Stamps Today</h3>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div className="text-3xl font-bold text-white mb-2">{stats.stampsToday}</div>
        <p className="text-sm text-gray-400">+0% from yesterday</p>
      </motion.div>
    </div>
  );
};