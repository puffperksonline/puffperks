import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Rocket, Star } from 'lucide-react';
import Header from '@/components/Header';

const PricingTier = ({ title, price, description, features, popular = false }) => (
  <motion.div
    whileHover={{ y: -10, boxShadow: "0 20px 30px -10px rgba(139, 92, 246, 0.3)" }}
    className={`relative bg-gray-800/50 p-8 rounded-2xl border ${popular ? 'border-purple-500' : 'border-gray-700'} flex flex-col`}
  >
    {popular && (
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold rounded-full">
          Most Popular
        </span>
      </div>
    )}
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-6">{description}</p>
    <div className="mb-8">
      <span className="text-5xl font-extrabold text-white">{price}</span>
      <span className="text-gray-400">/month</span>
    </div>
    <ul className="space-y-4 text-gray-300 mb-10 flex-grow">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Link to="/store/signup" className="mt-auto">
      <Button
        size="lg"
        className={`w-full font-bold py-3 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 ${popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' : 'bg-purple-900/50 hover:bg-purple-900/80 text-white'}`}
      >
        Start 7-Day Free Trial
      </Button>
    </Link>
  </motion.div>
);

const PricingPage = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - Puff Perks</title>
        <meta name="description" content="Simple, transparent pricing for Puff Perks. Start with a 7-day free trial, no credit card required. Grow your vape store with our powerful loyalty platform." />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the perfect plan to grow your business. All plans start with a{' '}
              <span className="text-purple-400 font-semibold">7-day free trial, no credit card required.</span>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingTier
              title="Starter"
              price="$29"
              description="For new shops ready to build a loyal following."
              features={[
                "Up to 250 Customers",
                "Digital Stamp Cards",
                "Customizable Rewards",
                "QR Code Signup",
                "Basic Analytics",
                "Email Support"
              ]}
            />
            <PricingTier
              title="Growth"
              price="$59"
              description="The perfect plan for growing stores focused on retention."
              features={[
                "Up to 1,000 Customers",
                "All Starter Features",
                "Customer Referral Program",
                "Location-specific Customization",
                "Advanced Analytics",
                "Priority Email Support"
              ]}
              popular={true}
            />
            <PricingTier
              title="Pro"
              price="$99"
              description="For established businesses aiming to maximize loyalty."
              features={[
                "Unlimited Customers",
                "All Growth Features",
                "Automated Email Campaigns (Coming Soon)",
                "Customer Segmentation",
                "API Access (Coming Soon)",
                "Dedicated Account Manager"
              ]}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-center mt-20 bg-gray-800/40 p-10 rounded-2xl max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Not Sure Which Plan is Right?</h2>
            <p className="text-lg text-gray-400 mb-8">
              Don't worry. Every feature is unlocked during your 7-day free trial. Experience the full power of Puff Perks and decide later.
            </p>
            <Link to="/store/signup">
              <Button
                size="lg"
                className="bg-white text-purple-800 hover:bg-gray-100 font-bold py-3 px-10 rounded-full shadow-xl transform transition-transform duration-300 hover:scale-105"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Claim Your Free Trial Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;