
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';


const VisitAnalyticsCard = ({ segments, isLoading }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
        },
    },
  };

  const chartData = [
    { name: 'New', count: segments?.segments?.new || 0 },
    { name: 'Loyal', count: segments?.segments?.loyal || 0 },
    { name: 'VIPs', count: segments?.segments?.vips || 0 },
    { name: 'At Risk', count: segments?.segments?.at_risk || 0 },
  ];

  const renderContent = () => {
    if (isLoading || !segments) {
      return (
        <div className="h-full flex flex-col justify-between">
          <Skeleton className="h-8 w-3/4 mb-4 bg-gray-700" />
          <div className="flex items-end space-x-4 h-full">
              <Skeleton className="h-4/5 w-1/4 bg-gray-700 rounded-md" />
              <Skeleton className="h-3/5 w-1/4 bg-gray-700 rounded-md" />
              <Skeleton className="h-2/3 w-1/4 bg-gray-700 rounded-md" />
              <Skeleton className="h-full w-1/4 bg-gray-700 rounded-md" />
          </div>
        </div>
      );
    }
    
    return (
      <>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Customer Segments
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }}
                cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
              />
              <Bar dataKey="count" name="Customers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
            <p><span className="font-bold">{segments?.visit_stats?.stamps_last_7_days ?? 0}</span> stamps issued this week</p>
            <p><span className="font-bold">{segments?.visit_stats?.average_visit_frequency ?? 0}</span> avg visits per customer</p>
        </div>
      </>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="glass-effect rounded-xl p-6"
    >
      {renderContent()}
    </motion.div>
  );
};

export { VisitAnalyticsCard };
