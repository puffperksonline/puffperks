import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VisitAnalyticsCard = ({ storeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVisitAnalytics = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    // This is a placeholder for a dedicated edge function.
    // In a real app, you would create a `get-visit-analytics` function.
    // For now, we simulate data fetching and processing.
    setTimeout(() => {
        const sampleData = [
            { name: '4w ago', Stamps: 80, Rewards: 15 },
            { name: '3w ago', Stamps: 95, Rewards: 20 },
            { name: '2w ago', Stamps: 110, Rewards: 25 },
            { name: 'Last Week', Stamps: 128, Rewards: 23 },
        ];
        setData(sampleData);
        setLoading(false);
    }, 1500);
  }, [storeId]);

  useEffect(() => {
    fetchVisitAnalytics();
  }, [fetchVisitAnalytics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-effect rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
        Weekly Activity
      </h2>
      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
              <div className="animate-pulse flex items-end space-x-4 h-full">
                  <div className="h-4/5 w-8 bg-gray-700 rounded-md"></div>
                  <div className="h-3/5 w-8 bg-gray-700 rounded-md"></div>
                  <div className="h-2/3 w-8 bg-gray-700 rounded-md"></div>
                  <div className="h-full w-8 bg-gray-700 rounded-md"></div>
              </div>
          </div>
        ) : data ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderColor: '#4b5563',
                    borderRadius: '0.5rem'
                }}
                cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
              />
              <Legend wrapperStyle={{fontSize: "14px"}} />
              <Bar dataKey="Stamps" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Rewards" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center h-full flex items-center justify-center">Could not load visit analytics.</p>
        )}
      </div>
    </motion.div>
  );
};

export { VisitAnalyticsCard };