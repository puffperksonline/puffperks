import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 border-t border-gray-800/50 text-gray-400">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm">&copy; {currentYear} Puff Perks. All Rights Reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="text-sm hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/faq" className="text-sm hover:text-white transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;