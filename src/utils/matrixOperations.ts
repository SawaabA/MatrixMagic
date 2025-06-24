// Matrix operation utilities for LinearAlgebra learning app

export type Matrix = number[][];
export type Vector = number[];

// Basic matrix operations
export const createMatrix = (rows: number, cols: number, fill = 0): Matrix => {
  return Array(rows).fill(null).map(() => Array(cols).fill(fill));
};

export const isValidMatrix = (matrix: Matrix): boolean => {
  if (!matrix || matrix.length === 0) return false;
  const cols = matrix[0].length;
  return matrix.every(row => row.length === cols);
};

export const addMatrices = (a: Matrix, b: Matrix): Matrix => {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for addition');
  }
  
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
};

export const subtractMatrices = (a: Matrix, b: Matrix): Matrix => {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for subtraction');
  }
  
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
};

export const multiplyMatrices = (a: Matrix, b: Matrix): Matrix => {
  if (a[0].length !== b.length) {
    throw new Error('Number of columns in first matrix must equal number of rows in second matrix');
  }
  
  const result = createMatrix(a.length, b[0].length);
  
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < a[0].length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  
  return result;
};

export const scalarMultiply = (matrix: Matrix, scalar: number): Matrix => {
  return matrix.map(row => row.map(val => val * scalar));
};

export const transpose = (matrix: Matrix): Matrix => {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

export const determinant = (matrix: Matrix): number => {
  const n = matrix.length;
  if (n !== matrix[0].length) {
    throw new Error('Matrix must be square to calculate determinant');
  }
  
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  
  let det = 0;
  for (let i = 0; i < n; i++) {
    const minor = matrix.slice(1).map(row => row.filter((_, j) => j !== i));
    det += matrix[0][i] * Math.pow(-1, i) * determinant(minor);
  }
  
  return det;
};

export const inverse = (matrix: Matrix): Matrix => {
  const n = matrix.length;
  if (n !== matrix[0].length) {
    throw new Error('Matrix must be square to calculate inverse');
  }
  
  const det = determinant(matrix);
  if (Math.abs(det) < 1e-10) {
    throw new Error('Matrix is singular and cannot be inverted');
  }
  
  if (n === 2) {
    const [[a, b], [c, d]] = matrix;
    return [
      [d / det, -b / det],
      [-c / det, a / det]
    ];
  }
  
  // For larger matrices, use Gauss-Jordan elimination
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  ]);
  
  return gaussJordan(augmented).slice(0, n).map(row => row.slice(n));
};

export const rref = (matrix: Matrix): Matrix => {
  const result = matrix.map(row => [...row]);
  const rows = result.length;
  const cols = result[0].length;
  
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
    
    // Swap rows
    [result[pivotRow], result[maxRow]] = [result[maxRow], result[pivotRow]];
    
    // Scale pivot row
    const pivot = result[pivotRow][col];
    for (let j = 0; j < cols; j++) {
      result[pivotRow][j] /= pivot;
    }
    
    // Eliminate column
    for (let i = 0; i < rows; i++) {
      if (i !== pivotRow && Math.abs(result[i][col]) > 1e-10) {
        const factor = result[i][col];
        for (let j = 0; j < cols; j++) {
          result[i][j] -= factor * result[pivotRow][j];
        }
      }
    }
    
    pivotRow++;
  }
  
  return result;
};

const gaussJordan = (matrix: Matrix): Matrix => {
  const result = matrix.map(row => [...row]);
  const rows = result.length;
  const cols = result[0].length;
  
  for (let i = 0; i < Math.min(rows, cols); i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < rows; k++) {
      if (Math.abs(result[k][i]) > Math.abs(result[maxRow][i])) {
        maxRow = k;
      }
    }
    
    [result[i], result[maxRow]] = [result[maxRow], result[i]];
    
    // Scale pivot row
    const pivot = result[i][i];
    if (Math.abs(pivot) < 1e-10) continue;
    
    for (let j = 0; j < cols; j++) {
      result[i][j] /= pivot;
    }
    
    // Eliminate column
    for (let k = 0; k < rows; k++) {
      if (k !== i) {
        const factor = result[k][i];
        for (let j = 0; j < cols; j++) {
          result[k][j] -= factor * result[i][j];
        }
      }
    }
  }
  
  return result;
};

export const rank = (matrix: Matrix): number => {
  const rrefMatrix = rref(matrix);
  let rank = 0;
  
  for (const row of rrefMatrix) {
    if (row.some(val => Math.abs(val) > 1e-10)) {
      rank++;
    }
  }
  
  return rank;
};

export const dotProduct = (a: Vector, b: Vector): number => {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length for dot product');
  }
  
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
};

export const crossProduct = (a: Vector, b: Vector): Vector => {
  if (a.length !== 3 || b.length !== 3) {
    throw new Error('Cross product is only defined for 3D vectors');
  }
  
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
};

export const vectorMagnitude = (vector: Vector): number => {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
};

export const normalizeVector = (vector: Vector): Vector => {
  const magnitude = vectorMagnitude(vector);
  if (magnitude === 0) throw new Error('Cannot normalize zero vector');
  return vector.map(val => val / magnitude);
};

export const angleBetweenVectors = (a: Vector, b: Vector): number => {
  const dot = dotProduct(a, b);
  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);
  
  if (magA === 0 || magB === 0) throw new Error('Cannot calculate angle with zero vector');
  
  return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
};

// Format number for display
export const formatNumber = (num: number, precision = 4): string => {
  if (Math.abs(num) < 1e-10) return '0';
  if (Number.isInteger(num)) return num.toString();
  return parseFloat(num.toFixed(precision)).toString();
};