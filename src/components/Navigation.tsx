import React, { useState } from 'react';
import { Calculator, BookOpen, Menu, X, Sparkles, Home, Trophy, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'visualizations', label: 'Visualizations', icon: Eye },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-theme-surface/95 backdrop-blur-sm border-b border-theme-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-2 bg-gradient-to-br from-magic-400 to-magic-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-theme-text">MatrixMagic</h1>
              <p className="text-xs text-theme-muted">Linear Algebra Hub</p>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${activeTab === id 
                      ? 'text-theme-accent bg-theme-accent/10' 
                      : 'text-theme-muted hover:text-theme-text hover:bg-theme-border/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    {label}
                  </div>
                  {activeTab === id && (
                    <motion.div
                      
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-theme-accent/10 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border/50 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-theme-border"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${activeTab === id 
                      ? 'text-theme-accent bg-theme-accent/10' 
                      : 'text-theme-muted hover:text-theme-text hover:bg-theme-border/50'
                    }
                  `}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={18} />
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;