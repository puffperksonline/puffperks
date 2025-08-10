import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Repeat, Users, BarChart2, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const features = [
  { icon: Zap, text: 'Instant digital stamp cards for every customer' },
  { icon: Repeat, text: 'Automated email campaigns to bring customers back' },
  { icon: Users, text: 'Powerful customer segmentation (New, Loyal, At-Risk)' },
  { icon: BarChart2, text: 'Actionable analytics to track your growth' },
];

const AccordionItem = ({ children }) => {
  return (
    <div className="border-b border-purple-500/20 last:border-b-0">
      {children}
    </div>
  );
};

const AccordionTrigger = ({ children }) => {
  return (
    <div className="flex justify-between items-center py-4 text-left text-lg font-medium text-gray-200 cursor-pointer">
      {children}
    </div>
  );
};

const AccordionContent = ({ children }) => {
  return (
    <div className="pb-4">
      {children}
    </div>
  );
};

const PricingSection = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <section id="pricing-section" className="py-20 px-4 bg-gray-900">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold mb-4 text-white"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to Elevate Your Business?
        </motion.h2>
        <motion.p
          className="text-lg text-gray-400 mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Unlock the full potential of customer loyalty with one simple plan.
        </motion.p>
        
        <motion.div
          className="glass-effect rounded-2xl p-8 border border-purple-500/30"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="flex justify-center items-baseline mb-4">
            <span className="text-5xl font-extrabold text-white">£16.99</span>
            <span className="text-xl text-gray-400 ml-2">/ month</span>
          </div>
          <p className="text-gray-400 mb-6">No contract. Cancel anytime.</p>
          
          <Link to="/store/signup">
            <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 mb-6">
              Start Your Free 7-Day Trial Today!
            </Button>
          </Link>
          
          <AccordionItem>
            <AccordionTrigger>
              <span className="text-gray-200">What's included in my trial?</span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3 text-left">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <Button variant="link" onClick={scrollToTop} className="mt-8 text-gray-400 hover:text-white">
          <ArrowUp className="w-4 h-4 mr-2" />
          Back to top
        </Button>
      </div>
      <Footer />
    </section>
  );
};

export default PricingSection;