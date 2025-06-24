import React, { useState } from 'react';
import { BookOpen, Play, Download, ExternalLink, FileText, Trophy, Brain, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import FormulaReference from './FormulaReference';

interface Topic {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'operations' | 'advanced' | 'applications';
  content: {
    keyConcepts: string[];
    theory: string[];
    examples: Array<{
      title: string;
      problem: string;
      solution: string[];
      result: string;
    }>;
    videoUrl?: string;
    resources: Array<{
      title: string;
      url: string;
      type: 'pdf' | 'video' | 'article';
    }>;
  };
}

const topics: Topic[] = [
  {
    id: 'matrix-basics',
    title: 'Matrix Fundamentals',
    description: 'Introduction to matrices, notation, and basic concepts',
    category: 'basics',
    content: {
      keyConcepts: [
        'Matrix: A rectangular array of numbers arranged in rows and columns',
        'Dimension: m×n where m = rows, n = columns',
        'Square Matrix: Equal number of rows and columns (n×n)',
        'Identity Matrix: Square matrix with 1s on diagonal, 0s elsewhere',
        'Zero Matrix: All elements are zero'
      ],
      theory: [
        'A matrix is a rectangular array of numbers arranged in rows and columns.',
        'Matrices are denoted using capital letters (A, B, C) and their elements with subscripts.',
        'The dimension of a matrix is expressed as m×n (rows × columns).',
        'Square matrices have equal numbers of rows and columns.',
        'The main diagonal of a square matrix consists of elements where row index equals column index.',
        'Matrices are fundamental tools in linear algebra for representing systems of equations and transformations.'
      ],
      examples: [
        {
          title: 'Basic Matrix Notation',
          problem: 'Identify the elements and dimensions of matrix A = [[1, 2, 3], [4, 5, 6]]',
          solution: [
            'Matrix A has 2 rows and 3 columns',
            'Dimension: 2×3',
            'Element a₁₁ = 1 (row 1, column 1)',
            'Element a₁₂ = 2 (row 1, column 2)',
            'Element a₂₃ = 6 (row 2, column 3)'
          ],
          result: 'A is a 2×3 matrix with elements aᵢⱼ where i ∈ {1,2} and j ∈ {1,2,3}'
        },
        {
          title: 'Identity Matrix',
          problem: 'Write the 3×3 identity matrix',
          solution: [
            'Identity matrix I₃ has 1s on the main diagonal',
            'All other elements are 0',
            'Property: AI = IA = A for any compatible matrix A'
          ],
          result: 'I₃ = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]'
        }
      ],
      videoUrl: 'https://www.youtube.com/embed/0oGJTQCy4cQ',
      resources: [
        {
          title: 'Khan Academy - Intro to Matrices',
          url: 'https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices',
          type: 'article'
        },
        {
          title: 'MIT Linear Algebra Lecture 1',
          url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/',
          type: 'video'
        },
        {
          title: 'Matrix Basics PDF Guide',
          url: 'https://example.com/matrix-basics.pdf',
          type: 'pdf'
        }
      ]
    }
  },
  {
    id: 'matrix-operations',
    title: 'Matrix Operations',
    description: 'Addition, subtraction, multiplication, and scalar operations',
    category: 'operations',
    content: {
      keyConcepts: [
        'Matrix Addition: Add corresponding elements (same dimensions required)',
        'Matrix Multiplication: Row-by-column multiplication (inner dimensions must match)',
        'Scalar Multiplication: Multiply every element by a scalar',
        'Matrix multiplication is NOT commutative: AB ≠ BA',
        'Associative Property: (AB)C = A(BC)'
      ],
      theory: [
        'Matrix addition requires matrices of the same dimensions.',
        'Each element is added to the corresponding element in the other matrix.',
        'Matrix multiplication: (AB)ᵢⱼ = Σₖ aᵢₖbₖⱼ',
        'For multiplication AB, the number of columns in A must equal the number of rows in B.',
        'Matrix multiplication is not commutative: AB ≠ BA in general.',
        'Scalar multiplication distributes over matrix addition: c(A + B) = cA + cB'
      ],
      examples: [
        {
          title: 'Matrix Addition',
          problem: 'Calculate A + B where A = [[1,2],[3,4]] and B = [[5,6],[7,8]]',
          solution: [
            'Add corresponding elements',
            'a₁₁ + b₁₁ = 1 + 5 = 6',
            'a₁₂ + b₁₂ = 2 + 6 = 8',
            'a₂₁ + b₂₁ = 3 + 7 = 10',
            'a₂₂ + b₂₂ = 4 + 8 = 12'
          ],
          result: 'A + B = [[6, 8], [10, 12]]'
        },
        {
          title: 'Matrix Multiplication',
          problem: 'Calculate AB where A = [[1,2],[3,4]] and B = [[5,6],[7,8]]',
          solution: [
            'First row, first column: (1×5) + (2×7) = 5 + 14 = 19',
            'First row, second column: (1×6) + (2×8) = 6 + 16 = 22',
            'Second row, first column: (3×5) + (4×7) = 15 + 28 = 43',
            'Second row, second column: (3×6) + (4×8) = 18 + 32 = 50'
          ],
          result: 'AB = [[19, 22], [43, 50]]'
        }
      ],
      resources: [
        {
          title: 'Matrix Operations Guide',
          url: 'https://www.mathsisfun.com/algebra/matrix-multiplying.html',
          type: 'article'
        },
        {
          title: '3Blue1Brown - Matrix Multiplication',
          url: 'https://www.youtube.com/watch?v=XkY2DOUCWMU',
          type: 'video'
        }
      ]
    }
  },
  {
    id: 'determinants',
    title: 'Determinants',
    description: 'Computing determinants and their geometric interpretation',
    category: 'advanced',
    content: {
      keyConcepts: [
        'Determinant: A scalar value computed from a square matrix',
        '2×2 Formula: det([[a,b],[c,d]]) = ad - bc',
        'Geometric Meaning: Signed area/volume of transformation',
        'Zero Determinant: Matrix is singular (not invertible)',
        'Properties: det(AB) = det(A)×det(B), det(Aᵀ) = det(A)'
      ],
      theory: [
        'The determinant is a scalar value computed from a square matrix.',
        'For a 2×2 matrix [[a,b],[c,d]], det = ad - bc',
        'Geometrically, the determinant represents the signed volume of the parallelogram.',
        'A matrix is invertible if and only if its determinant is non-zero.',
        'Properties: det(AB) = det(A)×det(B), det(Aᵀ) = det(A)',
        'For larger matrices, use cofactor expansion or row operations.'
      ],
      examples: [
        {
          title: '2×2 Determinant',
          problem: 'Find det(A) where A = [[3, 1], [2, 4]]',
          solution: [
            'Use formula: det([[a,b],[c,d]]) = ad - bc',
            'a = 3, b = 1, c = 2, d = 4',
            'det(A) = (3)(4) - (1)(2)',
            'det(A) = 12 - 2 = 10'
          ],
          result: 'det(A) = 10'
        },
        {
          title: '3×3 Determinant (Cofactor Expansion)',
          problem: 'Find det(B) where B = [[1, 2, 3], [0, 1, 4], [5, 6, 0]]',
          solution: [
            'Expand along first row',
            'det(B) = 1×det([[1,4],[6,0]]) - 2×det([[0,4],[5,0]]) + 3×det([[0,1],[5,6]])',
            'det(B) = 1×(0-24) - 2×(0-20) + 3×(0-5)',
            'det(B) = -24 + 40 - 15 = 1'
          ],
          result: 'det(B) = 1'
        }
      ],
      videoUrl: 'https://www.youtube.com/embed/Ip3X9LOh2dk',
      resources: [
        {
          title: 'Determinants Explained',
          url: 'https://www.khanacademy.org/math/linear-algebra/matrix-transformations',
          type: 'article'
        },
        {
          title: 'Geometric Interpretation of Determinants',
          url: 'https://www.3blue1brown.com/lessons/determinant',
          type: 'video'
        }
      ]
    }
  },
  {
    id: 'eigenvalues',
    title: 'Eigenvalues & Eigenvectors',
    description: 'Understanding eigenvalues, eigenvectors, and their applications',
    category: 'advanced',
    content: {
      keyConcepts: [
        'Eigenvector: Vector that only changes by scalar factor under transformation',
        'Eigenvalue: The scalar factor (λ) in equation Av = λv',
        'Characteristic Equation: det(A - λI) = 0',
        'Eigenspace: Set of all eigenvectors for a given eigenvalue',
        'Applications: PCA, stability analysis, quantum mechanics'
      ],
      theory: [
        'An eigenvector v of matrix A satisfies Av = λv for some scalar λ (eigenvalue).',
        'Eigenvalues are roots of the characteristic polynomial det(A - λI) = 0.',
        'Eigenvectors represent directions that remain unchanged under the transformation.',
        'Real symmetric matrices always have real eigenvalues.',
        'Applications include principal component analysis, stability analysis, and quantum mechanics.',
        'The sum of eigenvalues equals the trace of the matrix.'
      ],
      examples: [
        {
          title: 'Finding Eigenvalues',
          problem: 'Find eigenvalues of A = [[3, 1], [0, 2]]',
          solution: [
            'Set up characteristic equation: det(A - λI) = 0',
            'A - λI = [[3-λ, 1], [0, 2-λ]]',
            'det(A - λI) = (3-λ)(2-λ) - (1)(0) = (3-λ)(2-λ)',
            'Setting equal to zero: (3-λ)(2-λ) = 0'
          ],
          result: 'Eigenvalues: λ₁ = 3, λ₂ = 2'
        },
        {
          title: 'Finding Eigenvectors',
          problem: 'Find eigenvector for λ = 3 in previous example',
          solution: [
            'Solve (A - 3I)v = 0',
            'A - 3I = [[0, 1], [0, -1]]',
            'System: 0x₁ + 1x₂ = 0, 0x₁ - 1x₂ = 0',
            'Both equations give x₂ = 0, x₁ is free'
          ],
          result: 'Eigenvector: v₁ = [1, 0] (or any scalar multiple)'
        }
      ],
      videoUrl: 'https://www.youtube.com/embed/PFDu9oVAE-g',
      resources: [
        {
          title: '3Blue1Brown - Eigenvalues and Eigenvectors',
          url: 'https://www.3blue1brown.com/lessons/eigenvalues',
          type: 'video'
        },
        {
          title: 'Eigenvalue Applications in Engineering',
          url: 'https://example.com/eigenvalue-applications.pdf',
          type: 'pdf'
        }
      ]
    }
  },
  {
    id: 'rref',
    title: 'Reduced Row Echelon Form (RREF)',
    description: 'Row operations and solving systems of equations',
    category: 'operations',
    content: {
      keyConcepts: [
        'Row Operations: Swap rows, multiply by scalar, add multiple of one row to another',
        'Leading Entry: First non-zero entry in a row (must be 1)',
        'RREF Properties: Leading 1s, zeros above and below leading 1s',
        'Pivot Columns: Columns containing leading 1s',
        'Applications: Solving systems, finding rank, determining linear independence'
      ],
      theory: [
        'RREF is achieved through elementary row operations.',
        'Three types of row operations: row swapping, scalar multiplication, row addition.',
        'In RREF, each leading entry is 1 and is the only non-zero entry in its column.',
        'Leading entries move from left to right as you go down rows.',
        'RREF is unique for any given matrix.',
        'Used to solve systems of linear equations and find matrix rank.'
      ],
      examples: [
        {
          title: 'Converting to RREF',
          problem: 'Convert [[2, 4, 6], [1, 2, 4], [3, 6, 8]] to RREF',
          solution: [
            'R₁ → (1/2)R₁: [[1, 2, 3], [1, 2, 4], [3, 6, 8]]',
            'R₂ → R₂ - R₁: [[1, 2, 3], [0, 0, 1], [3, 6, 8]]',
            'R₃ → R₃ - 3R₁: [[1, 2, 3], [0, 0, 1], [0, 0, -1]]',
            'R₃ → R₃ + R₂: [[1, 2, 3], [0, 0, 1], [0, 0, 0]]',
            'R₁ → R₁ - 3R₂: [[1, 2, 0], [0, 0, 1], [0, 0, 0]]'
          ],
          result: 'RREF: [[1, 2, 0], [0, 0, 1], [0, 0, 0]]'
        }
      ],
      resources: [
        {
          title: 'Row Operations Tutorial',
          url: 'https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces/matrices-elimination',
          type: 'article'
        }
      ]
    }
  }
];

interface NotesSectionProps {
  onTakeQuiz?: (topicId: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ onTakeQuiz }) => {
  const [activeSection, setActiveSection] = useState<'topics' | 'formulas'>('topics');
  const [selectedTopic, setSelectedTopic] = useState<Topic>(topics[0]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const sections = [
    { key: 'topics', label: 'Study Topics', icon: BookOpen },
    { key: 'formulas', label: 'Formula Reference', icon: Calculator }
  ];

  const categories = [
    { key: 'all', label: 'All Topics', color: 'text-gray-600' },
    { key: 'basics', label: 'Basics', color: 'text-blue-600' },
    { key: 'operations', label: 'Operations', color: 'text-green-600' },
    { key: 'advanced', label: 'Advanced', color: 'text-purple-600' },
    { key: 'applications', label: 'Applications', color: 'text-orange-600' },
  ];

  const filteredTopics = activeCategory === 'all' 
    ? topics 
    : topics.filter(topic => topic.category === activeCategory);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return Play;
      default: return ExternalLink;
    }
  };

  if (activeSection === 'formulas') {
    return <FormulaReference />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Study Notes</h2>
          <p className="text-theme-muted">Comprehensive guides and examples for linear algebra concepts</p>
        </div>
      </motion.div>

      {/* Section Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${activeSection === key 
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

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {categories.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${activeCategory === key 
                ? 'bg-theme-accent text-theme-bg shadow-sm' 
                : 'bg-theme-surface text-theme-muted hover:text-theme-text hover:bg-theme-border/50 border border-theme-border'
              }
            `}
          >
            {label}
          </button>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Topics List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-theme-text mb-4">Topics</h3>
          {filteredTopics.map((topic) => (
            <motion.button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`
                w-full p-4 rounded-lg border text-left transition-all duration-200
                ${selectedTopic.id === topic.id 
                  ? 'border-theme-accent bg-theme-accent/10 shadow-sm' 
                  : 'border-theme-border hover:border-theme-accent/50 hover:shadow-sm'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4 className={`font-semibold mb-2 ${
                selectedTopic.id === topic.id ? 'text-theme-accent' : 'text-theme-text'
              }`}>
                {topic.title}
              </h4>
              <p className="text-sm text-theme-muted">{topic.description}</p>
              <div className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                topic.category === 'basics' ? 'bg-blue-100 text-blue-700' :
                topic.category === 'operations' ? 'bg-green-100 text-green-700' :
                topic.category === 'advanced' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {topic.category}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Topic Content */}
        <motion.div
          key={selectedTopic.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-theme-text mb-2">{selectedTopic.title}</h2>
            <p className="text-theme-muted">{selectedTopic.description}</p>
          </div>

          {/* Key Concepts */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold text-theme-text mb-4 flex items-center gap-2">
              <Brain size={20} />
              Key Concepts
            </h3>
            <ul className="space-y-2">
              {selectedTopic.content.keyConcepts.map((concept, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 text-theme-text"
                >
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-medium">{concept}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Theory Section */}
          <div className="bg-theme-surface p-6 rounded-lg border border-theme-border">
            <h3 className="text-xl font-semibold text-theme-text mb-4 flex items-center gap-2">
              <BookOpen size={20} />
              Theory
            </h3>
            <ul className="space-y-3">
              {selectedTopic.content.theory.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 text-theme-text"
                >
                  <span className="w-6 h-6 bg-theme-accent/20 text-theme-accent rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Examples Section */}
          <div className="bg-theme-surface p-6 rounded-lg border border-theme-border">
            <h3 className="text-xl font-semibold text-theme-text mb-4">Worked Examples</h3>
            <div className="space-y-6">
              {selectedTopic.content.examples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-theme-border rounded-lg overflow-hidden"
                >
                  <div className="bg-theme-bg p-4 border-b border-theme-border">
                    <h4 className="font-semibold text-theme-text">{example.title}</h4>
                    <p className="text-theme-muted mt-1">{example.problem}</p>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h5 className="font-medium text-theme-text mb-2">Solution Steps:</h5>
                      <ol className="space-y-2">
                        {example.solution.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm text-theme-muted">
                            <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-800">Final Answer:</div>
                      <code className="text-green-700 font-mono">{example.result}</code>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Video Section */}
          {selectedTopic.content.videoUrl && (
            <div className="bg-theme-surface p-6 rounded-lg border border-theme-border">
              <h3 className="text-xl font-semibold text-theme-text mb-4 flex items-center gap-2">
                <Play size={20} />
                Video Tutorial
              </h3>
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={selectedTopic.content.videoUrl}
                  title={`${selectedTopic.title} Tutorial`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Resources Section */}
          <div className="bg-theme-surface p-6 rounded-lg border border-theme-border">
            <h3 className="text-xl font-semibold text-theme-text mb-4">Additional Resources</h3>
            <div className="grid gap-3">
              {selectedTopic.content.resources.map((resource, index) => {
                const IconComponent = getResourceIcon(resource.type);
                return (
                  <motion.a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-theme-border hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent size={18} className="text-theme-accent" />
                    <span className="text-theme-text font-medium">{resource.title}</span>
                    <ExternalLink size={14} className="text-theme-muted ml-auto" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Take Quiz Button */}
          {onTakeQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={() => onTakeQuiz(selectedTopic.id)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Trophy className="w-5 h-5" />
                Take Quiz on {selectedTopic.title}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotesSection;