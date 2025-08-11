import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-lg backdrop-blur-sm h-full"
    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)" }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 text-purple-400 mr-3" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

export default FeatureCard;