
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient.js';
import { Users, RefreshCw, Star, Award, BarChart3, Crown, UserPlus, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatBox = ({ icon: Icon, label, value, subtext, color }) => {
  return (
    <div className="glass-effect-deep p-4 rounded-lg flex flex-col justify-between min-h-[120px]">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">{label}</p>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
};

export const AnalyticsCard = ({ storeId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-analytics', {
        body: { store_id: storeId },
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-effect-deep p-4 rounded-lg h-32 animate-pulse bg-gray-700/50"></div>
          ))}
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-400">Could not load analytics data.</p>
        </div>
      );
    }
    
    const isDataLive = analytics.is_live;

    return (
        <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
            icon={Users}
            label="Total Customers"
            value={analytics.total_customers?.value ?? 0}
            subtext={analytics.total_customers?.change ? `${analytics.total_customers.change > 0 ? `+${analytics.total_customers.change}` : analytics.total_customers.change} in last 30d` : 'Since launch'}
            color="text-blue-400"
            />
            <StatBox
            icon={RefreshCw}
            label="Repeat Customers"
            value={analytics.repeat_customers?.value ?? 0}
            subtext={isDataLive ? "Customers with >1 visit" : "+5% this month"}
            color="text-green-400"
            />
            <StatBox
            icon={Star}
            label="Stamps Issued"
            value={analytics.stamps_issued?.value ?? 0}
            subtext={isDataLive ? `All time` : `+22% this month`}
            color="text-yellow-400"
            />
            <StatBox
            icon={Award}
            label="Prizes Redeemed"
            value={analytics.prizes_redeemed?.value ?? 0}
            subtext={isDataLive ? `Last 30 days` : "+8 this month"}
            color="text-indigo-400"
            />
            <StatBox
            icon={BarChart3}
            label="Avg. Visit Frequency"
            value={analytics.avg_visit_frequency?.value ? `${analytics.avg_visit_frequency.value}x` : 'N/A'}
            subtext="per customer (all time)"
            color="text-pink-400"
            />
            <StatBox
            icon={Crown}
            label="Top Customer"
            value={analytics.top_customer?.name || 'N/A'}
            subtext={analytics.top_customer ? `${analytics.top_customer.stamps} stamps` : ''}
            color="text-purple-400"
            />
            <StatBox
            icon={UserPlus}
            label="Referral Signups"
            value={analytics.referral_signups?.value ?? 0}
            subtext="Successful new customers"
            color="text-teal-400"
            />
            <StatBox
            icon={Gift}
            label="Top Referrer"
            value={analytics.top_referrer?.name || 'N/A'}
            subtext={analytics.top_referrer ? `${analytics.top_referrer.count} referrals` : ''}
            color="text-orange-400"
            />
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
            Analytics will populate and change over time as your loyal customer base earn stamps and rewards.
            {!isDataLive && <i className="ml-1">Currently showing sample data.</i>}
        </p>
        </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-effect rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Analytics Overview</h2>
         <Button variant="ghost" size="sm" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {renderContent()}
    </motion.div>
  );
};
