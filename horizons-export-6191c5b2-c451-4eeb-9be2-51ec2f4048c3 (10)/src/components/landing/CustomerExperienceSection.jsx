import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Repeat, Mail } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

const CustomerExperienceSection = () => {
  return (
    <section className="relative py-20 px-4 bg-black overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <AnimatedBackground particleColor="#00FFFF" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
            >
                <div className="relative w-full max-w-sm mx-auto">
                <div className="aspect-[9/19.5] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <video
                    src="https://puff-perks.b-cdn.net/Phone%204k.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    ></video>
                </div>
                </div>
            </motion.div>
          </div>
          <div className="text-center md:text-left md:order-1">
             <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-6 text-white">Keep Them Coming Back</h2>
                <p className="text-lg text-gray-300 mb-8">
                Delight your customers with a seamless digital experience that turns one-time visitors into loyal regulars.
                </p>
                <div className="block md:hidden mb-8">
                     <div className="relative w-full max-w-sm mx-auto">
                        <div className="aspect-[9/19.5] rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <video
                            src="https://puff-perks.b-cdn.net/Phone%204k.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            ></video>
                        </div>
                    </div>
                </div>
                <ul className="space-y-4 text-left">
                <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-4">
                    <Gift className="w-5 h-5" />
                    </div>
                    <div>
                    <h3 className="font-semibold">Frictionless Loyalty</h3>
                    <p className="text-gray-400">No apps to download. Customers sign up and access their card instantly via QR code.</p>
                    </div>
                </li>
                <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mr-4">
                    <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                    <h3 className="font-semibold">Automated Retention</h3>
                    <p className="text-gray-400">Puff Perks automatically sends email reminders to bring customers back who haven't visited in a while.</p>
                    </div>
                </li>
                <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5" />
                    </div>
                    <div>
                    <h3 className="font-semibold">Targeted Campaigns</h3>
                    <p className="text-gray-400">Use powerful data analytics to send targeted email campaigns directly from your dashboard.</p>
                    </div>
                </li>
                </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerExperienceSection;