import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const CardHeader = ({ storeData, locationData }) => {
  const textColor = { color: locationData.card_text_color || '#ffffff' };
  const stampColor = { backgroundColor: locationData.card_stamp_color || '#8b5cf6' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
      {locationData.logo_url ? (
        <img-replace src={locationData.logo_url} alt={`${storeData.store_name} logo`} className="max-h-20 object-contain mx-auto mb-4" />
      ) : (
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={stampColor}>
          <Sparkles className="w-8 h-8" style={textColor} />
        </div>
      )}
      <h1 className="text-2xl font-bold mb-2" style={textColor}>{storeData.store_name}</h1>
      <p style={{ ...textColor, opacity: 0.8 }}>Digital Loyalty Card</p>
    </motion.div>
  );
};