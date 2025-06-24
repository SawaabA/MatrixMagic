import React, { useState } from 'react';
import { Eye, Move3D, BarChart3, Gamepad2, Play, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import VisualizationCanvas from './VisualizationCanvas';
import ThreeDVisualization from './ThreeDVisualization';
import RealWorldApplications from './RealWorldApplications';
import InteractiveAnimations from './InteractiveAnimations';

const VisualizationSection: React.FC = () => {
  const [activeViz, setActiveViz] = useState<'2d' | '3d' | 'applications' | 'animations'>('2d');

  const visualizations = [
    {
      key: '2d',
      label: '2D Visualizations',
      icon: Eye,
      description: 'Interactive 2D vector and matrix visualizations',
      color: 'from-blue-400 to-blue-600'
    },
    {
      key: '3d',
      label: '3D Visualizations',
      icon: Move3D,
      description: '3D vector operations and transformations',
      color: 'from-purple-400 to-purple-600'
    },
    {
      key: 'applications',
      label: 'Real-World Applications',
      icon: Gamepad2,
      description: 'See linear algebra in computer graphics, data science, and physics',
      color: 'from-green-400 to-green-600'
    },
    {
      key: 'animations',
      label: 'Interactive Animations',
      icon: Play,
      description: 'Step-by-step algorithm visualizations',
      color: 'from-pink-400 to-pink-600'
    }
  ] as const;

  const renderVisualization = () => {
    switch (activeViz) {
      case '2d':
        return <VisualizationCanvas />;
      case '3d':
        return <ThreeDVisualization />;
      case 'applications':
        return <RealWorldApplications />;
      case 'animations':
        return <InteractiveAnimations />;
      default:
        return <VisualizationCanvas />;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg">
          <Eye className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Interactive Visualizations</h2>
          <p className="text-theme-muted">See linear algebra concepts come to life with interactive graphics</p>
        </div>
      </motion.div>

      {/* Visualization Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {visualizations.map(({ key, label, icon: Icon, description, color }) => (
          <motion.button
            key={key}
            onClick={() => setActiveViz(key)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${activeViz === key 
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
                  activeViz === key ? 'text-theme-accent' : 'text-theme-text'
                }`}>
                  {label}
                </h3>
                <p className="text-theme-muted text-sm">{description}</p>
              </div>
            </div>
            {activeViz === key && (
              <motion.div
                layoutId="viz-indicator"
                className="absolute inset-0 border-2 border-theme-accent rounded-xl -z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Visualization Content */}
      <motion.div
        key={activeViz}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[600px]"
      >
        {renderVisualization()}
      </motion.div>
    </div>
  );
};

export default VisualizationSection;