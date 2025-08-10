import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPolicyPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Puff Perks</title>
        <meta name="description" content="Learn how Puff Perks collects, uses, and protects your personal information." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-300 font-sans p-4 sm:p-6 lg:p-8">
        <header className="max-w-4xl mx-auto mb-8 text-center">
            <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
            >
                Privacy Policy
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-4 text-lg text-gray-400"
            >
                Last Updated: 8 August 2025
            </motion.p>
        </header>
        
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="prose prose-invert prose-lg max-w-4xl mx-auto bg-gray-800/50 rounded-xl shadow-lg p-6 md:p-10"
        >
            <motion.p variants={itemVariants}>
                Welcome to Puff Perks ("we," "our," or "us"). We are committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, and protect the personal information of our users, which include both the customers of the stores we partner with ("Customers") and the store owners themselves ("Store Owners").
            </motion.p>

            <motion.h2 variants={itemVariants}>1. Information We Collect</motion.h2>
            <motion.p variants={itemVariants}>
                <strong>From Store Owners:</strong> We collect your first name, store name, and email address upon registration. All payment information is processed securely by our third-party payment processor, Stripe. We do not store your credit card details.
            </motion.p>
            <motion.p variants={itemVariants}>
                <strong>From Customers:</strong> When you sign up for a digital loyalty card for a specific store, we collect your full name, email address, and the name of the store you are signing up with.
            </motion.p>
            <motion.p variants={itemVariants}>
                <strong>Usage Data:</strong> We collect information on how frequently Customers receive loyalty stamps. This data is aggregated and used for read-only analytics to help Store Owners understand the performance of their loyalty program. We do not track the specific items you purchase.
            </motion.p>
            <motion.p variants={itemVariants}>
                <strong>Location Data (Future Feature):</strong> For Store Owners who opt into our multi-location service, we will be required to collect periodic GPS location data from the browser used to access the Store Owner dashboard. This is solely for the purpose of verifying that the service is being used at the registered store location.
            </motion.p>

            <motion.h2 variants={itemVariants}>2. How We Use Your Information</motion.h2>
            <motion.p variants={itemVariants}>Your information is used for the following purposes:</motion.p>
            <motion.ul variants={itemVariants}>
                <li>To provide and manage your account and our services.</li>
                <li>To operate the digital loyalty card system, including tracking stamps and rewards.</li>
                <li>To provide Store Owners with a dashboard to view customer analytics and manage their loyalty program.</li>
                <li>To send transactional emails, such as account verification or password resets.</li>
                <li>To process subscription payments for Store Owners via Stripe.</li>
                <li>To ensure compliance with our Terms of Service, such as verifying the location of multi-store accounts.</li>
            </motion.ul>
            <motion.p variants={itemVariants}>
                We do not, and will never, sell or share your personal data with third-party companies for marketing purposes.
            </motion.p>

            <motion.h2 variants={itemVariants}>3. Data Storage and Security</motion.h2>
            <motion.p variants={itemVariants}>
                Your data is stored on secure servers. We take all reasonable steps to protect your personal information from loss, misuse, and unauthorized access. All payment transactions are encrypted and handled by Stripe.
            </motion.p>

            <motion.h2 variants={itemVariants}>4. Your Data Rights (GDPR)</motion.h2>
            <motion.p variants={itemVariants}>As a user, you have rights over your personal data:</motion.p>
            <motion.ul variants={itemVariants}>
                <li><strong>Right to Access:</strong> You can request a copy of the data we hold about you.</li>
                <li><strong>Right to Rectification:</strong> You can correct any inaccurate information we hold.</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> Both Customers and Store Owners can delete their accounts and associated data directly from the settings/dashboard area of our service. Upon a deletion request, your data will be permanently removed from our systems within 30 days.</li>
            </motion.ul>

            <motion.h2 variants={itemVariants}>5. Third-Party Services</motion.h2>
            <motion.p variants={itemVariants}>
                <strong>Stripe:</strong> We use Stripe for payment processing. Their use of your personal information is governed by their privacy policy, which you can review on their website.
            </motion.p>

            <motion.h2 variants={itemVariants}>6. Changes to This Policy</motion.h2>
            <motion.p variants={itemVariants}>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or through a notice on our website.
            </motion.p>

            <motion.h2 variants={itemVariants}>7. Contact Us</motion.h2>
            <motion.p variants={itemVariants}>
                If you have any questions about this Privacy Policy, please contact us at help@puffperks.online.
            </motion.p>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-12"
        >
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;