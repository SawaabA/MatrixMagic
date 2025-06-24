import React, { useState } from 'react';
import { Trophy, Star, Target, Clock, CheckCircle, X, RotateCcw, Award, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMatrix, addMatrices, determinant, transpose, rref, formatNumber, multiplyMatrices, scalarMultiply, dotProduct, crossProduct, vectorMagnitude } from '../../utils/matrixOperations';
import AdvancedProblems from './AdvancedProblems';

interface Question {
  id: string;
  type: 'matrix-add' | 'determinant' | 'transpose' | 'rref' | 'multiple-choice' | 'matrix-mult' | 'scalar-mult' | 'vector-ops';
  question: string;
  matrices?: number[][][];
  vectors?: number[][];
  scalar?: number;
  correctAnswer: string | number | number[][];
  options?: (string | number)[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation?: string;
}

interface UserProgress {
  level: number;
  xp: number;
  title: string;
  completedQuizzes: string[];
  totalScore: number;
  quizScores: { [key: string]: number };
}

const PracticeSection: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'quizzes' | 'advanced'>('quizzes');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('matrixmagic-progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        level: parsed.level || 1,
        xp: parsed.xp || 0,
        title: parsed.title || 'Matrix Novice',
        completedQuizzes: parsed.completedQuizzes || [],
        totalScore: parsed.totalScore || 0,
        quizScores: parsed.quizScores || {}
      };
    }
    return {
      level: 1,
      xp: 0,
      title: 'Matrix Novice',
      completedQuizzes: [],
      totalScore: 0,
      quizScores: {}
    };
  });

  const modes = [
    { key: 'quizzes', label: 'Quick Quizzes', icon: Trophy, description: 'Fast-paced practice questions' },
    { key: 'advanced', label: 'Advanced Problems', icon: Brain, description: 'Real-world applications and proofs' }
  ];

  const topics = [
    {
      id: 'matrix-basics',
      title: 'Matrix Basics',
      description: 'Fundamental matrix operations and properties',
      difficulty: 'easy',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'determinants',
      title: 'Determinants',
      description: 'Calculate and understand determinants',
      difficulty: 'medium',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'advanced-ops',
      title: 'Advanced Operations',
      description: 'RREF, inverse, and decompositions',
      difficulty: 'hard',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'vectors',
      title: 'Vector Operations',
      description: 'Dot product, cross product, and angles',
      difficulty: 'medium',
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 'matrix-multiplication',
      title: 'Matrix Multiplication',
      description: 'Matrix and scalar multiplication mastery',
      difficulty: 'medium',
      color: 'from-red-400 to-red-600'
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Review',
      description: 'Mixed questions from all topics',
      difficulty: 'hard',
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  const titles = [
    { minXP: 0, title: 'Matrix Novice', icon: '🌱' },
    { minXP: 100, title: 'Vector Apprentice', icon: '📐' },
    { minXP: 300, title: 'Linear Scholar', icon: '📚' },
    { minXP: 600, title: 'Matrix Master', icon: '🎯' },
    { minXP: 1000, title: 'Vector Wizard', icon: '🧙‍♂️' },
    { minXP: 1500, title: 'Rank God', icon: '👑' }
  ];

  const generateQuestions = (topicId: string): Question[] => {
    const questions: Question[] = [];
    
    switch (topicId) {
      case 'matrix-basics':
        // Matrix addition questions
        for (let i = 0; i < 3; i++) {
          const matrixA = [[Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1], 
                          [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1]];
          const matrixB = [[Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1], 
                          [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1]];
          const result = addMatrices(matrixA, matrixB);
          
          const correctStr = `[[${result[0][0]}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong1 = `[[${result[0][0] + 1}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong2 = `[[${result[0][0]}, ${result[0][1] + 1}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong3 = `[[${result[0][0]}, ${result[0][1]}], [${result[1][0] + 1}, ${result[1][1]}]]`;
          
          questions.push({
            id: `add-${i}`,
            type: 'multiple-choice',
            question: `What is the result of adding Matrix A + Matrix B?`,
            matrices: [matrixA, matrixB],
            correctAnswer: correctStr,
            options: [correctStr, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
            difficulty: 'easy',
            points: 10,
            explanation: `To add matrices, add corresponding elements: A[i][j] + B[i][j]`
          });
        }
        
        // Transpose questions
        for (let i = 0; i < 3; i++) {
          const matrix = [[Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1], 
                         [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1]];
          const result = transpose(matrix);
          
          const correctStr = `[[${result[0][0]}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong1 = `[[${matrix[0][0]}, ${matrix[0][1]}], [${matrix[1][0]}, ${matrix[1][1]}]]`;
          const wrong2 = `[[${result[1][0]}, ${result[1][1]}], [${result[0][0]}, ${result[0][1]}]]`;
          const wrong3 = `[[${result[0][1]}, ${result[0][0]}], [${result[1][1]}, ${result[1][0]}]]`;
          
          questions.push({
            id: `transpose-${i}`,
            type: 'multiple-choice',
            question: `What is the transpose of this matrix?`,
            matrices: [matrix],
            correctAnswer: correctStr,
            options: [correctStr, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
            difficulty: 'easy',
            points: 10,
            explanation: `Transpose swaps rows and columns: A^T[i][j] = A[j][i]`
          });
        }
        
        // Basic theory questions
        questions.push({
          id: 'theory-1',
          type: 'multiple-choice',
          question: 'What is the dimension of a 3×4 matrix?',
          correctAnswer: '3 rows, 4 columns',
          options: ['3 rows, 4 columns', '4 rows, 3 columns', '12 elements', '7 total'],
          difficulty: 'easy',
          points: 5,
          explanation: 'Matrix dimensions are written as rows × columns'
        });
        
        questions.push({
          id: 'theory-2',
          type: 'multiple-choice',
          question: 'What is required for matrix addition?',
          correctAnswer: 'Same dimensions',
          options: ['Same dimensions', 'Square matrices', 'Same determinant', 'Invertible matrices'],
          difficulty: 'easy',
          points: 5,
          explanation: 'Matrices can only be added if they have the same number of rows and columns'
        });

        questions.push({
          id: 'theory-3',
          type: 'multiple-choice',
          question: 'What is the identity matrix property?',
          correctAnswer: 'AI = IA = A',
          options: ['AI = IA = A', 'A + I = 2A', 'A - I = 0', 'A/I = A'],
          difficulty: 'easy',
          points: 5,
          explanation: 'The identity matrix I satisfies AI = IA = A for any compatible matrix A'
        });
        break;
        
      case 'determinants':
        for (let i = 0; i < 5; i++) {
          const a = Math.floor(Math.random() * 5) + 1;
          const b = Math.floor(Math.random() * 5) + 1;
          const c = Math.floor(Math.random() * 5) + 1;
          const d = Math.floor(Math.random() * 5) + 1;
          const matrix = [[a, b], [c, d]];
          const det = determinant(matrix);
          const wrongAnswers = [det + 1, det - 1, det * 2, a + d].filter(x => x !== det);
          
          questions.push({
            id: `det-${i}`,
            type: 'multiple-choice',
            question: `What is the determinant of this 2×2 matrix?`,
            matrices: [matrix],
            correctAnswer: det,
            options: [det, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5),
            difficulty: 'medium',
            points: 15,
            explanation: `For a 2×2 matrix [[a,b],[c,d]], det = ad - bc = ${a}×${d} - ${b}×${c} = ${det}`
          });
        }
        
        // 3x3 determinant questions
        for (let i = 0; i < 2; i++) {
          const matrix = [
            [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1],
            [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1],
            [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1]
          ];
          const det = determinant(matrix);
          const wrongAnswers = [det + 1, det - 1, det + 2, det - 2].filter(x => x !== det);
          
          questions.push({
            id: `det3x3-${i}`,
            type: 'multiple-choice',
            question: `What is the determinant of this 3×3 matrix?`,
            matrices: [matrix],
            correctAnswer: det,
            options: [det, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5),
            difficulty: 'hard',
            points: 25,
            explanation: `Use cofactor expansion along the first row to calculate the 3×3 determinant`
          });
        }
        
        // Theory questions
        questions.push({
          id: 'det-theory-1',
          type: 'multiple-choice',
          question: 'What does a determinant of 0 indicate?',
          correctAnswer: 'Matrix is singular (not invertible)',
          options: ['Matrix is singular (not invertible)', 'Matrix is invertible', 'Matrix is symmetric', 'Matrix is diagonal'],
          difficulty: 'medium',
          points: 10,
          explanation: 'A determinant of 0 means the matrix is singular and has no inverse'
        });
        
        questions.push({
          id: 'det-theory-2',
          type: 'multiple-choice',
          question: 'How does swapping two rows affect the determinant?',
          correctAnswer: 'Changes sign',
          options: ['Changes sign', 'Doubles the value', 'Makes it zero', 'No change'],
          difficulty: 'medium',
          points: 10,
          explanation: 'Swapping two rows of a matrix changes the sign of the determinant'
        });

        questions.push({
          id: 'det-theory-3',
          type: 'multiple-choice',
          question: 'What is det(AB) in terms of det(A) and det(B)?',
          correctAnswer: 'det(A) × det(B)',
          options: ['det(A) × det(B)', 'det(A) + det(B)', 'det(A) - det(B)', 'det(A) / det(B)'],
          difficulty: 'medium',
          points: 15,
          explanation: 'The determinant of a product equals the product of determinants: det(AB) = det(A)det(B)'
        });
        break;

      case 'matrix-multiplication':
        // Matrix multiplication questions
        for (let i = 0; i < 4; i++) {
          const matrixA = [[Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1], 
                          [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1]];
          const matrixB = [[Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1], 
                          [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1]];
          const result = multiplyMatrices(matrixA, matrixB);
          
          const correctStr = `[[${result[0][0]}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong1 = `[[${result[0][0] + 1}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong2 = `[[${result[0][0]}, ${result[0][1] + 1}], [${result[1][0]}, ${result[1][1]}]]`;
          const addResult = addMatrices(matrixA, matrixB);
          const wrong3 = `[[${addResult[0][0]}, ${addResult[0][1]}], [${addResult[1][0]}, ${addResult[1][1]}]]`;
          
          questions.push({
            id: `mult-${i}`,
            type: 'multiple-choice',
            question: `What is the result of multiplying Matrix A × Matrix B?`,
            matrices: [matrixA, matrixB],
            correctAnswer: correctStr,
            options: [correctStr, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
            difficulty: 'medium',
            points: 20,
            explanation: `Matrix multiplication: (AB)[i][j] = Σ A[i][k] × B[k][j]`
          });
        }

        // Scalar multiplication questions
        for (let i = 0; i < 3; i++) {
          const scalar = Math.floor(Math.random() * 5) + 2;
          const matrix = [[Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1], 
                         [Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1]];
          const result = scalarMultiply(matrix, scalar);
          
          const correctStr = `[[${result[0][0]}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong1 = `[[${matrix[0][0] + scalar}, ${matrix[0][1] + scalar}], [${matrix[1][0] + scalar}, ${matrix[1][1] + scalar}]]`;
          const wrong2 = `[[${result[0][0] + 1}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
          const wrong3 = `[[${matrix[0][0]}, ${matrix[0][1]}], [${matrix[1][0]}, ${matrix[1][1]}]]`;
          
          questions.push({
            id: `scalar-${i}`,
            type: 'multiple-choice',
            question: `What is ${scalar} × Matrix A?`,
            matrices: [matrix],
            scalar: scalar,
            correctAnswer: correctStr,
            options: [correctStr, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
            difficulty: 'easy',
            points: 15,
            explanation: `Scalar multiplication: multiply every element by the scalar ${scalar}`
          });
        }

        // Theory questions
        questions.push({
          id: 'mult-theory-1',
          type: 'multiple-choice',
          question: 'For matrix multiplication AB to be defined, what must be true?',
          correctAnswer: 'Columns of A = Rows of B',
          options: ['Columns of A = Rows of B', 'A and B are square', 'A and B have same dimensions', 'A and B are invertible'],
          difficulty: 'medium',
          points: 10,
          explanation: 'Matrix multiplication AB requires the number of columns in A to equal the number of rows in B'
        });
        break;
        
      case 'advanced-ops':
        // RREF questions
        for (let i = 0; i < 3; i++) {
          questions.push({
            id: `rref-theory-${i}`,
            type: 'multiple-choice',
            question: 'What is the first step in RREF?',
            correctAnswer: 'Get leading 1 in first row',
            options: ['Get leading 1 in first row', 'Make all entries positive', 'Sort rows by size', 'Calculate determinant'],
            difficulty: 'hard',
            points: 20,
            explanation: 'RREF starts by getting a leading 1 in the first row, first column'
          });
        }
        
        // Inverse questions
        questions.push({
          id: 'inverse-theory-1',
          type: 'multiple-choice',
          question: 'When does a matrix have an inverse?',
          correctAnswer: 'When determinant ≠ 0',
          options: ['When determinant ≠ 0', 'When it\'s symmetric', 'When it\'s square', 'Always'],
          difficulty: 'hard',
          points: 15,
          explanation: 'A matrix has an inverse if and only if its determinant is non-zero'
        });
        
        questions.push({
          id: 'inverse-theory-2',
          type: 'multiple-choice',
          question: 'What is A × A⁻¹?',
          correctAnswer: 'Identity matrix',
          options: ['Identity matrix', 'Zero matrix', 'A²', 'Transpose of A'],
          difficulty: 'hard',
          points: 15,
          explanation: 'A matrix multiplied by its inverse gives the identity matrix'
        });

        questions.push({
          id: 'rank-theory-1',
          type: 'multiple-choice',
          question: 'What does the rank of a matrix represent?',
          correctAnswer: 'Number of linearly independent rows/columns',
          options: ['Number of linearly independent rows/columns', 'Number of non-zero entries', 'Determinant value', 'Matrix size'],
          difficulty: 'hard',
          points: 20,
          explanation: 'Rank is the dimension of the vector space spanned by the rows (or columns) of the matrix'
        });

        questions.push({
          id: 'rref-theory-2',
          type: 'multiple-choice',
          question: 'In RREF, what must be true about leading entries?',
          correctAnswer: 'They are 1 and only non-zero in their column',
          options: ['They are 1 and only non-zero in their column', 'They are the largest in their row', 'They are positive', 'They are integers'],
          difficulty: 'hard',
          points: 15,
          explanation: 'In RREF, each leading entry is 1 and is the only non-zero entry in its column'
        });
        break;
        
      case 'vectors':
        // Vector theory questions
        questions.push({
          id: 'vector-theory-1',
          type: 'multiple-choice',
          question: 'What is the dot product of perpendicular vectors?',
          correctAnswer: '0',
          options: ['0', '1', '-1', 'Undefined'],
          difficulty: 'medium',
          points: 15,
          explanation: 'Perpendicular vectors have a dot product of 0'
        });
        
        questions.push({
          id: 'vector-theory-2',
          type: 'multiple-choice',
          question: 'Cross product is only defined for which dimension?',
          correctAnswer: '3D vectors',
          options: ['3D vectors', '2D vectors', 'Any dimension', '4D vectors'],
          difficulty: 'medium',
          points: 15,
          explanation: 'Cross product is specifically defined for 3-dimensional vectors'
        });
        
        // Dot product calculations
        for (let i = 0; i < 4; i++) {
          const a = Math.floor(Math.random() * 4) + 1;
          const b = Math.floor(Math.random() * 4) + 1;
          const c = Math.floor(Math.random() * 4) + 1;
          const d = Math.floor(Math.random() * 4) + 1;
          const vectorA = [a, b];
          const vectorB = [c, d];
          const dotProd = dotProduct(vectorA, vectorB);
          
          questions.push({
            id: `dot-${i}`,
            type: 'multiple-choice',
            question: `What is the dot product of [${a}, ${b}] and [${c}, ${d}]?`,
            vectors: [vectorA, vectorB],
            correctAnswer: dotProd,
            options: [dotProd, dotProd + 1, dotProd - 1, dotProd * 2].sort(() => Math.random() - 0.5),
            difficulty: 'medium',
            points: 15,
            explanation: `Dot product = ${a}×${c} + ${b}×${d} = ${dotProd}`
          });
        }

        // Vector magnitude questions
        for (let i = 0; i < 3; i++) {
          const x = Math.floor(Math.random() * 5) + 1;
          const y = Math.floor(Math.random() * 5) + 1;
          const vector = [x, y];
          const magnitude = vectorMagnitude(vector);
          const roundedMag = Math.round(magnitude * 100) / 100;
          
          questions.push({
            id: `magnitude-${i}`,
            type: 'multiple-choice',
            question: `What is the magnitude of vector [${x}, ${y}]?`,
            vectors: [vector],
            correctAnswer: roundedMag,
            options: [roundedMag, roundedMag + 1, Math.round((magnitude + 0.5) * 100) / 100, x + y].sort(() => Math.random() - 0.5),
            difficulty: 'medium',
            points: 15,
            explanation: `Magnitude = √(${x}² + ${y}²) = √${x*x + y*y} = ${roundedMag}`
          });
        }

        questions.push({
          id: 'vector-theory-3',
          type: 'multiple-choice',
          question: 'What is a unit vector?',
          correctAnswer: 'A vector with magnitude 1',
          options: ['A vector with magnitude 1', 'A vector with all components equal to 1', 'The zero vector', 'A vector in the x-direction'],
          difficulty: 'medium',
          points: 10,
          explanation: 'A unit vector has magnitude (length) equal to 1'
        });
        break;

      case 'comprehensive':
        // Mix of all topics - harder questions
        const allTopics = ['matrix-basics', 'determinants', 'matrix-multiplication', 'vectors', 'advanced-ops'];
        for (let topic of allTopics) {
          const topicQuestions = generateQuestions(topic).slice(0, 2);
          questions.push(...topicQuestions);
        }

        // Additional challenging questions
        questions.push({
          id: 'comprehensive-1',
          type: 'multiple-choice',
          question: 'If A is a 3×4 matrix and B is a 4×2 matrix, what is the dimension of AB?',
          correctAnswer: '3×2',
          options: ['3×2', '4×4', '3×4', 'Undefined'],
          difficulty: 'hard',
          points: 20,
          explanation: 'When multiplying matrices, the result has dimensions (rows of A) × (columns of B)'
        });

        questions.push({
          id: 'comprehensive-2',
          type: 'multiple-choice',
          question: 'Which property is NOT true for matrix operations?',
          correctAnswer: 'AB = BA (commutative)',
          options: ['AB = BA (commutative)', 'A(BC) = (AB)C (associative)', '(A + B)ᵀ = Aᵀ + Bᵀ', 'det(AB) = det(A)det(B)'],
          difficulty: 'hard',
          points: 25,
          explanation: 'Matrix multiplication is NOT commutative: AB ≠ BA in general'
        });
        break;
        
      default:
        questions.push({
          id: 'default-1',
          type: 'multiple-choice',
          question: 'What is 2 + 2?',
          correctAnswer: 4,
          options: [3, 4, 5, 6],
          difficulty: 'easy',
          points: 5
        });
    }
    
    return questions.slice(0, 10); // Limit to 10 questions per quiz
  };

  const startQuiz = (topicId: string) => {
    const questions = generateQuestions(topicId);
    setCurrentQuiz(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setQuizComplete(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setSelectedTopic(topicId);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isCorrect = String(selectedAnswer) === String(currentQuestion.correctAnswer);
    
    if (isCorrect) {
      setScore(score + currentQuestion.points);
      setCorrectAnswers(correctAnswers + 1);
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        completeQuiz();
      }
    }, 2500);
  };

  const completeQuiz = () => {
    const newXP = userProgress.xp + score;
    const newLevel = Math.floor(newXP / 100) + 1;
    const currentTitle = [...titles].reverse().find(t => newXP >= t.minXP) || titles[0];
    
    const updatedProgress = {
      ...userProgress,
      xp: newXP,
      level: newLevel,
      title: currentTitle.title,
      completedQuizzes: userProgress.completedQuizzes.includes(selectedTopic) 
        ? userProgress.completedQuizzes 
        : [...userProgress.completedQuizzes, selectedTopic],
      totalScore: userProgress.totalScore + score,
      quizScores: {
        ...userProgress.quizScores,
        [selectedTopic]: Math.max(userProgress.quizScores[selectedTopic] || 0, score)
      }
    };
    
    setUserProgress(updatedProgress);
    localStorage.setItem('matrixmagic-progress', JSON.stringify(updatedProgress));
    setQuizComplete(true);
  };

  const resetQuiz = () => {
    setCurrentQuiz([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setQuizComplete(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setSelectedTopic('');
  };

  const formatMatrix = (matrix: number[][]) => {
    return (
      <div className="inline-block">
        <div className="relative">
          {matrix.map((row, i) => (
            <div key={i} className="flex gap-1 justify-center">
              {row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className="w-12 h-12 bg-theme-bg border border-theme-border rounded flex items-center justify-center text-theme-text font-mono text-sm"
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
          <div className="absolute left-0 top-0 bottom-0 w-1 border-l-2 border-t-2 border-b-2 border-theme-accent rounded-l"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 border-r-2 border-t-2 border-b-2 border-theme-accent rounded-r"></div>
        </div>
      </div>
    );
  };

  const formatVector = (vector: number[]) => {
    return (
      <div className="inline-block">
        <div className="relative">
          <div className="flex flex-col gap-1 justify-center">
            {vector.map((component, i) => (
              <div
                key={i}
                className="w-12 h-8 bg-theme-bg border border-theme-border rounded flex items-center justify-center text-theme-text font-mono text-sm"
              >
                {component}
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 border-l-2 border-t-2 border-b-2 border-theme-accent rounded-l"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 border-r-2 border-t-2 border-b-2 border-theme-accent rounded-r"></div>
        </div>
      </div>
    );
  };

  const currentQuestion = currentQuiz[currentQuestionIndex];
  const progress = currentQuiz.length > 0 ? ((currentQuestionIndex + 1) / currentQuiz.length) * 100 : 0;

  if (activeMode === 'advanced') {
    return <AdvancedProblems />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Practice & Level Up</h2>
          <p className="text-theme-muted">Test your knowledge and earn XP to unlock new titles</p>
        </div>
      </motion.div>

      {/* Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2"
      >
        {modes.map(({ key, label, icon: Icon, description }) => (
          <button
            key={key}
            onClick={() => setActiveMode(key as any)}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 text-left
              ${activeMode === key 
                ? 'border-theme-accent bg-theme-accent/10 shadow-lg' 
                : 'border-theme-border hover:border-theme-accent/50 hover:shadow-md'
              }
            `}
          >
            <div className={`p-2 rounded-lg ${
              activeMode === key 
                ? 'bg-theme-accent text-theme-bg' 
                : 'bg-theme-border text-theme-muted'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold transition-colors ${
                activeMode === key ? 'text-theme-accent' : 'text-theme-text'
              }`}>
                {label}
              </h3>
              <p className="text-theme-muted text-sm">{description}</p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* User Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-magic-500/10 to-warmAccent-500/10 rounded-xl p-6 border border-theme-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-magic-400 to-magic-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userProgress.level}
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-text">{userProgress.title}</h3>
              <p className="text-theme-muted">Level {userProgress.level} • {userProgress.xp} XP</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-theme-accent">{userProgress.totalScore}</div>
            <div className="text-sm text-theme-muted">Total Score</div>
          </div>
        </div>
        
        <div className="w-full bg-theme-border rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-magic-500 to-warmAccent-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(userProgress.xp % 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-theme-muted mt-1">
          {100 - (userProgress.xp % 100)} XP to next level
        </div>
      </motion.div>

      {currentQuiz.length === 0 ? (
        /* Topic Selection */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-theme-surface rounded-xl border border-theme-border p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${topic.color} rounded-lg flex items-center justify-center`}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-theme-text mb-2">{topic.title}</h3>
                  <p className="text-theme-muted mb-3">{topic.description}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    topic.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {topic.difficulty.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-theme-muted">
                  <Clock className="w-4 h-4" />
                  <span>~8 minutes</span>
                </div>
                <button
                  onClick={() => startQuiz(topic.id)}
                  className="px-4 py-2 bg-theme-accent text-theme-bg font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Start Quiz
                </button>
              </div>
              
              {userProgress.completedQuizzes.includes(topic.id) && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  {userProgress.quizScores[topic.id] && (
                    <div className="text-sm text-theme-muted">
                      Best: {userProgress.quizScores[topic.id]} pts
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : quizComplete ? (
        /* Quiz Complete */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-magic-400 to-magic-600 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-12 h-12 text-white" />
          </div>
          
          <div>
            <h3 className="text-3xl font-bold text-theme-text mb-2">Quiz Complete!</h3>
            <p className="text-xl text-theme-muted">You earned {score} XP</p>
          </div>
          
          <div className="bg-theme-surface rounded-xl p-6 border border-theme-border max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-theme-accent">{score}</div>
                <div className="text-sm text-theme-muted">Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-theme-accent">
                  {correctAnswers}/{currentQuiz.length}
                </div>
                <div className="text-sm text-theme-muted">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-theme-accent">
                  {Math.round((correctAnswers / currentQuiz.length) * 100)}%
                </div>
                <div className="text-sm text-theme-muted">Accuracy</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-theme-accent text-theme-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Another Quiz
            </button>
            <button
              onClick={() => startQuiz(selectedTopic)}
              className="px-6 py-3 border border-theme-border text-theme-text font-semibold rounded-lg hover:bg-theme-border/50 transition-colors"
            >
              Retry This Quiz
            </button>
          </div>
        </motion.div>
      ) : (
        /* Quiz Interface */
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-theme-surface rounded-lg p-4 border border-theme-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-theme-text">
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </span>
              <span className="text-sm font-medium text-theme-accent">
                Score: {score}
              </span>
            </div>
            <div className="w-full bg-theme-border rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-magic-500 to-warmAccent-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-theme-surface rounded-xl p-8 border border-theme-border"
            >
              <h3 className="text-xl font-bold text-theme-text mb-6">
                {currentQuestion?.question}
              </h3>

              {/* Matrix Display */}
              {currentQuestion?.matrices && (
                <div className="mb-6 space-y-4">
                  {currentQuestion.matrices.map((matrix, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm font-medium text-theme-muted">
                        Matrix {String.fromCharCode(65 + index)}:
                      </div>
                      <div className="flex justify-center">
                        {formatMatrix(matrix)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vector Display */}
              {currentQuestion?.vectors && (
                <div className="mb-6 space-y-4">
                  {currentQuestion.vectors.map((vector, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm font-medium text-theme-muted">
                        Vector {String.fromCharCode(65 + index)}:
                      </div>
                      <div className="flex justify-center">
                        {formatVector(vector)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scalar Display */}
              {currentQuestion?.scalar && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-theme-muted mb-2">
                    Scalar:
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-theme-accent">{currentQuestion.scalar}</span>
                  </div>
                </div>
              )}

              {/* Answer Options */}
              {currentQuestion?.options && (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedAnswer === option
                          ? 'border-theme-accent bg-theme-accent/10 text-theme-accent'
                          : 'border-theme-border hover:border-theme-accent/50 text-theme-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === option
                            ? 'border-theme-accent bg-theme-accent text-theme-bg'
                            : 'border-theme-border'
                        }`}>
                          {selectedAnswer === option && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span className="font-mono text-sm">{String(option)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-between items-center">
                <button
                  onClick={resetQuiz}
                  className="flex items-center gap-2 px-4 py-2 text-theme-muted hover:text-theme-text transition-colors"
                >
                  <X className="w-4 h-4" />
                  Exit Quiz
                </button>
                
                <button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null || showResult}
                  className="px-6 py-3 bg-theme-accent text-theme-bg font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showResult ? 'Next Question...' : 'Submit Answer'}
                </button>
              </div>

              {/* Result Feedback */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-lg border-2 ${
                      String(selectedAnswer) === String(currentQuestion.correctAnswer)
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {String(selectedAnswer) === String(currentQuestion.correctAnswer) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      <span className="font-medium">
                        {String(selectedAnswer) === String(currentQuestion.correctAnswer) 
                          ? `Correct! +${currentQuestion.points} XP` 
                          : 'Incorrect'
                        }
                      </span>
                    </div>
                    {String(selectedAnswer) !== String(currentQuestion.correctAnswer) && (
                      <div className="text-sm mb-2">
                        <strong>Correct answer:</strong> {String(currentQuestion.correctAnswer)}
                      </div>
                    )}
                    {currentQuestion.explanation && (
                      <div className="text-sm">
                        <strong>Explanation:</strong> {currentQuestion.explanation}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PracticeSection;