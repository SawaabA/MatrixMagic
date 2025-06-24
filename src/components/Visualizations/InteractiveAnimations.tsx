import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Matrix, Vector, rref, inverse, createMatrix, formatNumber, multiplyMatrices, transpose } from '../../utils/matrixOperations';

interface AnimationStep {
  id: number;
  description: string;
  matrix: Matrix;
  operation?: string;
  highlight?: { row?: number; col?: number; element?: [number, number] };
  explanation: string;
}

interface InteractiveAnimationsProps {
  onClose?: () => void;
}

const InteractiveAnimations: React.FC<InteractiveAnimationsProps> = ({ onClose }) => {
  const [activeAnimation, setActiveAnimation] = useState<'gaussian' | 'eigenvalue' | 'svd' | 'lu'>('gaussian');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [inputMatrix, setInputMatrix] = useState<Matrix>([[2, 1, 3], [1, 3, 2], [3, 2, 1]]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const animations = [
    {
      key: 'gaussian',
      label: 'Gaussian Elimination',
      description: 'Step-by-step row operations to reach RREF',
      color: 'from-blue-400 to-blue-600'
    },
    {
      key: 'eigenvalue',
      label: 'Eigenvalue Decomposition',
      description: 'Finding eigenvalues and eigenvectors',
      color: 'from-green-400 to-green-600'
    },
    {
      key: 'svd',
      label: 'Singular Value Decomposition',
      description: 'SVD factorization A = UΣVᵀ',
      color: 'from-purple-400 to-purple-600'
    },
    {
      key: 'lu',
      label: 'LU Decomposition',
      description: 'Factor matrix into lower and upper triangular',
      color: 'from-orange-400 to-orange-600'
    }
  ] as const;

  // Generate Gaussian Elimination steps
  const generateGaussianSteps = (matrix: Matrix): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const result = matrix.map(row => [...row]);
    const rows = result.length;
    const cols = result[0].length;
    let stepId = 1;
    
    steps.push({
      id: 0,
      description: 'Starting Matrix',
      matrix: result.map(row => [...row]),
      explanation: 'We begin with the original matrix and will transform it to Reduced Row Echelon Form (RREF) using elementary row operations.'
    });

    let pivotRow = 0;
    
    for (let col = 0; col < cols && pivotRow < rows; col++) {
      // Find pivot
      let maxRow = pivotRow;
      for (let i = pivotRow + 1; i < rows; i++) {
        if (Math.abs(result[i][col]) > Math.abs(result[maxRow][col])) {
          maxRow = i;
        }
      }
      
      if (Math.abs(result[maxRow][col]) < 1e-10) continue;
      
      // Swap rows if needed
      if (maxRow !== pivotRow) {
        [result[pivotRow], result[maxRow]] = [result[maxRow], result[pivotRow]];
        steps.push({
          id: stepId++,
          description: `Row Swap: R${pivotRow + 1} ↔ R${maxRow + 1}`,
          matrix: result.map(row => [...row]),
          operation: `R${pivotRow + 1} ↔ R${maxRow + 1}`,
          highlight: { row: pivotRow },
          explanation: `We swap rows to get the largest absolute value in column ${col + 1} as our pivot. This improves numerical stability.`
        });
      }
      
      // Scale pivot row
      const pivot = result[pivotRow][col];
      if (Math.abs(pivot - 1) > 1e-10) {
        for (let j = 0; j < cols; j++) {
          result[pivotRow][j] /= pivot;
        }
        steps.push({
          id: stepId++,
          description: `Scale Row: R${pivotRow + 1} → (1/${formatNumber(pivot)})R${pivotRow + 1}`,
          matrix: result.map(row => [...row]),
          operation: `R${pivotRow + 1} → (1/${formatNumber(pivot)})R${pivotRow + 1}`,
          highlight: { row: pivotRow, col },
          explanation: `We scale row ${pivotRow + 1} by 1/${formatNumber(pivot)} to make the pivot element equal to 1.`
        });
      }
      
      // Eliminate column
      for (let i = 0; i < rows; i++) {
        if (i !== pivotRow && Math.abs(result[i][col]) > 1e-10) {
          const factor = result[i][col];
          for (let j = 0; j < cols; j++) {
            result[i][j] -= factor * result[pivotRow][j];
          }
          steps.push({
            id: stepId++,
            description: `Eliminate: R${i + 1} → R${i + 1} - (${formatNumber(factor)})R${pivotRow + 1}`,
            matrix: result.map(row => [...row]),
            operation: `R${i + 1} → R${i + 1} - (${formatNumber(factor)})R${pivotRow + 1}`,
            highlight: { row: i, col },
            explanation: `We eliminate the entry in row ${i + 1}, column ${col + 1} by subtracting ${formatNumber(factor)} times row ${pivotRow + 1} from row ${i + 1}.`
          });
        }
      }
      
      pivotRow++;
    }
    
    steps.push({
      id: stepId++,
      description: 'RREF Complete!',
      matrix: result.map(row => [...row]),
      explanation: 'The matrix is now in Reduced Row Echelon Form. Each leading entry is 1, and all entries above and below leading entries are 0.'
    });
    
    return steps;
  };

  // Generate Eigenvalue Decomposition steps
  const generateEigenvalueSteps = (matrix: Matrix): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    let stepId = 0;
    
    if (matrix.length !== matrix[0].length) {
      steps.push({
        id: stepId++,
        description: 'Error: Matrix must be square',
        matrix: matrix,
        explanation: 'Eigenvalue decomposition is only defined for square matrices.'
      });
      return steps;
    }

    steps.push({
      id: stepId++,
      description: 'Original Matrix A',
      matrix: matrix,
      explanation: 'We start with a square matrix A and want to find its eigenvalues λ and eigenvectors v such that Av = λv.'
    });

    // For 2x2 matrix, show characteristic polynomial calculation
    if (matrix.length === 2) {
      const a = matrix[0][0];
      const b = matrix[0][1];
      const c = matrix[1][0];
      const d = matrix[1][1];
      
      // Create A - λI symbolically
      const charMatrix = [
        [`${a}-λ`, formatNumber(b)],
        [formatNumber(c), `${d}-λ`]
      ];
      
      steps.push({
        id: stepId++,
        description: 'Form A - λI',
        matrix: charMatrix as any,
        explanation: 'We form the matrix A - λI where I is the identity matrix and λ is the eigenvalue parameter.'
      });

      const trace = a + d;
      const det = a * d - b * c;
      const discriminant = trace * trace - 4 * det;
      
      steps.push({
        id: stepId++,
        description: 'Characteristic Polynomial',
        matrix: matrix,
        explanation: `The characteristic polynomial is det(A - λI) = λ² - ${trace}λ + ${det} = 0. The roots of this polynomial are the eigenvalues.`
      });

      if (discriminant >= 0) {
        const lambda1 = (trace + Math.sqrt(discriminant)) / 2;
        const lambda2 = (trace - Math.sqrt(discriminant)) / 2;
        
        steps.push({
          id: stepId++,
          description: 'Eigenvalues Found',
          matrix: matrix,
          explanation: `The eigenvalues are λ₁ = ${formatNumber(lambda1)} and λ₂ = ${formatNumber(lambda2)}.`
        });

        // Find eigenvectors
        for (let i = 0; i < 2; i++) {
          const lambda = i === 0 ? lambda1 : lambda2;
          const eigenMatrix = [
            [a - lambda, b],
            [c, d - lambda]
          ];
          
          steps.push({
            id: stepId++,
            description: `Find Eigenvector for λ${i + 1}`,
            matrix: eigenMatrix,
            explanation: `To find the eigenvector for λ${i + 1} = ${formatNumber(lambda)}, we solve (A - λ${i + 1}I)v = 0.`
          });
        }
      }
    }

    steps.push({
      id: stepId++,
      description: 'Eigendecomposition Complete',
      matrix: matrix,
      explanation: 'The eigendecomposition A = PDP⁻¹ expresses the matrix as a product where P contains eigenvectors and D contains eigenvalues.'
    });

    return steps;
  };

  // Generate LU Decomposition steps
  const generateLUSteps = (matrix: Matrix): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const n = matrix.length;
    let stepId = 0;
    
    if (n !== matrix[0].length) {
      steps.push({
        id: stepId++,
        description: 'Error: Matrix must be square',
        matrix: matrix,
        explanation: 'LU decomposition requires a square matrix.'
      });
      return steps;
    }

    const L = createMatrix(n, n, 0);
    const U = matrix.map(row => [...row]);
    
    // Initialize L diagonal to 1
    for (let i = 0; i < n; i++) {
      L[i][i] = 1;
    }

    steps.push({
      id: stepId++,
      description: 'Initialize L and U',
      matrix: matrix,
      explanation: 'We decompose A into L (lower triangular) and U (upper triangular) such that A = LU. L starts with 1s on the diagonal.'
    });

    for (let k = 0; k < n - 1; k++) {
      steps.push({
        id: stepId++,
        description: `Step ${k + 1}: Working on column ${k + 1}`,
        matrix: U,
        highlight: { col: k },
        explanation: `We eliminate entries below the pivot in column ${k + 1} and store the multipliers in L.`
      });

      for (let i = k + 1; i < n; i++) {
        if (Math.abs(U[k][k]) < 1e-10) {
          steps.push({
            id: stepId++,
            description: 'Error: Zero pivot encountered',
            matrix: U,
            explanation: 'LU decomposition failed due to zero pivot. Matrix may need row pivoting.'
          });
          return steps;
        }

        const factor = U[i][k] / U[k][k];
        L[i][k] = factor;
        
        for (let j = k; j < n; j++) {
          U[i][j] -= factor * U[k][j];
        }

        steps.push({
          id: stepId++,
          description: `Eliminate U[${i + 1}][${k + 1}]`,
          matrix: U,
          highlight: { element: [i, k] },
          explanation: `Set L[${i + 1}][${k + 1}] = ${formatNumber(factor)} and eliminate U[${i + 1}][${k + 1}] using row operations.`
        });
      }
    }

    steps.push({
      id: stepId++,
      description: 'LU Decomposition Complete',
      matrix: U,
      explanation: 'The decomposition A = LU is complete. L contains the multipliers and U is upper triangular.'
    });

    return steps;
  };

  // Generate SVD steps (simplified)
  const generateSVDSteps = (matrix: Matrix): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    let stepId = 0;

    steps.push({
      id: stepId++,
      description: 'Original Matrix A',
      matrix: matrix,
      explanation: 'SVD decomposes any matrix A into A = UΣVᵀ where U and V are orthogonal and Σ is diagonal.'
    });

    steps.push({
      id: stepId++,
      description: 'Compute AᵀA',
      matrix: multiplyMatrices(transpose(matrix), matrix),
      explanation: 'We compute AᵀA to find the right singular vectors V. The eigenvalues of AᵀA are the squared singular values.'
    });

    steps.push({
      id: stepId++,
      description: 'Compute AAᵀ',
      matrix: multiplyMatrices(matrix, transpose(matrix)),
      explanation: 'We compute AAᵀ to find the left singular vectors U. The eigenvalues of AAᵀ are also the squared singular values.'
    });

    steps.push({
      id: stepId++,
      description: 'SVD Components',
      matrix: matrix,
      explanation: 'The SVD A = UΣVᵀ provides the best low-rank approximation and is fundamental in data analysis and machine learning.'
    });

    return steps;
  };

  useEffect(() => {
    let newSteps: AnimationStep[] = [];
    
    switch (activeAnimation) {
      case 'gaussian':
        newSteps = generateGaussianSteps(inputMatrix);
        break;
      case 'eigenvalue':
        newSteps = generateEigenvalueSteps(inputMatrix);
        break;
      case 'lu':
        newSteps = generateLUSteps(inputMatrix);
        break;
      case 'svd':
        newSteps = generateSVDSteps(inputMatrix);
        break;
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [activeAnimation, inputMatrix]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000 / animationSpeed);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, animationSpeed]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg">
          <Play className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Interactive Animations</h2>
          <p className="text-theme-muted">Step-by-step visual explanations of matrix algorithms</p>
        </div>
      </motion.div>

      {/* Animation Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {animations.map(({ key, label, description, color }) => (
          <motion.button
            key={key}
            onClick={() => setActiveAnimation(key)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${activeAnimation === key 
                ? 'border-theme-accent bg-theme-accent/10 shadow-lg' 
                : 'border-theme-border hover:border-theme-accent/50 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:scale-110 transition-transform`}>
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                  activeAnimation === key ? 'text-theme-accent' : 'text-theme-text'
                }`}>
                  {label}
                </h3>
                <p className="text-theme-muted text-sm">{description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Matrix Input */}
          <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
            <h3 className="text-lg font-semibold text-theme-text mb-4">Input Matrix</h3>
            <div className="space-y-3">
              {inputMatrix.map((row, i) => (
                <div key={i} className="flex gap-2">
                  {row.map((cell, j) => (
                    <input
                      key={`${i}-${j}`}
                      type="number"
                      step="any"
                      value={cell}
                      onChange={(e) => {
                        const newMatrix = [...inputMatrix];
                        newMatrix[i][j] = parseFloat(e.target.value) || 0;
                        setInputMatrix(newMatrix);
                      }}
                      className="w-16 h-12 text-center text-sm font-mono rounded border border-theme-border bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                  ))}
                </div>
              ))}
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setInputMatrix([[2, 1, 3], [1, 3, 2], [3, 2, 1]])}
                className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Example 1
              </button>
              <button
                onClick={() => setInputMatrix([[1, 2], [3, 4]])}
                className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                2×2 Matrix
              </button>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
            <h3 className="text-lg font-semibold text-theme-text mb-4">Animation Controls</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 px-3 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors disabled:opacity-50"
                >
                  <Rewind className="w-4 h-4" />
                </button>
                
                <button
                  onClick={isPlaying ? pause : play}
                  disabled={currentStep >= steps.length - 1}
                  className="flex items-center gap-1 px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
                <button
                  onClick={nextStep}
                  disabled={currentStep >= steps.length - 1}
                  className="flex items-center gap-1 px-3 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors disabled:opacity-50"
                >
                  <FastForward className="w-4 h-4" />
                </button>
                
                <button
                  onClick={reset}
                  className="flex items-center gap-1 px-3 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Speed: {animationSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="text-sm text-theme-muted">
                Step {currentStep + 1} of {steps.length}
              </div>

              <div className="w-full bg-theme-border rounded-full h-2">
                <div 
                  className="bg-theme-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Animation Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Step Description */}
          <AnimatePresence mode="wait">
            {currentStepData && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-theme-surface rounded-xl p-6 border border-theme-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-theme-text">
                    {currentStepData.description}
                  </h3>
                  {currentStepData.operation && (
                    <div className="px-3 py-1 bg-theme-accent/10 text-theme-accent rounded-lg font-mono text-sm">
                      {currentStepData.operation}
                    </div>
                  )}
                </div>
                
                <p className="text-theme-muted">{currentStepData.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Matrix Display */}
          <AnimatePresence mode="wait">
            {currentStepData && (
              <motion.div
                key={`matrix-${currentStep}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-theme-surface rounded-xl p-6 border border-theme-border"
              >
                <div className="relative">
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      <div className="grid gap-1 p-6 bg-theme-bg rounded-lg border border-theme-border">
                        {currentStepData.matrix.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex gap-1 justify-center">
                            {row.map((cell, colIndex) => (
                              <motion.div
                                key={`${rowIndex}-${colIndex}`}
                                className={`w-20 h-14 flex items-center justify-center text-sm font-mono rounded border transition-all duration-300 ${
                                  currentStepData.highlight?.row === rowIndex || 
                                  currentStepData.highlight?.col === colIndex ||
                                  (currentStepData.highlight?.element && 
                                   currentStepData.highlight.element[0] === rowIndex && 
                                   currentStepData.highlight.element[1] === colIndex)
                                    ? 'bg-blue-100 border-blue-300 text-blue-700 scale-110'
                                    : 'bg-theme-surface border-theme-border text-theme-text'
                                }`}
                                animate={
                                  currentStepData.highlight?.row === rowIndex || 
                                  currentStepData.highlight?.col === colIndex ||
                                  (currentStepData.highlight?.element && 
                                   currentStepData.highlight.element[0] === rowIndex && 
                                   currentStepData.highlight.element[1] === colIndex)
                                    ? { scale: [1, 1.1, 1] }
                                    : {}
                                }
                                transition={{ duration: 0.5 }}
                              >
                                {typeof cell === 'string' ? cell : formatNumber(cell)}
                              </motion.div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Matrix brackets */}
                  <div className="absolute left-4 top-6 bottom-6 w-1 border-l-2 border-t-2 border-b-2 border-theme-accent rounded-l"></div>
                  <div className="absolute right-4 top-6 bottom-6 w-1 border-r-2 border-t-2 border-b-2 border-theme-accent rounded-r"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Algorithm Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          >
            <h3 className="text-lg font-semibold text-theme-text mb-3">
              About {animations.find(a => a.key === activeAnimation)?.label}
            </h3>
            <div className="text-theme-muted text-sm space-y-2">
              {activeAnimation === 'gaussian' && (
                <div>
                  <p><strong>Gaussian Elimination</strong> transforms a matrix to RREF using three elementary row operations:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Row swapping (to improve numerical stability)</li>
                    <li>Row scaling (to create leading 1s)</li>
                    <li>Row addition/subtraction (to create zeros)</li>
                  </ul>
                  <p className="mt-2">This algorithm is fundamental for solving linear systems and finding matrix rank.</p>
                </div>
              )}
              {activeAnimation === 'eigenvalue' && (
                <div>
                  <p><strong>Eigenvalue Decomposition</strong> finds special vectors that don't change direction under the transformation:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Solve det(A - λI) = 0 for eigenvalues λ</li>
                    <li>For each λ, solve (A - λI)v = 0 for eigenvectors v</li>
                    <li>Result: A = PDP⁻¹ where P contains eigenvectors, D contains eigenvalues</li>
                  </ul>
                </div>
              )}
              {activeAnimation === 'lu' && (
                <div>
                  <p><strong>LU Decomposition</strong> factors a matrix into lower and upper triangular matrices:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>L is lower triangular with 1s on the diagonal</li>
                    <li>U is upper triangular</li>
                    <li>Useful for solving multiple systems with the same coefficient matrix</li>
                  </ul>
                </div>
              )}
              {activeAnimation === 'svd' && (
                <div>
                  <p><strong>Singular Value Decomposition</strong> is the most general matrix factorization:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Works for any matrix (not just square)</li>
                    <li>A = UΣVᵀ where U, V are orthogonal and Σ is diagonal</li>
                    <li>Applications: data compression, noise reduction, recommendation systems</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveAnimations;