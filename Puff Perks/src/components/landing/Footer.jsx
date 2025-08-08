import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { toast } = useToast();

  return (
    <footer className="py-10 px-4 bg-black text-center text-gray-400 w-full">
      <div className="max-w-6xl mx-auto">
        <span className="text-lg font-semibold text-white mb-2 block">Puff Perks</span>
        <span className="text-sm">&copy; {new Date().getFullYear()} All rights reserved.</span>
        <div className="flex justify-center space-x-4 mt-4">
          <Link to="#" className="text-gray-400 hover:text-white transition-colors duration-300" onClick={() => toast({ title: "🚧 Feature Coming Soon", description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>
            Privacy Policy
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white transition-colors duration-300" onClick={() => toast({ title: "🚧 Feature Coming Soon", description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;