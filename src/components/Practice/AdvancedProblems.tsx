import React, { useState } from 'react';
import { Brain, Lightbulb, Target, CheckCircle, X, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixDisplay from '../MatrixDisplay';
import { Matrix, formatNumber, determinant, multiplyMatrices, transpose } from '../../utils/matrixOperations';

interface WordProblem {
  id: string;
  title: string;
  scenario: string;
  problem: string;
  hints: string[];
  solution: {
    steps: string[];
    matrices?: Matrix[];
    finalAnswer: string;
    explanation: string;
  };
  difficulty: 'medium' | 'hard';
  category: 'real-world' | 'multi-step' | 'proof';
}

interface ProofProblem {
  id: string;
  statement: string;
  given: string[];
  toProve: string;
  hints: string[];
  solution: {
    steps: string[];
    reasoning: string[];
    conclusion: string;
  };
}

const AdvancedProblems: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<WordProblem | null>(null);
  const [selectedProof, setSelectedProof] = useState<ProofProblem | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [activeTab, setActiveTab] = useState<'word' | 'multi-step' | 'proofs'>('word');

  const wordProblems: WordProblem[] = [
    {
      id: 'graphics-rotation',
      title: 'Computer Graphics: 3D Rotation',
      scenario: 'You are developing a 3D game engine and need to rotate objects in space.',
      problem: 'A 3D model has vertices at points (1,0,0), (0,1,0), and (0,0,1). You want to rotate this object 90° around the z-axis. What are the new coordinates after rotation?',
      hints: [
        'A rotation matrix around the z-axis has the form: [[cos(θ), -sin(θ), 0], [sin(θ), cos(θ), 0], [0, 0, 1]]',
        'For 90° rotation, cos(90°) = 0 and sin(90°) = 1',
        'Apply the rotation matrix to each vertex by matrix multiplication'
      ],
      solution: {
        steps: [
          'Set up the rotation matrix for 90° around z-axis',
          'R_z(90°) = [[0, -1, 0], [1, 0, 0], [0, 0, 1]]',
          'Apply to vertex (1,0,0): R_z × [1,0,0]ᵀ = [0,1,0]ᵀ',
          'Apply to vertex (0,1,0): R_z × [0,1,0]ᵀ = [-1,0,0]ᵀ',
          'Apply to vertex (0,0,1): R_z × [0,0,1]ᵀ = [0,0,1]ᵀ'
        ],
        matrices: [[[0, -1, 0], [1, 0, 0], [0, 0, 1]]],
        finalAnswer: 'New vertices: (0,1,0), (-1,0,0), (0,0,1)',
        explanation: 'The rotation matrix transforms each point by rotating it 90° counterclockwise around the z-axis.'
      },
      difficulty: 'medium',
      category: 'real-world'
    },
    {
      id: 'economics-supply-demand',
      title: 'Economics: Market Equilibrium',
      scenario: 'An economist is analyzing a market with multiple products and suppliers.',
      problem: 'A market has 3 products with supply matrix S = [[10, 5, 2], [8, 12, 3], [6, 9, 15]] and demand vector d = [100, 150, 200]. Find the equilibrium prices if the price vector p satisfies Sp = d.',
      hints: [
        'This is a system of linear equations: Sp = d',
        'You need to find p = S⁻¹d',
        'First check if S is invertible by computing its determinant'
      ],
      solution: {
        steps: [
          'Check if S is invertible: det(S) ≠ 0',
          'Calculate det(S) = 10(12×15 - 3×9) - 5(8×15 - 3×6) + 2(8×9 - 12×6)',
          'det(S) = 10(180-27) - 5(120-18) + 2(72-72) = 10(153) - 5(102) + 0 = 1530 - 510 = 1020',
          'Since det(S) ≠ 0, S is invertible',
          'Solve p = S⁻¹d using matrix methods'
        ],
        matrices: [[[10, 5, 2], [8, 12, 3], [6, 9, 15]]],
        finalAnswer: 'The system has a unique solution for equilibrium prices',
        explanation: 'The non-zero determinant ensures a unique market equilibrium exists.'
      },
      difficulty: 'hard',
      category: 'real-world'
    },
    {
      id: 'engineering-stress',
      title: 'Engineering: Stress Analysis',
      scenario: 'A structural engineer is analyzing stress distribution in a bridge truss.',
      problem: 'A truss has 4 joints with force balance equations forming the system: [[2, -1, 0, 1], [-1, 3, -1, 0], [0, -1, 2, -1], [1, 0, -1, 2]]x = [10, 0, -5, 15]. Solve for the internal forces.',
      hints: [
        'This is a system Ax = b where A is the coefficient matrix',
        'Use Gaussian elimination or matrix inverse methods',
        'Check that the system is consistent and has a unique solution'
      ],
      solution: {
        steps: [
          'Set up the augmented matrix [A|b]',
          'Apply row operations to get RREF',
          'The system represents force equilibrium at each joint',
          'Solve using systematic elimination'
        ],
        matrices: [[[2, -1, 0, 1], [-1, 3, -1, 0], [0, -1, 2, -1], [1, 0, -1, 2]]],
        finalAnswer: 'Internal forces can be found by solving the linear system',
        explanation: 'Each equation represents force balance (ΣF = 0) at a joint in the truss.'
      },
      difficulty: 'hard',
      category: 'multi-step'
    },
    {
      id: 'data-science-pca',
      title: 'Data Science: Principal Component Analysis',
      scenario: 'A data scientist wants to reduce the dimensionality of a dataset for machine learning.',
      problem: 'Given a covariance matrix C = [[4, 2], [2, 3]], find the principal components (eigenvectors) and explain their significance for data compression.',
      hints: [
        'Principal components are the eigenvectors of the covariance matrix',
        'Find eigenvalues by solving det(C - λI) = 0',
        'The largest eigenvalue corresponds to the direction of maximum variance'
      ],
      solution: {
        steps: [
          'Find eigenvalues: det(C - λI) = det([[4-λ, 2], [2, 3-λ]]) = 0',
          '(4-λ)(3-λ) - 4 = λ² - 7λ + 8 = 0',
          'λ₁ = (7 + √17)/2 ≈ 5.56, λ₂ = (7 - √17)/2 ≈ 1.44',
          'Find eigenvectors for each eigenvalue',
          'The first principal component explains the most variance'
        ],
        matrices: [[[4, 2], [2, 3]]],
        finalAnswer: 'PC1 captures ~79% of variance, PC2 captures ~21%',
        explanation: 'PCA finds the directions of maximum variance in the data for optimal dimensionality reduction.'
      },
      difficulty: 'hard',
      category: 'real-world'
    }
  ];

  const proofProblems: ProofProblem[] = [
    {
      id: 'transpose-product',
      statement: 'Prove that (AB)ᵀ = BᵀAᵀ for any matrices A and B where AB is defined.',
      given: [
        'A is an m×n matrix',
        'B is an n×p matrix',
        'AB is therefore an m×p matrix'
      ],
      toProve: '(AB)ᵀ = BᵀAᵀ',
      hints: [
        'Use the definition of matrix transpose: (M)ᵀᵢⱼ = Mⱼᵢ',
        'Use the definition of matrix multiplication: (AB)ᵢⱼ = Σₖ AᵢₖBₖⱼ',
        'Show that both sides have the same (i,j) entry'
      ],
      solution: {
        steps: [
          'Let C = AB, so we want to prove Cᵀ = BᵀAᵀ',
          'By definition: Cᵢⱼ = Σₖ AᵢₖBₖⱼ',
          'Therefore: (Cᵀ)ᵢⱼ = Cⱼᵢ = Σₖ AⱼₖBₖᵢ',
          'Now consider (BᵀAᵀ)ᵢⱼ = Σₖ (Bᵀ)ᵢₖ(Aᵀ)ₖⱼ',
          'By transpose definition: = Σₖ BₖᵢAⱼₖ = Σₖ AⱼₖBₖᵢ',
          'This equals (Cᵀ)ᵢⱼ, so (AB)ᵀ = BᵀAᵀ'
        ],
        reasoning: [
          'We use the fundamental definitions of matrix operations',
          'The key insight is that matrix multiplication involves summing products',
          'Transposition reverses the order of indices',
          'The commutativity of scalar multiplication allows reordering'
        ],
        conclusion: 'The transpose of a product equals the product of transposes in reverse order.'
      }
    },
    {
      id: 'determinant-product',
      statement: 'Prove that det(AB) = det(A)det(B) for square matrices A and B.',
      given: [
        'A and B are n×n matrices',
        'det(A) and det(B) exist'
      ],
      toProve: 'det(AB) = det(A)det(B)',
      hints: [
        'Consider the cases when det(A) = 0 and det(A) ≠ 0 separately',
        'Use properties of elementary row operations',
        'Think about how determinants behave under row operations'
      ],
      solution: {
        steps: [
          'Case 1: If det(A) = 0, then A is singular',
          'If A is singular, then AB is also singular (rank(AB) ≤ rank(A) < n)',
          'Therefore det(AB) = 0 = det(A)det(B)',
          'Case 2: If det(A) ≠ 0, then A is invertible',
          'A can be written as a product of elementary matrices: A = E₁E₂...Eₖ',
          'det(AB) = det(E₁E₂...EₖB) = det(E₁)det(E₂)...det(Eₖ)det(B)',
          'Since det(A) = det(E₁)det(E₂)...det(Eₖ), we have det(AB) = det(A)det(B)'
        ],
        reasoning: [
          'We use the fundamental property that elementary matrices have known determinants',
          'The key insight is that any invertible matrix can be written as a product of elementary matrices',
          'Elementary row operations have predictable effects on determinants'
        ],
        conclusion: 'The determinant of a product equals the product of determinants for all square matrices.'
      }
    }
  ];

  const multiStepProblems: WordProblem[] = [
    {
      id: 'transformation-composition',
      title: 'Composition of Linear Transformations',
      scenario: 'You need to apply multiple transformations to a geometric object.',
      problem: 'Apply the following transformations in order to the point (1,2): 1) Rotate 45° counterclockwise, 2) Scale by factor 2 in x-direction, 3) Reflect across y-axis. Find the final coordinates and the composite transformation matrix.',
      hints: [
        'Each transformation can be represented by a matrix',
        'Composition of transformations means multiplying matrices',
        'Remember: transformations are applied right to left in matrix multiplication'
      ],
      solution: {
        steps: [
          'Rotation 45°: R = [[cos(45°), -sin(45°)], [sin(45°), cos(45°)]] = [[√2/2, -√2/2], [√2/2, √2/2]]',
          'Scaling: S = [[2, 0], [0, 1]]',
          'Reflection: F = [[-1, 0], [0, 1]]',
          'Composite transformation: T = F·S·R',
          'Apply to point (1,2): T·[1,2]ᵀ'
        ],
        matrices: [
          [[Math.sqrt(2)/2, -Math.sqrt(2)/2], [Math.sqrt(2)/2, Math.sqrt(2)/2]],
          [[2, 0], [0, 1]],
          [[-1, 0], [0, 1]]
        ],
        finalAnswer: 'Final point: (-3√2/2, 3√2/2)',
        explanation: 'Multiple transformations combine through matrix multiplication, applied in reverse order.'
      },
      difficulty: 'hard',
      category: 'multi-step'
    }
  ];

  const allProblems = [...wordProblems, ...multiStepProblems];
  const filteredProblems = activeTab === 'word' 
    ? allProblems.filter(p => p.category === 'real-world')
    : activeTab === 'multi-step'
    ? allProblems.filter(p => p.category === 'multi-step')
    : [];

  const nextHint = () => {
    if (selectedProblem && currentHint < selectedProblem.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  const resetProblem = () => {
    setSelectedProblem(null);
    setSelectedProof(null);
    setShowHints(false);
    setShowSolution(false);
    setCurrentHint(0);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Advanced Problem Solving</h2>
          <p className="text-theme-muted">Real-world applications, multi-step problems, and mathematical proofs</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {[
          { key: 'word', label: 'Real-World Problems', icon: Target },
          { key: 'multi-step', label: 'Multi-Step Problems', icon: ArrowRight },
          { key: 'proofs', label: 'Mathematical Proofs', icon: BookOpen }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${activeTab === key 
                ? 'bg-theme-accent text-theme-bg shadow-sm' 
                : 'bg-theme-surface text-theme-muted hover:text-theme-text hover:bg-theme-border/50 border border-theme-border'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </motion.div>

      {!selectedProblem && !selectedProof ? (
        /* Problem Selection */
        <div className="space-y-6">
          {activeTab === 'proofs' ? (
            /* Proof Problems */
            <div className="grid gap-6">
              {proofProblems.map((proof, index) => (
                <motion.div
                  key={proof.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-theme-surface rounded-xl border border-theme-border p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProof(proof)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-theme-text mb-2">Proof Problem</h3>
                      <p className="text-theme-text mb-3 font-medium">{proof.statement}</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-theme-muted">Given:</span>
                          <ul className="text-sm text-theme-text ml-4">
                            {proof.given.map((item, i) => (
                              <li key={i} className="list-disc">{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-theme-muted">To Prove:</span>
                          <p className="text-sm text-theme-text font-mono">{proof.toProve}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Word and Multi-Step Problems */
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-theme-surface rounded-xl border border-theme-border p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProblem(problem)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        problem.difficulty === 'medium' 
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                          : 'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-theme-text">{problem.title}</h3>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          problem.difficulty === 'medium' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {problem.difficulty.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-theme-text mb-1">Scenario:</h4>
                        <p className="text-sm text-theme-muted">{problem.scenario}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-theme-text mb-1">Problem:</h4>
                        <p className="text-sm text-theme-text">{problem.problem}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Problem Solving Interface */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-theme-text">
                {selectedProblem?.title || 'Mathematical Proof'}
              </h3>
              {selectedProblem && (
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedProblem.difficulty === 'medium' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedProblem.difficulty.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={resetProblem}
              className="px-4 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors"
            >
              Back to Problems
            </button>
          </div>

          {selectedProblem ? (
            /* Word Problem Interface */
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Problem Statement */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
                  <h4 className="text-lg font-semibold text-theme-text mb-4">Problem Statement</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-theme-text mb-2">Scenario:</h5>
                      <p className="text-theme-muted">{selectedProblem.scenario}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-theme-text mb-2">Problem:</h5>
                      <p className="text-theme-text">{selectedProblem.problem}</p>
                    </div>
                  </div>
                </div>

                {/* Solution Display */}
                <AnimatePresence>
                  {showSolution && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-6"
                    >
                      <h4 className="text-lg font-semibold text-green-800 mb-4">Complete Solution</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-green-800 mb-2">Solution Steps:</h5>
                          <ol className="space-y-2">
                            {selectedProblem.solution.steps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2 text-green-700">
                                <span className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {selectedProblem.solution.matrices && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">Key Matrices:</h5>
                            <div className="space-y-3">
                              {selectedProblem.solution.matrices.map((matrix, index) => (
                                <MatrixDisplay
                                  key={index}
                                  matrix={matrix}
                                  title={`Matrix ${index + 1}`}
                                  className="bg-white rounded-lg p-4"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-4 bg-green-100 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">Final Answer:</h5>
                          <p className="text-green-700 font-mono">{selectedProblem.solution.finalAnswer}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-green-800 mb-2">Explanation:</h5>
                          <p className="text-green-700">{selectedProblem.solution.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hints and Controls */}
              <div className="space-y-4">
                <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
                  <h4 className="text-lg font-semibold text-theme-text mb-4">Need Help?</h4>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Lightbulb className="w-5 h-5" />
                      {showHints ? 'Hide Hints' : 'Show Hints'}
                    </button>

                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {showSolution ? 'Hide Solution' : 'Show Solution'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showHints && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        <h5 className="font-medium text-theme-text">Hints:</h5>
                        {selectedProblem.hints.slice(0, currentHint + 1).map((hint, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-start gap-2">
                              <span className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-blue-700 text-sm">{hint}</p>
                            </div>
                          </motion.div>
                        ))}
                        
                        {currentHint < selectedProblem.hints.length - 1 && (
                          <button
                            onClick={nextHint}
                            className="w-full px-3 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 transition-colors text-sm"
                          >
                            Next Hint
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : selectedProof ? (
            /* Proof Interface */
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
                  <h4 className="text-lg font-semibold text-theme-text mb-4">Proof Statement</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-theme-text mb-2">Statement to Prove:</h5>
                      <p className="text-theme-text font-mono bg-theme-bg p-3 rounded-lg">{selectedProof.statement}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-theme-text mb-2">Given:</h5>
                      <ul className="space-y-1">
                        {selectedProof.given.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-theme-text">
                            <span className="w-2 h-2 bg-theme-accent rounded-full mt-2 flex-shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-theme-text mb-2">To Prove:</h5>
                      <p className="text-theme-accent font-mono bg-theme-bg p-3 rounded-lg">{selectedProof.toProve}</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showSolution && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-6"
                    >
                      <h4 className="text-lg font-semibold text-green-800 mb-4">Proof</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-green-800 mb-2">Proof Steps:</h5>
                          <ol className="space-y-3">
                            {selectedProof.solution.steps.map((step, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-green-700 font-mono text-sm bg-white p-2 rounded">{step}</p>
                                  {selectedProof.solution.reasoning[index] && (
                                    <p className="text-green-600 text-sm mt-1 italic">{selectedProof.solution.reasoning[index]}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="p-4 bg-green-100 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">Conclusion:</h5>
                          <p className="text-green-700">{selectedProof.solution.conclusion}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
                  <h4 className="text-lg font-semibold text-theme-text mb-4">Proof Help</h4>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Lightbulb className="w-5 h-5" />
                      {showHints ? 'Hide Hints' : 'Show Hints'}
                    </button>

                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {showSolution ? 'Hide Proof' : 'Show Proof'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showHints && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        <h5 className="font-medium text-theme-text">Hints:</h5>
                        {selectedProof.hints.slice(0, currentHint + 1).map((hint, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-start gap-2">
                              <span className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-blue-700 text-sm">{hint}</p>
                            </div>
                          </motion.div>
                        ))}
                        
                        {currentHint < selectedProof.hints.length - 1 && (
                          <button
                            onClick={nextHint}
                            className="w-full px-3 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 transition-colors text-sm"
                          >
                            Next Hint
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AdvancedProblems;