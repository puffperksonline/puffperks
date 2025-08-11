import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, HeartHandshake, BarChart2, Lightbulb, ShieldCheck } from 'lucide-react';
import FeatureCard from './FeatureCard';
import AnimatedBackground from './AnimatedBackground';

const benefits = [
  {
    icon: TrendingUp,
    title: "Boost Customer Retention",
    description: "Keep customers coming back with a rewarding experience that builds loyalty."
  },
  {
    icon: HeartHandshake,
    title: "Referral Program",
    description: "Turn loyal customers into brand ambassadors with built-in referral bonuses."
  },
  {
    icon: BarChart2,
    title: "Actionable Insights",
    description: "Understand your customer behavior with simple, clear analytics."
  },
  {
    icon: Lightbulb,
    title: "Effortless Management",
    description: "Manage everything from a simple, intuitive dashboard. No tech headaches."
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description: "Built on a robust, secure platform to protect your data and your customers'."
  }
];

const BusinessBenefitsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section className="py-20 px-4 bg-black relative overflow-hidden">
      <AnimatedBackground particleColor="rgba(244, 114, 182, 0.4)" lineColor="rgba(244, 114, 182, 0.15)" />
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.h2
          className="text-4xl font-bold mb-12 text-white"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Grow Your Vape Business
        </motion.h2>
        
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.slice(0, 5).map((benefit, index) => (
            <FeatureCard key={index} {...benefit} />
          ))}
        </div>

        <div className="md:hidden">
          <motion.div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onUpdate={({x}) => {
                const newIndex = Math.round(-x.get() / (window.innerWidth - 32));
                if (newIndex !== currentIndex) setCurrentIndex(newIndex);
            }}
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex-shrink-0 w-full px-2 snap-center">
                <FeatureCard {...benefit} />
              </div>
            ))}
          </motion.div>
          <div className="flex justify-center mt-6 space-x-2">
            {benefits.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const element = document.querySelector('.snap-x');
                  if (element) {
                    element.scrollTo({
                      left: index * (window.innerWidth - 32),
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

export default BusinessBenefitsSection;