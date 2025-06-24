import React, { useState } from 'react';
import { Calculator, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MatrixInput from '../MatrixInput';
import MatrixDisplay from '../MatrixDisplay';
import { 
  Matrix, 
  Vector,
  createMatrix, 
  multiplyMatrices,
  inverse,
  rref,
  determinant,
  formatNumber 
} from '../../utils/matrixOperations';

interface Solution {
  type: 'unique' | 'infinite' | 'none';
  solution?: Vector;
  message: string;
  steps: string[];
}

const EquationSolver: React.FC = () => {
  const [matrixA, setMatrixA] = useState<Matrix>(createMatrix(3, 3, 0));
  const [vectorB, setVectorB] = useState<Vector>([0, 0, 0]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [error, setError] = useState<string>('');
  const [method, setMethod] = useState<'inverse' | 'rref'>('rref');

  const methods = [
    { key: 'rref', label: 'RREF Method', description: 'Use row reduction to solve' },
    { key: 'inverse', label: 'Matrix Inverse', description: 'Use A⁻¹b when A is invertible' }
  ] as const;

  const solveSystem = () => {
    try {
      setError('');
      
      if (matrixA.length !== vectorB.length) {
        throw new Error('Matrix A and vector b must have compatible dimensions');
      }

      const steps: string[] = [];
      let result: Solution;

      if (method === 'inverse') {
        result = solveByInverse(matrixA, vectorB, steps);
      } else {
        result = solveByRREF(matrixA, vectorB, steps);
      }

      setSolution(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSolution(null);
    }
  };

  const solveByInverse = (A: Matrix, b: Vector, steps: string[]): Solution => {
    steps.push('Method: Matrix Inverse (x = A⁻¹b)');
    
    // Check if matrix is square
    if (A.length !== A[0].length) {
      return {
        type: 'none',
        message: 'Matrix A must be square to use inverse method',
        steps: [...steps, 'Error: Matrix A is not square']
      };
    }

    steps.push(`Matrix A is ${A.length}×${A[0].length} (square matrix)`);

    // Check determinant
    const det = determinant(A);
    steps.push(`Calculate det(A) = ${formatNumber(det)}`);

    if (Math.abs(det) < 1e-10) {
      return {
        type: 'none',
        message: 'Matrix A is singular (determinant = 0), cannot use inverse method',
        steps: [...steps, 'Since det(A) = 0, matrix A is not invertible']
      };
    }

    steps.push('Since det(A) ≠ 0, matrix A is invertible');

    // Calculate inverse
    const AInv = inverse(A);
    steps.push('Calculate A⁻¹');

    // Multiply A⁻¹ by b
    const bMatrix = b.map(val => [val]);
    const xMatrix = multiplyMatrices(AInv, bMatrix);
    const x = xMatrix.map(row => row[0]);

    steps.push('Calculate x = A⁻¹b');
    steps.push(`Solution: x = [${x.map(val => formatNumber(val)).join(', ')}]`);

    return {
      type: 'unique',
      solution: x,
      message: 'Unique solution found using matrix inverse',
      steps
    };
  };

  const solveByRREF = (A: Matrix, b: Vector, steps: string[]): Solution => {
    steps.push('Method: Reduced Row Echelon Form');
    
    // Create augmented matrix [A|b]
    const augmented = A.map((row, i) => [...row, b[i]]);
    steps.push(`Create augmented matrix [A|b] of size ${augmented.length}×${augmented[0].length}`);

    // Apply RREF
    const rrefMatrix = rref(augmented);
    steps.push('Apply row operations to get RREF');

    // Analyze the RREF to determine solution type
    const m = rrefMatrix.length;
    const n = rrefMatrix[0].length - 1; // Exclude the augmented column

    // Check for inconsistency (0 = non-zero)
    for (let i = 0; i < m; i++) {
      const row = rrefMatrix[i];
      const isZeroRow = row.slice(0, n).every(val => Math.abs(val) < 1e-10);
      const augmentedValue = Math.abs(row[n]);
      
      if (isZeroRow && augmentedValue > 1e-10) {
        steps.push(`Row ${i + 1}: [0 0 ... 0 | ${formatNumber(row[n])}] indicates inconsistency`);
        return {
          type: 'none',
          message: 'No solution exists (inconsistent system)',
          steps: [...steps, 'System is inconsistent: 0 = non-zero']
        };
      }
    }

    // Count pivot columns
    let pivotCount = 0;
    const pivotCols: number[] = [];
    
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (Math.abs(rrefMatrix[i][j]) > 1e-10) {
          pivotCount++;
          pivotCols.push(j);
          break;
        }
      }
    }

    steps.push(`Found ${pivotCount} pivot columns out of ${n} variables`);

    if (pivotCount === n) {
      // Unique solution
      const solution = new Array(n).fill(0);
      
      for (let i = 0; i < pivotCount; i++) {
        const pivotCol = pivotCols[i];
        solution[pivotCol] = rrefMatrix[i][n];
      }

      steps.push('Since number of pivots equals number of variables, solution is unique');
      steps.push(`Solution: x = [${solution.map(val => formatNumber(val)).join(', ')}]`);

      return {
        type: 'unique',
        solution,
        message: 'Unique solution found',
        steps
      };
    } else {
      // Infinite solutions
      steps.push('Since number of pivots < number of variables, infinite solutions exist');
      steps.push(`Free variables: ${n - pivotCount}`);
      
      return {
        type: 'infinite',
        message: `Infinite solutions exist with ${n - pivotCount} free variable(s)`,
        steps: [...steps, 'Express solution in terms of free variables']
      };
    }
  };

  const updateVectorB = (index: number, value: string) => {
    const newVector = [...vectorB];
    newVector[index] = parseFloat(value) || 0;
    setVectorB(newVector);
  };

  const syncDimensions = () => {
    const rows = matrixA.length;
    if (vectorB.length !== rows) {
      const newVector = Array(rows).fill(0);
      for (let i = 0; i < Math.min(vectorB.length, rows); i++) {
        newVector[i] = vectorB[i];
      }
      setVectorB(newVector);
    }
  };

  // Auto-sync dimensions when matrix changes
  React.useEffect(() => {
    syncDimensions();
  }, [matrixA.length]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Matrix Equation Solver</h2>
          <p className="text-theme-muted">Solve systems of linear equations Ax = b</p>
        </div>
      </motion.div>

      {/* Method Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {methods.map(({ key, label, description }) => (
          <button
            key={key}
            onClick={() => setMethod(key)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${method === key 
                ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' 
                : 'border-theme-border hover:border-theme-accent/50 text-theme-text'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 ${method === key ? 'text-theme-accent' : 'text-theme-muted'}`} />
              <div>
                <div className="font-semibold">{label}</div>
                <div className="text-sm text-theme-muted">{description}</div>
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Input Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Matrix A */}
        <div className="lg:col-span-2">
          <MatrixInput
            matrix={matrixA}
            onChange={setMatrixA}
            label="Coefficient Matrix A"
          />
        </div>

        {/* Vector b */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-theme-text">Constants Vector b</h3>
          <div className="space-y-2">
            {vectorB.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <label className="w-8 text-sm font-medium text-theme-muted">
                  b{index + 1}:
                </label>
                <input
                  type="number"
                  step="any"
                  value={value === 0 ? '' : formatNumber(value)}
                  onChange={(e) => updateVectorB(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          
          <div className="text-sm text-theme-muted">
            Vector b: [{vectorB.map(val => formatNumber(val)).join(', ')}]
          </div>
        </motion.div>
      </div>

      {/* Solve Button */}
      <motion.div className="flex justify-center">
        <button
          onClick={solveSystem}
          className="px-8 py-3 bg-theme-accent text-theme-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Solve System Ax = b
        </button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 font-medium">Error: {error}</p>
        </motion.div>
      )}

      {/* Solution Display */}
      {solution && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Solution Summary */}
          <div className={`p-6 rounded-lg border-2 ${
            solution.type === 'unique' ? 'border-green-200 bg-green-50' :
            solution.type === 'infinite' ? 'border-blue-200 bg-blue-50' :
            'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {solution.type === 'unique' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : solution.type === 'infinite' ? (
                <Zap className="w-6 h-6 text-blue-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <h3 className={`text-xl font-bold ${
                solution.type === 'unique' ? 'text-green-800' :
                solution.type === 'infinite' ? 'text-blue-800' :
                'text-red-800'
              }`}>
                {solution.type === 'unique' ? 'Unique Solution' :
                 solution.type === 'infinite' ? 'Infinite Solutions' :
                 'No Solution'}
              </h3>
            </div>
            <p className={`${
              solution.type === 'unique' ? 'text-green-700' :
              solution.type === 'infinite' ? 'text-blue-700' :
              'text-red-700'
            }`}>
              {solution.message}
            </p>
            
            {solution.solution && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2">Solution Vector x:</h4>
                <div className="font-mono text-lg">
                  x = [{solution.solution.map(val => formatNumber(val)).join(', ')}]
                </div>
              </div>
            )}
          </div>

          {/* Solution Steps */}
          <div className="bg-theme-surface rounded-lg border border-theme-border p-6">
            <h3 className="text-lg font-semibold text-theme-text mb-4">Solution Steps</h3>
            <div className="space-y-2">
              {solution.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-6 h-6 bg-theme-accent/20 text-theme-accent rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-theme-text">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EquationSolver;