import React, { useState } from 'react';
import { Calculator, Plus, Minus, X, Divide } from 'lucide-react';
import { motion } from 'framer-motion';
import MatrixInput from '../MatrixInput';
import MatrixDisplay from '../MatrixDisplay';
import { 
  Matrix, 
  createMatrix, 
  addMatrices, 
  subtractMatrices, 
  multiplyMatrices,
  scalarMultiply 
} from '../../utils/matrixOperations';

const BasicOperations: React.FC = () => {
  const [matrixA, setMatrixA] = useState<Matrix>(createMatrix(2, 2, 0));
  const [matrixB, setMatrixB] = useState<Matrix>(createMatrix(2, 2, 0));
  const [scalar, setScalar] = useState<number>(1);
  const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply' | 'scalar'>('add');
  const [result, setResult] = useState<Matrix | null>(null);
  const [error, setError] = useState<string>('');

  const operations = [
    { key: 'add', label: 'Add (A + B)', icon: Plus, color: 'text-green-600' },
    { key: 'subtract', label: 'Subtract (A - B)', icon: Minus, color: 'text-red-600' },
    { key: 'multiply', label: 'Multiply (A × B)', icon: X, color: 'text-blue-600' },
    { key: 'scalar', label: 'Scalar × A', icon: Calculator, color: 'text-purple-600' },
  ] as const;

  const calculate = () => {
    try {
      setError('');
      let newResult: Matrix;

      switch (operation) {
        case 'add':
          newResult = addMatrices(matrixA, matrixB);
          break;
        case 'subtract':
          newResult = subtractMatrices(matrixA, matrixB);
          break;
        case 'multiply':
          newResult = multiplyMatrices(matrixA, matrixB);
          break;
        case 'scalar':
          newResult = scalarMultiply(matrixA, scalar);
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

  const syncMatrixDimensions = () => {
    if (operation === 'add' || operation === 'subtract') {
      // For addition/subtraction, matrices must have same dimensions
      const rows = Math.max(matrixA.length, matrixB.length);
      const cols = Math.max(matrixA[0]?.length || 0, matrixB[0]?.length || 0);
      
      if (matrixA.length !== rows || matrixA[0]?.length !== cols) {
        setMatrixA(createMatrix(rows, cols, 0));
      }
      if (matrixB.length !== rows || matrixB[0]?.length !== cols) {
        setMatrixB(createMatrix(rows, cols, 0));
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Basic Matrix Operations</h2>
          <p className="text-theme-muted">Addition, subtraction, multiplication, and scalar operations</p>
        </div>
      </motion.div>

      {/* Operation Selection */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
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

      {/* Scalar Input (only for scalar multiplication) */}
      {operation === 'scalar' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-theme-surface p-4 rounded-lg border border-theme-border"
        >
          <label className="block text-sm font-medium text-theme-text mb-2">
            Scalar Value
          </label>
          <input
            type="number"
            step="any"
            value={scalar}
            onChange={(e) => setScalar(parseFloat(e.target.value) || 0)}
            className="w-32 px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent"
            placeholder="Enter scalar"
          />
        </motion.div>
      )}

      {/* Matrix Inputs */}
      <div className="grid md:grid-cols-2 gap-6">
        <MatrixInput
          matrix={matrixA}
          onChange={setMatrixA}
          label="Matrix A"
        />
        
        {operation !== 'scalar' && (
          <MatrixInput
            matrix={matrixB}
            onChange={setMatrixB}
            label="Matrix B"
          />
        )}
      </div>

      {/* Calculate Button */}
      <motion.div className="flex justify-center">
        <button
          onClick={calculate}
          className="px-8 py-3 bg-theme-accent text-theme-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Calculate {operations.find(op => op.key === operation)?.label}
        </button>
      </motion.div>

      {/* Sync Button for Add/Subtract */}
      {(operation === 'add' || operation === 'subtract') && (
        <motion.div className="flex justify-center">
          <button
            onClick={syncMatrixDimensions}
            className="px-4 py-2 bg-theme-border/50 text-theme-muted hover:bg-theme-border hover:text-theme-text rounded-lg transition-colors text-sm"
          >
            Sync Matrix Dimensions
          </button>
        </motion.div>
      )}

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
      {result && (
        <MatrixDisplay
          matrix={result}
          title="Result"
          subtitle={`${operations.find(op => op.key === operation)?.label || ''}`}
        />
      )}
    </div>
  );
};

export default BasicOperations;