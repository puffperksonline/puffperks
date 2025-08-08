
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import VideoShowcaseSection from '@/components/landing/VideoShowcaseSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import StoreDashboardSection from '@/components/landing/StoreDashboardSection';
import CustomerExperienceSection from '@/components/landing/CustomerExperienceSection';
import BusinessBenefitsSection from '@/components/landing/BusinessBenefitsSection';
import PricingSection from '@/components/landing/PricingSection';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Puff Perks - Digital Loyalty Cards for Vape Stores</title>
        <meta name="description" content="Ditch the paper punch cards. Puff Perks is the simplest way to reward your regulars, keep them coming back, and grow your business!" />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-sans">
        <HeroSection />
        <VideoShowcaseSection />
        <HowItWorksSection />
        <StoreDashboardSection />
        <CustomerExperienceSection />
        <BusinessBenefitsSection />
        <PricingSection />
        <Link to="/admin/dashboard" className="fixed bottom-4 left-4 p-2 bg-gray-800/50 rounded-full hover:bg-purple-600/50 transition-colors z-50">
          <Shield className="w-5 h-5 text-gray-400 hover:text-white" />
        </Link>
      </div>
    </>
  );
};

export default LandingPage;
