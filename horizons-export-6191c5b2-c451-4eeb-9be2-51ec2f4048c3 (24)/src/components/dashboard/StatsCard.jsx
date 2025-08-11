
import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export const StatsCard = ({ icon: Icon, title, data, isLoading }) => {
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

  if (isLoading || !data) {
    return (
      <motion.div variants={itemVariants} className="glass-effect rounded-xl p-6">
        <Skeleton className="h-5 w-2/3 mb-4 bg-gray-700" />
        <Skeleton className="h-8 w-1/3 mb-2 bg-gray-700" />
        <Skeleton className="h-4 w-1/2 bg-gray-700" />
      </motion.div>
    );
  }

  const { value, change } = data;

  return (
    <motion.div variants={itemVariants} className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-purple-400" />}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value ?? 0}</div>
      {change != null && (
        <p className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change} in last 30 days
        </p>
      )}
    </motion.div>
  );
};
