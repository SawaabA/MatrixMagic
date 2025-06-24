import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import CalculatorSection from './components/Calculator/CalculatorSection';
import NotesSection from './components/Notes/NotesSection';
import PracticeSection from './components/Practice/PracticeSection';
import VisualizationSection from './components/Visualizations/VisualizationSection';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'calculator' | 'notes' | 'practice' | 'visualizations'>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onGetStarted={() => setActiveTab('calculator')} />;
      case 'calculator':
        return <CalculatorSection />;
      case 'notes':
        return <NotesSection />;
      case 'practice':
        return <PracticeSection />;
      case 'visualizations':
        return <VisualizationSection />;
      default:
        return <LandingPage onGetStarted={() => setActiveTab('calculator')} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-theme-bg transition-colors duration-300">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className={activeTab === 'home' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {activeTab !== 'home' && (
          <footer className="border-t border-theme-border bg-theme-surface/50 backdrop-blur-sm mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <p className="text-theme-muted mb-2">
                  Built with ❤️ for students learning linear algebra
                </p>
                <p className="text-theme-muted text-sm">
                  MatrixMagic © 2025 - Making linear algebra accessible and fun
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;