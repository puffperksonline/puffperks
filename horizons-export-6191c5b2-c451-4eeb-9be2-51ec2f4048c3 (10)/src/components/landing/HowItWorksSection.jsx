import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Zap, Gift } from 'lucide-react';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: QrCode,
    title: "Easy Customer Signup",
    description: "Customers scan a QR code to sign up in seconds. No app downloads, just instant loyalty."
  },
  {
    icon: Zap,
    title: "Instant Stamps",
    description: "Add stamps with a tap from your dashboard. Customers see their progress update in real-time."
  },
  {
    icon: Gift,
    title: "Manage Rewards",
    description: "Watch as customers fill their stamp cards, add and manage tiers, and simple redemption activation."
  }
];

const HowItWorksSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section className="pt-20 pb-20 px-4 bg-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold mb-12 text-white"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>
        
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <div className="md:hidden">
          <motion.div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onUpdate={({x}) => {
                const cardWidth = window.innerWidth - 32; // Full width minus padding
                const newIndex = Math.round(-x.get() / cardWidth);
                if (newIndex !== currentIndex) setCurrentIndex(newIndex);
            }}
          >
            {features.map((feature, index) => (
              <div key={index} className="flex-shrink-0 w-full px-2 snap-center">
                <FeatureCard {...feature} />
              </div>
            ))}
          </motion.div>
          <div className="flex justify-center mt-6 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const element = document.querySelector('.snap-x');
                  if (element) {
                    const cardWidth = window.innerWidth - 32;
                    element.scrollTo({
                      left: index * cardWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${currentIndex === index ? 'bg-purple-400' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;