import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Zap, QrCode, Mail } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

const StoreDashboardSection = () => {
  return (
    <section className="py-20 px-4 bg-black relative overflow-hidden">
      <AnimatedBackground particleColor="rgba(96, 165, 250, 0.4)" lineColor="rgba(96, 165, 250, 0.15)" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2
          className="text-4xl font-bold mb-12 text-white text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Powerful Store Dashboard
        </motion.h2>
        <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-12">
          <motion.div
            className="md:w-1/2 text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-semibold mb-4 text-pink-400">Manage Everything with Ease</h3>
            <p className="text-lg text-gray-300 mb-4">
              Our intuitive dashboard gives you a complete overview of your loyalty program. Track performance, manage customers, and add stamps—all in one place.
            </p>
            <ul className="space-y-3 text-gray-300 text-lg">
              <li className="flex items-center"><Gauge className="w-5 h-5 text-green-400 mr-2" /> At-a-glance analytics</li>
              <li className="flex items-center"><Zap className="w-5 h-5 text-yellow-400 mr-2" /> Live session tracking</li>
              <li className="flex items-center"><QrCode className="w-5 h-5 text-blue-400 mr-2" /> Easy QR code management</li>
              <li className="flex items-center"><Mail className="w-5 h-5 text-purple-400 mr-2" /> Automated re-engagement emails</li>
            </ul>
          </motion.div>
          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <img  
              src="https://horizons-cdn.hostinger.com/6191c5b2-c451-4eeb-9be2-51ec2f4048c3/e6049edba0d9762c0c2a00fbf61efabf.png" 
              alt="MacBook showing the Puff Perks store owner dashboard" 
              className="w-full rounded-xl shadow-2xl"
             />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StoreDashboardSection;