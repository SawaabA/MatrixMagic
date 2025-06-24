import React, { useState } from 'react';
import { Calculator, Zap, Navigation, BookOpen, Brain, FunctionSquare as Function } from 'lucide-react';
import { motion } from 'framer-motion';
import BasicOperations from './BasicOperations';
import AdvancedOperations from './AdvancedOperations';
import VectorOperations from './VectorOperations';
import EquationSolver from './EquationSolver';
import AdvancedCalculators from './AdvancedCalculators';

const CalculatorSection: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<'basic' | 'advanced' | 'vectors' | 'equations' | 'functions'>('basic');

  const calculators = [
    {
      key: 'basic',
      label: 'Basic Operations',
      icon: Calculator,
      description: 'Addition, subtraction, multiplication, scalar operations',
      color: 'from-blue-400 to-blue-600'
    },
    {
      key: 'advanced',
      label: 'Advanced Operations',
      icon: Zap,
      description: 'Transpose, determinant, inverse, RREF, rank',
      color: 'from-purple-400 to-purple-600'
    },
    {
      key: 'vectors',
      label: 'Vector Operations',
      icon: Navigation,
      description: 'Dot product, cross product, magnitude, angles',
      color: 'from-green-400 to-green-600'
    },
    {
      key: 'equations',
      label: 'Equation Solver',
      icon: Brain,
      description: 'Solve systems of linear equations Ax = b',
      color: 'from-emerald-400 to-emerald-600'
    },
    {
      key: 'functions',
      label: 'Advanced Functions',
      icon: Function,
      description: 'Characteristic polynomials, matrix functions',
      color: 'from-violet-400 to-violet-600'
    }
  ] as const;

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'basic':
        return <BasicOperations />;
      case 'advanced':
        return <AdvancedOperations />;
      case 'vectors':
        return <VectorOperations />;
      case 'equations':
        return <EquationSolver />;
      case 'functions':
        return <AdvancedCalculators />;
      default:
        return <BasicOperations />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calculator Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {calculators.map(({ key, label, icon: Icon, description, color }) => (
          <motion.button
            key={key}
            onClick={() => setActiveCalculator(key)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${activeCalculator === key 
                ? 'border-theme-accent bg-theme-accent/10 shadow-lg' 
                : 'border-theme-border hover:border-theme-accent/50 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                  activeCalculator === key ? 'text-theme-accent' : 'text-theme-text'
                }`}>
                  {label}
                </h3>
                <p className="text-theme-muted text-sm">{description}</p>
              </div>
            </div>
            {activeCalculator === key && (
              <motion.div
                layoutId="calculator-indicator"
                className="absolute inset-0 border-2 border-theme-accent rounded-xl -z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Calculator Content */}
      <motion.div
        key={activeCalculator}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[600px]"
      >
        {renderCalculator()}
      </motion.div>
    </div>
  );
};

export default CalculatorSection;