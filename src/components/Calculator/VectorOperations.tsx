import React, { useState } from 'react';
import { Navigation, Move3D, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  dotProduct, 
  crossProduct, 
  vectorMagnitude, 
  normalizeVector, 
  angleBetweenVectors,
  formatNumber 
} from '../../utils/matrixOperations';

const VectorOperations: React.FC = () => {
  const [vectorA, setVectorA] = useState<number[]>([1, 0, 0]);
  const [vectorB, setVectorB] = useState<number[]>([0, 1, 0]);
  const [operation, setOperation] = useState<'dot' | 'cross' | 'magnitude' | 'normalize' | 'angle'>('dot');
  const [result, setResult] = useState<number[] | number | null>(null);
  const [error, setError] = useState<string>('');

  const operations = [
    { key: 'dot', label: 'Dot Product (A · B)', icon: Navigation, color: 'text-blue-600', needsBoth: true },
    { key: 'cross', label: 'Cross Product (A × B)', icon: Move3D, color: 'text-green-600', needsBoth: true, needs3D: true },
    { key: 'magnitude', label: 'Magnitude |A|', icon: Compass, color: 'text-purple-600', needsBoth: false },
    { key: 'normalize', label: 'Normalize A', icon: Navigation, color: 'text-orange-600', needsBoth: false },
    { key: 'angle', label: 'Angle between A & B', icon: Compass, color: 'text-red-600', needsBoth: true },
  ] as const;

  const handleVectorChange = (vector: 'A' | 'B', index: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    
    if (vector === 'A') {
      const newVector = [...vectorA];
      newVector[index] = numValue;
      setVectorA(newVector);
    } else {
      const newVector = [...vectorB];
      newVector[index] = numValue;
      setVectorB(newVector);
    }
  };

  const addDimension = () => {
    setVectorA([...vectorA, 0]);
    setVectorB([...vectorB, 0]);
  };

  const removeDimension = () => {
    if (vectorA.length > 2) {
      setVectorA(vectorA.slice(0, -1));
      setVectorB(vectorB.slice(0, -1));
    }
  };

  const calculate = () => {
    try {
      setError('');
      const selectedOp = operations.find(op => op.key === operation);
      
      if (selectedOp?.needs3D && vectorA.length !== 3) {
        throw new Error('Cross product requires 3D vectors');
      }

      let newResult: number[] | number;

      switch (operation) {
        case 'dot':
          newResult = dotProduct(vectorA, vectorB);
          break;
        case 'cross':
          newResult = crossProduct(vectorA, vectorB);
          break;
        case 'magnitude':
          newResult = vectorMagnitude(vectorA);
          break;
        case 'normalize':
          newResult = normalizeVector(vectorA);
          break;
        case 'angle':
          newResult = angleBetweenVectors(vectorA, vectorB) * (180 / Math.PI); // Convert to degrees
          break;
        default:
          throw new Error('Invalid operation');
      }

      setResult(newResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
    }
  };

  const selectedOperation = operations.find(op => op.key === operation);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
          <Navigation className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Vector Operations</h2>
          <p className="text-theme-muted">Dot product, cross product, magnitude, normalization, and angles</p>
        </div>
      </motion.div>

      {/* Operation Selection */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {operations.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setOperation(key)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${operation === key 
                ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' 
                : 'border-theme-border hover:border-theme-accent/50 text-theme-muted hover:text-theme-text'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className={`w-6 h-6 ${operation === key ? 'text-theme-accent' : color}`} />
              <div className="text-sm font-medium text-center">{label}</div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Dimension Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-4 p-4 bg-theme-surface rounded-lg border border-theme-border"
      >
        <button
          onClick={removeDimension}
          disabled={vectorA.length <= 2}
          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Remove Dimension
        </button>
        
        <div className="text-theme-text font-medium">
          {vectorA.length}D Vectors
        </div>
        
        <button
          onClick={addDimension}
          disabled={vectorA.length >= 6}
          className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Dimension
        </button>
      </motion.div>

      {/* Vector Inputs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vector A */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-theme-text">Vector A</h3>
          <div className="grid gap-2">
            {vectorA.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <label className="w-8 text-sm font-medium text-theme-muted">
                  {String.fromCharCode(120 + index)}:
                </label>
                <input
                  type="number"
                  step="any"
                  value={value === 0 ? '' : formatNumber(value)}
                  onChange={(e) => handleVectorChange('A', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="text-sm text-theme-muted">
            Magnitude: {formatNumber(vectorMagnitude(vectorA))}
          </div>
        </motion.div>

        {/* Vector B */}
        {selectedOperation?.needsBoth && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-theme-text">Vector B</h3>
            <div className="grid gap-2">
              {vectorB.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <label className="w-8 text-sm font-medium text-theme-muted">
                    {String.fromCharCode(120 + index)}:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={value === 0 ? '' : formatNumber(value)}
                    onChange={(e) => handleVectorChange('B', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm text-theme-muted">
              Magnitude: {formatNumber(vectorMagnitude(vectorB))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Calculate Button */}
      <motion.div className="flex justify-center">
        <button
          onClick={calculate}
          className="px-8 py-3 bg-theme-accent text-theme-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Calculate {selectedOperation?.label}
        </button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-700 font-medium">Error: {error}</p>
        </motion.div>
      )}

      {/* Result Display */}
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-theme-surface rounded-lg border border-theme-border"
        >
          <h3 className="text-lg font-semibold text-theme-text mb-4">
            {selectedOperation?.label} Result
          </h3>
          
          {typeof result === 'number' ? (
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-theme-accent">
                {formatNumber(result)}
              </div>
              {operation === 'angle' && (
                <div className="text-sm text-theme-muted mt-2">degrees</div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-theme-muted">Vector components:</div>
              <div className="flex gap-2 justify-center">
                {(result as number[]).map((value, index) => (
                  <div key={index} className="px-3 py-2 bg-theme-bg border border-theme-border rounded text-center">
                    <div className="text-xs text-theme-muted mb-1">
                      {String.fromCharCode(120 + index)}
                    </div>
                    <div className="font-mono text-theme-text">
                      {formatNumber(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VectorOperations;