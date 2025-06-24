import React from 'react';
import { Copy, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Matrix, formatNumber } from '../utils/matrixOperations';

interface MatrixDisplayProps {
  matrix: Matrix;
  title: string;
  subtitle?: string;
  className?: string;
}

const MatrixDisplay: React.FC<MatrixDisplayProps> = ({ 
  matrix, 
  title, 
  subtitle, 
  className = '' 
}) => {
  const copyToClipboard = () => {
    const matrixText = matrix
      .map(row => row.map(val => formatNumber(val)).join('\t'))
      .join('\n');
    
    navigator.clipboard.writeText(matrixText).then(() => {
      // Could add a toast notification here
      console.log('Matrix copied to clipboard');
    });
  };

  const downloadAsCSV = () => {
    const csvContent = matrix
      .map(row => row.map(val => formatNumber(val)).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-text">{title}</h3>
          {subtitle && (
            <p className="text-sm text-theme-muted">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-theme-border/50 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={downloadAsCSV}
            className="p-2 rounded-lg bg-theme-border/50 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
            title="Download as CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1 p-4 bg-theme-surface rounded-lg border border-theme-border">
              {matrix.map((row, rowIndex) => (
                <motion.div 
                  key={rowIndex} 
                  className="flex gap-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                >
                  {row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="w-16 h-12 flex items-center justify-center text-sm font-mono bg-theme-bg border border-theme-border rounded text-theme-text"
                    >
                      {formatNumber(cell)}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix brackets */}
        <div className="absolute left-2 top-4 bottom-4 w-1 border-l-2 border-t-2 border-b-2 border-theme-accent rounded-l"></div>
        <div className="absolute right-2 top-4 bottom-4 w-1 border-r-2 border-t-2 border-b-2 border-theme-accent rounded-r"></div>
      </div>

      <div className="text-xs text-theme-muted">
        Dimensions: {matrix.length} × {matrix[0]?.length || 0}
      </div>
    </motion.div>
  );
};

export default MatrixDisplay;