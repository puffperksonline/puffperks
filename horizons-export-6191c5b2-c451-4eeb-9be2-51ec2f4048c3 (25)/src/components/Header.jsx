import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, LogIn, UserPlus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
            >
              Puff Perks
            </motion.div>
          </Link>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-purple-900/30">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800/80 backdrop-blur-lg border-gray-700 text-white w-56">
                <DropdownMenuItem onClick={() => navigate('/store/signup')} className="cursor-pointer focus:bg-purple-900/50">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Sign Up</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/login')} className="cursor-pointer focus:bg-purple-900/50">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={() => navigate('/faq')} className="cursor-pointer focus:bg-purple-900/50">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>FAQs</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;