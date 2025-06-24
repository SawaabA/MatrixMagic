import React, { useState } from 'react';
import { Zap, RotateCw, Hash, TrendingUp, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixInput from '../MatrixInput';
import MatrixDisplay from '../MatrixDisplay';
import StepByStepMode from './StepByStepMode';
import { 
  Matrix, 
  createMatrix, 
  transpose, 
  determinant, 
  inverse,
  rref,
  rank 
} from '../../utils/matrixOperations';

const AdvancedOperations: React.FC = () => {
  const [matrix, setMatrix] = useState<Matrix>(createMatrix(3, 3, 0));
  const [operation, setOperation] = useState<'transpose' | 'determinant' | 'inverse' | 'rref' | 'rank'>('transpose');
  const [result, setResult] = useState<Matrix | number | null>(null);
  const [error, setError] = useState<string>('');
  const [showStepByStep, setShowStepByStep] = useState(false);

  const operations = [
    { key: 'transpose', label: 'Transpose (Aᵀ)', icon: RotateCw, color: 'text-blue-600', requiresSquare: false, hasSteps: false },
    { key: 'determinant', label: 'Determinant', icon: Hash, color: 'text-green-600', requiresSquare: true, hasSteps: false },
    { key: 'inverse', label: 'Inverse (A⁻¹)', icon: Zap, color: 'text-purple-600', requiresSquare: true, hasSteps: true },
    { key: 'rref', label: 'RREF', icon: TrendingUp, color: 'text-orange-600', requiresSquare: false, hasSteps: true },
    { key: 'rank', label: 'Rank', icon: Hash, color: 'text-red-600', requiresSquare: false, hasSteps: false },
  ] as const;

  const calculate = () => {
    try {
      setError('');
      
      // Check if operation requires square matrix
      const selectedOp = operations.find(op => op.key === operation);
      if (selectedOp?.requiresSquare && matrix.length !== matrix[0].length) {
        throw new Error('This operation requires a square matrix');
      }

      let newResult: Matrix | number;

      switch (operation) {
        case 'transpose':
          newResult = transpose(matrix);
          break;
        case 'determinant':
          newResult = determinant(matrix);
          break;
        case 'inverse':
          newResult = inverse(matrix);
          break;
        case 'rref':
          newResult = rref(matrix);
          break;
        case 'rank':
          newResult = rank(matrix);
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

  const makeSquareMatrix = () => {
    const size = Math.max(matrix.length, matrix[0]?.length || 0);
    const newMatrix = createMatrix(size, size, 0);
    
    // Copy existing values
    for (let i = 0; i < Math.min(matrix.length, size); i++) {
      for (let j = 0; j < Math.min(matrix[0]?.length || 0, size); j++) {
        newMatrix[i][j] = matrix[i][j];
      }
    }
    
    setMatrix(newMatrix);
  };

  const selectedOperation = operations.find(op => op.key === operation);
  const isSquareRequired = selectedOperation?.requiresSquare || false;
  const isSquare = matrix.length === matrix[0]?.length;
  const hasStepByStep = selectedOperation?.hasSteps && (operation === 'rref' || operation === 'inverse');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Advanced Matrix Operations</h2>
          <p className="text-theme-muted">Transpose, determinant, inverse, RREF, and rank calculations</p>
        </div>
      </motion.div>

      {/* Operation Selection */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {operations.map(({ key, label, icon: Icon, color, requiresSquare, hasSteps }) => (
          <button
            key={key}
            onClick={() => setOperation(key)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 relative
              ${operation === key 
                ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' 
                : 'border-theme-border hover:border-theme-accent/50 text-theme-muted hover:text-theme-text'
              }
              ${requiresSquare && !isSquare ? 'opacity-60' : ''}
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className={`w-6 h-6 ${operation === key ? 'text-theme-accent' : color}`} />
              <div className="text-sm font-medium text-center">{label}</div>
              {requiresSquare && (
                <div className="text-xs text-theme-muted">Square only</div>
              )}
              {hasSteps && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </motion.div>

      {/* Square Matrix Warning */}
      {isSquareRequired && !isSquare && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-medium">Square Matrix Required</p>
              <p className="text-yellow-700 text-sm">This operation requires a square matrix (equal rows and columns).</p>
            </div>
            <button
              onClick={makeSquareMatrix}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Make Square
            </button>
          </div>
        </motion.div>
      )}

      {/* Matrix Input */}
      <MatrixInput
        matrix={matrix}
        onChange={setMatrix}
        label="Matrix A"
      />

      {/* Calculate Button */}
      <motion.div className="flex justify-center gap-4">
        <button
          onClick={calculate}
          disabled={isSquareRequired && !isSquare}
          className="px-8 py-3 bg-theme-accent text-theme-bg font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Calculate {selectedOperation?.label}
        </button>
        
        {hasStepByStep && (
          <button
            onClick={() => setShowStepByStep(true)}
            disabled={isSquareRequired && !isSquare}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className="w-5 h-5" />
            Show Me How
          </button>
        )}
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
        <div>
          {typeof result === 'number' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-theme-surface rounded-lg border border-theme-border text-center"
            >
              <h3 className="text-lg font-semibold text-theme-text mb-2">
                {selectedOperation?.label} Result
              </h3>
              <div className="text-3xl font-mono font-bold text-theme-accent">
                {typeof result === 'number' ? result.toFixed(4) : result}
              </div>
            </motion.div>
          ) : (
            <MatrixDisplay
              matrix={result as Matrix}
              title="Result"
              subtitle={selectedOperation?.label || ''}
            />
          )}
        </div>
      )}

      {/* Step-by-Step Modal */}
      <AnimatePresence>
        {showStepByStep && hasStepByStep && (
          <StepByStepMode
            matrix={matrix}
            operation={operation as 'rref' | 'inverse'}
            onClose={() => setShowStepByStep(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedOperations;