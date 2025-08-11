import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const StampGrid = ({ totalStamps, filledStamps, locationData, isAnimating }) => {
  const stampStyle = (isFilled) => ({
    backgroundColor: isFilled ? locationData.card_stamp_color || '#8b5cf6' : 'rgba(255, 255, 255, 0.1)',
    borderColor: locationData.card_stamp_color || '#8b5cf6',
  });

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {Array.from({ length: totalStamps }, (_, index) => (
        <motion.div
          key={index}
          className="stamp-slot"
          style={stampStyle(index < filledStamps)}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {index < filledStamps && (
            <motion.div
              className="w-full h-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: isAnimating && index === filledStamps - 1 ? 0.1 : 0,
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: locationData.card_text_color || '#ffffff' }} />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};