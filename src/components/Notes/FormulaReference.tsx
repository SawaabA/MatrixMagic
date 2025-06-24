import React, { useState } from 'react';
import { BookOpen, Search, Copy, Star, Calculator, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Formula {
  id: string;
  name: string;
  formula: string;
  description: string;
  category: 'basic' | 'operations' | 'properties' | 'advanced' | 'vectors';
  example?: string;
  conditions?: string;
}

const formulas: Formula[] = [
  // Basic Operations
  {
    id: 'matrix-add',
    name: 'Matrix Addition',
    formula: '(A + B)ᵢⱼ = Aᵢⱼ + Bᵢⱼ',
    description: 'Add corresponding elements of matrices with same dimensions',
    category: 'basic',
    example: '[[1,2],[3,4]] + [[5,6],[7,8]] = [[6,8],[10,12]]',
    conditions: 'A and B must have same dimensions'
  },
  {
    id: 'matrix-mult',
    name: 'Matrix Multiplication',
    formula: '(AB)ᵢⱼ = Σₖ AᵢₖBₖⱼ',
    description: 'Multiply matrices using row-by-column rule',
    category: 'basic',
    example: '[[1,2],[3,4]] × [[5,6],[7,8]] = [[19,22],[43,50]]',
    conditions: 'Columns of A must equal rows of B'
  },
  {
    id: 'scalar-mult',
    name: 'Scalar Multiplication',
    formula: '(cA)ᵢⱼ = c·Aᵢⱼ',
    description: 'Multiply every element by a scalar',
    category: 'basic',
    example: '3 × [[1,2],[3,4]] = [[3,6],[9,12]]'
  },
  
  // Matrix Properties
  {
    id: 'transpose',
    name: 'Matrix Transpose',
    formula: '(Aᵀ)ᵢⱼ = Aⱼᵢ',
    description: 'Flip matrix over its main diagonal',
    category: 'operations',
    example: '[[1,2,3],[4,5,6]]ᵀ = [[1,4],[2,5],[3,6]]'
  },
  {
    id: 'determinant-2x2',
    name: '2×2 Determinant',
    formula: 'det([[a,b],[c,d]]) = ad - bc',
    description: 'Determinant of 2×2 matrix',
    category: 'operations',
    example: 'det([[1,2],[3,4]]) = 1×4 - 2×3 = -2'
  },
  {
    id: 'determinant-3x3',
    name: '3×3 Determinant',
    formula: 'det(A) = a₁₁(a₂₂a₃₃ - a₂₃a₃₂) - a₁₂(a₂₁a₃₃ - a₂₃a₃₁) + a₁₃(a₂₁a₃₂ - a₂₂a₃₁)',
    description: 'Determinant using cofactor expansion',
    category: 'operations'
  },
  {
    id: 'inverse-2x2',
    name: '2×2 Matrix Inverse',
    formula: 'A⁻¹ = (1/det(A)) × [[d,-b],[-c,a]]',
    description: 'Inverse of 2×2 matrix [[a,b],[c,d]]',
    category: 'operations',
    conditions: 'det(A) ≠ 0'
  },
  
  // Properties
  {
    id: 'transpose-props',
    name: 'Transpose Properties',
    formula: '(A + B)ᵀ = Aᵀ + Bᵀ, (AB)ᵀ = BᵀAᵀ, (Aᵀ)ᵀ = A',
    description: 'Key properties of matrix transpose',
    category: 'properties'
  },
  {
    id: 'determinant-props',
    name: 'Determinant Properties',
    formula: 'det(AB) = det(A)det(B), det(Aᵀ) = det(A), det(cA) = cⁿdet(A)',
    description: 'Important determinant properties',
    category: 'properties'
  },
  {
    id: 'inverse-props',
    name: 'Inverse Properties',
    formula: '(AB)⁻¹ = B⁻¹A⁻¹, (Aᵀ)⁻¹ = (A⁻¹)ᵀ, (A⁻¹)⁻¹ = A',
    description: 'Key properties of matrix inverse',
    category: 'properties'
  },
  
  // Advanced
  {
    id: 'eigenvalue',
    name: 'Eigenvalue Equation',
    formula: 'Av = λv',
    description: 'Eigenvalue λ and eigenvector v relationship',
    category: 'advanced',
    conditions: 'v ≠ 0'
  },
  {
    id: 'characteristic',
    name: 'Characteristic Polynomial',
    formula: 'det(A - λI) = 0',
    description: 'Equation to find eigenvalues',
    category: 'advanced'
  },
  {
    id: 'trace',
    name: 'Matrix Trace',
    formula: 'tr(A) = Σᵢ Aᵢᵢ = λ₁ + λ₂ + ... + λₙ',
    description: 'Sum of diagonal elements equals sum of eigenvalues',
    category: 'advanced'
  },
  {
    id: 'rank',
    name: 'Matrix Rank',
    formula: 'rank(A) = number of linearly independent rows/columns',
    description: 'Dimension of column space or row space',
    category: 'advanced'
  },
  
  // Vectors
  {
    id: 'dot-product',
    name: 'Dot Product',
    formula: 'a · b = Σᵢ aᵢbᵢ = |a||b|cos(θ)',
    description: 'Scalar product of two vectors',
    category: 'vectors',
    example: '[1,2,3] · [4,5,6] = 1×4 + 2×5 + 3×6 = 32'
  },
  {
    id: 'cross-product',
    name: 'Cross Product (3D)',
    formula: 'a × b = [a₂b₃ - a₃b₂, a₃b₁ - a₁b₃, a₁b₂ - a₂b₁]',
    description: 'Vector product perpendicular to both vectors',
    category: 'vectors',
    conditions: 'Only defined for 3D vectors'
  },
  {
    id: 'vector-magnitude',
    name: 'Vector Magnitude',
    formula: '|v| = √(v₁² + v₂² + ... + vₙ²)',
    description: 'Length or norm of a vector',
    category: 'vectors',
    example: '|[3,4]| = √(3² + 4²) = √25 = 5'
  },
  {
    id: 'unit-vector',
    name: 'Unit Vector',
    formula: 'û = v/|v|',
    description: 'Vector with magnitude 1 in same direction',
    category: 'vectors',
    conditions: 'v ≠ 0'
  }
];

const FormulaReference: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('formula-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const categories = [
    { key: 'all', label: 'All Formulas', color: 'text-gray-600' },
    { key: 'basic', label: 'Basic Operations', color: 'text-blue-600' },
    { key: 'operations', label: 'Matrix Operations', color: 'text-green-600' },
    { key: 'properties', label: 'Properties', color: 'text-purple-600' },
    { key: 'advanced', label: 'Advanced', color: 'text-red-600' },
    { key: 'vectors', label: 'Vectors', color: 'text-orange-600' },
  ];

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (formulaId: string) => {
    const newFavorites = favorites.includes(formulaId)
      ? favorites.filter(id => id !== formulaId)
      : [...favorites, formulaId];
    
    setFavorites(newFavorites);
    localStorage.setItem('formula-favorites', JSON.stringify(newFavorites));
  };

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula).then(() => {
      // Could add a toast notification here
      console.log('Formula copied to clipboard');
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'operations': return 'bg-green-100 text-green-700 border-green-200';
      case 'properties': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      case 'vectors': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Formula Reference</h2>
          <p className="text-theme-muted">Quick access to essential linear algebra formulas</p>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Search formulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${selectedCategory === key 
                  ? 'bg-theme-accent text-theme-bg shadow-sm' 
                  : 'bg-theme-surface text-theme-muted hover:text-theme-text hover:bg-theme-border/50 border border-theme-border'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Formulas Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4"
      >
        <AnimatePresence>
          {filteredFormulas.map((formula, index) => (
            <motion.div
              key={formula.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-theme-surface rounded-xl border border-theme-border p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-theme-accent/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-theme-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-text">{formula.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(formula.category)}`}>
                      {formula.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(formula.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(formula.id)
                        ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                        : 'text-theme-muted hover:text-theme-text hover:bg-theme-border/50'
                    }`}
                    title={favorites.includes(formula.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-5 h-5 ${favorites.includes(formula.id) ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => copyFormula(formula.formula)}
                    className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border/50 transition-colors"
                    title="Copy formula"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Formula */}
                <div className="p-4 bg-theme-bg rounded-lg border border-theme-border">
                  <div className="font-mono text-lg text-theme-accent break-all">
                    {formula.formula}
                  </div>
                </div>

                {/* Description */}
                <p className="text-theme-text">{formula.description}</p>

                {/* Example */}
                {formula.example && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Example:</div>
                    <div className="font-mono text-sm text-blue-700">{formula.example}</div>
                  </div>
                )}

                {/* Conditions */}
                {formula.conditions && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Conditions:</div>
                    <div className="text-sm text-yellow-700">{formula.conditions}</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {filteredFormulas.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-theme-border/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-theme-muted" />
          </div>
          <h3 className="text-lg font-semibold text-theme-text mb-2">No formulas found</h3>
          <p className="text-theme-muted">Try adjusting your search terms or category filter.</p>
        </motion.div>
      )}

      {/* Favorites Summary */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <h3 className="text-lg font-semibold text-yellow-800">Your Favorites</h3>
          </div>
          <p className="text-yellow-700">
            You have {favorites.length} favorite formula{favorites.length !== 1 ? 's' : ''} saved.
            {selectedCategory === 'all' ? ' Filter by favorites to see only your saved formulas.' : ''}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FormulaReference;