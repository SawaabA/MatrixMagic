import React from 'react';
import { Sun, Moon, Palette, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: 'light', icon: Sun, label: 'Light', color: 'text-yellow-500' },
    { key: 'dark', icon: Moon, label: 'Dark', color: 'text-blue-400' },
    { key: 'warm', icon: Palette, label: 'Warm', color: 'text-orange-500' },
    { key: 'contrast', icon: Eye, label: 'High Contrast', color: 'text-purple-500' },
  ] as const;

  return (
    <div className="flex items-center gap-1 p-1 bg-theme-surface border border-theme-border rounded-lg">
      {themes.map(({ key, icon: Icon, label, color }) => (
        <motion.button
          key={key}
          onClick={() => setTheme(key)}
          className={`
            relative p-2 rounded-md transition-all duration-200
            ${theme === key 
              ? 'bg-theme-accent text-theme-bg shadow-sm' 
              : 'text-theme-muted hover:text-theme-text hover:bg-theme-border/50'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={label}
        >
          <Icon size={16} className={theme === key ? '' : color} />
          {theme === key && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-theme-accent rounded-md -z-10"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default ThemeToggle;