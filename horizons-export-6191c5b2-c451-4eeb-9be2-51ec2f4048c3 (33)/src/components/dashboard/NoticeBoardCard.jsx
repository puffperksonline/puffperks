import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

const NoticeBoardCard = ({ notice }) => {
  if (!notice) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      layout
      className="glass-effect rounded-xl p-6 border border-yellow-500/30"
    >
      <div className="flex items-center mb-3">
        <Megaphone className="w-5 h-5 mr-2 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">{notice.title}</h3>
      </div>
      <p className="text-gray-300 text-sm whitespace-pre-wrap">{notice.content}</p>
      <p className="text-xs text-gray-500 mt-4 text-right">
        Posted on {new Date(notice.created_at).toLocaleDateString()}
      </p>
    </motion.div>
  );
};

export default NoticeBoardCard;