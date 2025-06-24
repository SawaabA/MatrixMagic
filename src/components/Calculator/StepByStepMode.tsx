import React, { useState } from 'react';
import { Brain, Play, Pause, SkipForward, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Matrix, rref, inverse, formatNumber } from '../../utils/matrixOperations';

interface Step {
  id: number;
  description: string;
  matrix: Matrix;
  operation?: string;
  highlight?: { row?: number; col?: number };
}

interface StepByStepModeProps {
  matrix: Matrix;
  operation: 'rref' | 'inverse';
  onClose: () => void;
}

const StepByStepMode: React.FC<StepByStepModeProps> = ({ matrix, operation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState<Step[]>(() => generateSteps(matrix, operation));

  function generateSteps(inputMatrix: Matrix, op: 'rref' | 'inverse'): Step[] {
    const steps: Step[] = [];
    let currentMatrix = inputMatrix.map(row => [...row]);
    
    steps.push({
      id: 0,
      description: `Starting ${op === 'rref' ? 'RREF' : 'inverse'} calculation`,
      matrix: currentMatrix.map(row => [...row])
    });

    if (op === 'rref') {
      return generateRREFSteps(currentMatrix);
    } else {
      return generateInverseSteps(currentMatrix);
    }
  }

  function generateRREFSteps(matrix: Matrix): Step[] {
    const steps: Step[] = [];
    const result = matrix.map(row => [...row]);
    const rows = result.length;
    const cols = result[0].length;
    let stepId = 1;
    
    steps.push({
      id: 0,
      description: 'Starting matrix - we will transform this to Reduced Row Echelon Form',
      matrix: result.map(row => [...row])
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
          description: `Swap R${pivotRow + 1} ↔ R${maxRow + 1} to get largest pivot`,
          matrix: result.map(row => [...row]),
          operation: `R${pivotRow + 1} ↔ R${maxRow + 1}`,
          highlight: { row: pivotRow }
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
          description: `Scale R${pivotRow + 1} by 1/${formatNumber(pivot)} to make pivot = 1`,
          matrix: result.map(row => [...row]),
          operation: `R${pivotRow + 1} → (1/${formatNumber(pivot)})R${pivotRow + 1}`,
          highlight: { row: pivotRow, col }
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
            description: `Eliminate column ${col + 1} in row ${i + 1}`,
            matrix: result.map(row => [...row]),
            operation: `R${i + 1} → R${i + 1} - (${formatNumber(factor)})R${pivotRow + 1}`,
            highlight: { row: i, col }
          });
        }
      }
      
      pivotRow++;
    }
    
    steps.push({
      id: stepId++,
      description: 'RREF transformation complete! The matrix is now in reduced row echelon form.',
      matrix: result.map(row => [...row])
    });
    
    return steps;
  }

  function generateInverseSteps(matrix: Matrix): Step[] {
    const steps: Step[] = [];
    const n = matrix.length;
    let stepId = 1;
    
    // Create augmented matrix [A|I]
    const augmented = matrix.map((row, i) => [
      ...row,
      ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    ]);
    
    steps.push({
      id: 0,
      description: 'Create augmented matrix [A|I] where I is the identity matrix',
      matrix: augmented.map(row => [...row])
    });
    
    // Apply Gauss-Jordan elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows if needed
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        steps.push({
          id: stepId++,
          description: `Swap R${i + 1} ↔ R${maxRow + 1}`,
          matrix: augmented.map(row => [...row]),
          operation: `R${i + 1} ↔ R${maxRow + 1}`,
          highlight: { row: i }
        });
      }
      
      // Scale pivot row
      const pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) {
        steps.push({
          id: stepId++,
          description: 'Matrix is singular - inverse does not exist',
          matrix: augmented.map(row => [...row])
        });
        break;
      }
      
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      steps.push({
        id: stepId++,
        description: `Scale R${i + 1} to make pivot = 1`,
        matrix: augmented.map(row => [...row]),
        operation: `R${i + 1} → (1/${formatNumber(pivot)})R${i + 1}`,
        highlight: { row: i, col: i }
      });
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i && Math.abs(augmented[k][i]) > 1e-10) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
          steps.push({
            id: stepId++,
            description: `Eliminate column ${i + 1} in row ${k + 1}`,
            matrix: augmented.map(row => [...row]),
            operation: `R${k + 1} → R${k + 1} - (${formatNumber(factor)})R${i + 1}`,
            highlight: { row: k, col: i }
          });
        }
      }
    }
    
    steps.push({
      id: stepId++,
      description: 'Inverse calculation complete! The right side of the augmented matrix is A⁻¹',
      matrix: augmented.map(row => [...row])
    });
    
    return steps;
  }

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Auto-play functionality
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-theme-surface rounded-2xl shadow-2xl border border-theme-border max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-theme-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-theme-text">
                  Step-by-Step {operation === 'rref' ? 'RREF' : 'Matrix Inverse'}
                </h2>
                <p className="text-theme-muted">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border/50 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-theme-border rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-theme-bg rounded-lg p-4 border border-theme-border">
                <h3 className="font-semibold text-theme-text mb-2">
                  Step {currentStep + 1}: {currentStepData?.operation || 'Matrix State'}
                </h3>
                <p className="text-theme-muted">{currentStepData?.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Matrix Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid gap-1 p-6 bg-theme-bg rounded-lg border border-theme-border">
                    {currentStepData?.matrix.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-1 justify-center">
                        {row.map((cell, colIndex) => (
                          <React.Fragment key={`${rowIndex}-${colIndex}`}>
                            <motion.div
                              className={`w-16 h-12 flex items-center justify-center text-sm font-mono rounded border transition-all duration-300 ${
                                currentStepData.highlight?.row === rowIndex || 
                                currentStepData.highlight?.col === colIndex
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-theme-surface border-theme-border text-theme-text'
                              }`}
                              animate={
                                currentStepData.highlight?.row === rowIndex || 
                                currentStepData.highlight?.col === colIndex
                                  ? { scale: [1, 1.05, 1] }
                                  : {}
                              }
                              transition={{ duration: 0.5 }}
                            >
                              {formatNumber(cell)}
                            </motion.div>
                            {/* Separator for augmented matrix */}
                            {operation === 'inverse' && colIndex === matrix.length - 1 && (
                              <div className="w-px bg-theme-border mx-2 self-stretch"></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matrix brackets */}
              <div className="absolute left-4 top-6 bottom-6 w-1 border-l-2 border-t-2 border-b-2 border-theme-accent rounded-l"></div>
              <div className="absolute right-4 top-6 bottom-6 w-1 border-r-2 border-t-2 border-b-2 border-theme-accent rounded-r"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-theme-border bg-theme-bg/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="p-2 rounded-lg bg-theme-border/50 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
                title="Reset to beginning"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-2 rounded-lg bg-theme-border/50 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous step"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={currentStep >= steps.length - 1}
                className="p-2 rounded-lg bg-theme-accent text-theme-bg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={nextStep}
                disabled={currentStep >= steps.length - 1}
                className="p-2 rounded-lg bg-theme-border/50 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next step"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-theme-muted">
                {currentStep + 1} / {steps.length}
              </span>
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-theme-surface border border-theme-border text-theme-text rounded-lg hover:bg-theme-border/50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepByStepMode;