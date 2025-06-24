import React, { useState } from 'react';
import { Brain, Zap, Calculator, FunctionSquare as Function } from 'lucide-react';
import { motion } from 'framer-motion';
import MatrixInput from '../MatrixInput';
import MatrixDisplay from '../MatrixDisplay';
import { 
  Matrix, 
  createMatrix, 
  formatNumber,
  multiplyMatrices,
  addMatrices,
  scalarMultiply 
} from '../../utils/matrixOperations';

interface PolynomialResult {
  coefficients: number[];
  polynomial: string;
  roots?: number[];
}

const AdvancedCalculators: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<'polynomial' | 'matrix-functions'>('polynomial');
  const [matrix, setMatrix] = useState<Matrix>(createMatrix(2, 2, 0));
  const [result, setResult] = useState<Matrix | PolynomialResult | null>(null);
  const [error, setError] = useState<string>('');
  const [functionType, setFunctionType] = useState<'exp' | 'sin' | 'cos' | 'power'>('exp');
  const [powerValue, setPowerValue] = useState<number>(2);

  const calculators = [
    {
      key: 'polynomial',
      label: 'Characteristic Polynomial',
      icon: Function,
      description: 'Find characteristic polynomial det(A - λI)',
      color: 'from-purple-400 to-purple-600'
    },
    {
      key: 'matrix-functions',
      label: 'Matrix Functions',
      icon: Brain,
      description: 'Calculate matrix exponential, sine, cosine, and powers',
      color: 'from-indigo-400 to-indigo-600'
    }
  ] as const;

  const calculateCharacteristicPolynomial = (A: Matrix): PolynomialResult => {
    const n = A.length;
    if (n !== A[0].length) {
      throw new Error('Matrix must be square');
    }

    if (n === 2) {
      // For 2x2 matrix [[a,b],[c,d]], characteristic polynomial is λ² - (a+d)λ + (ad-bc)
      const a = A[0][0];
      const b = A[0][1];
      const c = A[1][0];
      const d = A[1][1];
      
      const trace = a + d;
      const det = a * d - b * c;
      
      const coefficients = [1, -trace, det]; // λ² - trace*λ + det
      
      // Format polynomial
      let polynomial = 'λ²';
      if (trace !== 0) {
        polynomial += trace > 0 ? ` - ${formatNumber(trace)}λ` : ` + ${formatNumber(-trace)}λ`;
      }
      if (det !== 0) {
        polynomial += det > 0 ? ` + ${formatNumber(det)}` : ` - ${formatNumber(-det)}`;
      }
      
      // Calculate roots (eigenvalues)
      const discriminant = trace * trace - 4 * det;
      let roots: number[] = [];
      
      if (discriminant >= 0) {
        const sqrt_disc = Math.sqrt(discriminant);
        roots = [
          (trace + sqrt_disc) / 2,
          (trace - sqrt_disc) / 2
        ];
      }
      
      return { coefficients, polynomial, roots };
    } else {
      // For larger matrices, use a simplified approach
      // This is a basic implementation - in practice, you'd use more sophisticated algorithms
      throw new Error('Characteristic polynomial calculation for matrices larger than 2×2 is not implemented in this demo');
    }
  };

  const calculateMatrixFunction = (A: Matrix, func: string, power?: number): Matrix => {
    const n = A.length;
    if (n !== A[0].length) {
      throw new Error('Matrix must be square');
    }

    switch (func) {
      case 'power':
        if (!power || power < 0) {
          throw new Error('Power must be a positive integer');
        }
        return matrixPower(A, power);
      
      case 'exp':
        return matrixExponential(A);
      
      case 'sin':
        return matrixSine(A);
      
      case 'cos':
        return matrixCosine(A);
      
      default:
        throw new Error('Unknown function type');
    }
  };

  const matrixPower = (A: Matrix, power: number): Matrix => {
    if (power === 0) {
      // Return identity matrix
      const n = A.length;
      const identity = createMatrix(n, n, 0);
      for (let i = 0; i < n; i++) {
        identity[i][i] = 1;
      }
      return identity;
    }
    
    if (power === 1) {
      return A;
    }
    
    let result = A;
    for (let i = 1; i < power; i++) {
      result = multiplyMatrices(result, A);
    }
    
    return result;
  };

  const matrixExponential = (A: Matrix): Matrix => {
    // Use Taylor series: e^A = I + A + A²/2! + A³/3! + ...
    // We'll compute first few terms for approximation
    const n = A.length;
    const identity = createMatrix(n, n, 0);
    for (let i = 0; i < n; i++) {
      identity[i][i] = 1;
    }
    
    let result = identity; // I
    let term = identity; // Current term in series
    let factorial = 1;
    
    // Compute first 10 terms
    for (let k = 1; k <= 10; k++) {
      factorial *= k;
      term = multiplyMatrices(term, A);
      const scaledTerm = scalarMultiply(term, 1 / factorial);
      result = addMatrices(result, scaledTerm);
    }
    
    return result;
  };

  const matrixSine = (A: Matrix): Matrix => {
    // Use Taylor series: sin(A) = A - A³/3! + A⁵/5! - ...
    const n = A.length;
    let result = A; // First term
    let term = A;
    let factorial = 1;
    let sign = -1;
    
    // Compute first few odd terms
    for (let k = 3; k <= 9; k += 2) {
      factorial *= (k - 1) * k;
      term = multiplyMatrices(multiplyMatrices(term, A), A);
      const scaledTerm = scalarMultiply(term, sign / factorial);
      result = addMatrices(result, scaledTerm);
      sign *= -1;
    }
    
    return result;
  };

  const matrixCosine = (A: Matrix): Matrix => {
    // Use Taylor series: cos(A) = I - A²/2! + A⁴/4! - ...
    const n = A.length;
    const identity = createMatrix(n, n, 0);
    for (let i = 0; i < n; i++) {
      identity[i][i] = 1;
    }
    
    let result = identity; // First term
    let term = identity;
    let factorial = 1;
    let sign = -1;
    
    // Compute first few even terms
    for (let k = 2; k <= 8; k += 2) {
      factorial *= (k - 1) * k;
      term = multiplyMatrices(multiplyMatrices(term, A), A);
      const scaledTerm = scalarMultiply(term, sign / factorial);
      result = addMatrices(result, scaledTerm);
      sign *= -1;
    }
    
    return result;
  };

  const calculate = () => {
    try {
      setError('');
      
      if (activeCalc === 'polynomial') {
        const polyResult = calculateCharacteristicPolynomial(matrix);
        setResult(polyResult);
      } else {
        const matrixResult = calculateMatrixFunction(matrix, functionType, powerValue);
        setResult(matrixResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Advanced Calculators</h2>
          <p className="text-theme-muted">Characteristic polynomials and matrix functions</p>
        </div>
      </motion.div>

      {/* Calculator Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {calculators.map(({ key, label, icon: Icon, description, color }) => (
          <motion.button
            key={key}
            onClick={() => setActiveCalc(key)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${activeCalc === key 
                ? 'border-theme-accent bg-theme-accent/10 shadow-lg' 
                : 'border-theme-border hover:border-theme-accent/50 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                  activeCalc === key ? 'text-theme-accent' : 'text-theme-text'
                }`}>
                  {label}
                </h3>
                <p className="text-theme-muted text-sm">{description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Function Type Selection for Matrix Functions */}
      {activeCalc === 'matrix-functions' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-theme-surface p-4 rounded-lg border border-theme-border"
        >
          <h3 className="text-lg font-semibold text-theme-text mb-4">Function Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'exp', label: 'e^A', desc: 'Matrix exponential' },
              { key: 'sin', label: 'sin(A)', desc: 'Matrix sine' },
              { key: 'cos', label: 'cos(A)', desc: 'Matrix cosine' },
              { key: 'power', label: 'A^n', desc: 'Matrix power' }
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setFunctionType(key as any)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-center
                  ${functionType === key 
                    ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' 
                    : 'border-theme-border hover:border-theme-accent/50 text-theme-text'
                  }
                `}
              >
                <div className="font-semibold">{label}</div>
                <div className="text-xs text-theme-muted">{desc}</div>
              </button>
            ))}
          </div>
          
          {functionType === 'power' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-theme-text mb-2">
                Power (n)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={powerValue}
                onChange={(e) => setPowerValue(parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent"
                placeholder="Enter power"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Matrix Input */}
      <MatrixInput
        matrix={matrix}
        onChange={setMatrix}
        label="Input Matrix A"
      />

      {/* Calculate Button */}
      <motion.div className="flex justify-center">
        <button
          onClick={calculate}
          className="px-8 py-3 bg-theme-accent text-theme-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Calculate {activeCalc === 'polynomial' ? 'Characteristic Polynomial' : `${functionType.toUpperCase()}(A)`}
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
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {activeCalc === 'polynomial' ? (
            /* Polynomial Result */
            <div className="bg-theme-surface rounded-lg border border-theme-border p-6">
              <h3 className="text-xl font-semibold text-theme-text mb-4">Characteristic Polynomial</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-theme-bg rounded-lg border border-theme-border">
                  <h4 className="font-semibold text-theme-text mb-2">Polynomial:</h4>
                  <div className="text-2xl font-mono text-theme-accent">
                    p(λ) = {(result as PolynomialResult).polynomial}
                  </div>
                </div>
                
                <div className="p-4 bg-theme-bg rounded-lg border border-theme-border">
                  <h4 className="font-semibold text-theme-text mb-2">Coefficients:</h4>
                  <div className="font-mono text-theme-text">
                    [{(result as PolynomialResult).coefficients.map(c => formatNumber(c)).join(', ')}]
                  </div>
                </div>
                
                {(result as PolynomialResult).roots && (result as PolynomialResult).roots!.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Eigenvalues (Roots):</h4>
                    <div className="space-y-1">
                      {(result as PolynomialResult).roots!.map((root, index) => (
                        <div key={index} className="font-mono text-green-700">
                          λ{index + 1} = {formatNumber(root)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Matrix Function Result */
            <MatrixDisplay
              matrix={result as Matrix}
              title={`${functionType.toUpperCase()}(A) Result`}
              subtitle={`Matrix ${functionType === 'power' ? `power A^${powerValue}` : functionType}`}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedCalculators;