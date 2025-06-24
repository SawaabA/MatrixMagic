import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Matrix, createMatrix, formatNumber } from '../utils/matrixOperations';

interface MatrixInputProps {
  matrix: Matrix;
  onChange: (matrix: Matrix) => void;
  label: string;
  maxRows?: number;
  maxCols?: number;
}

const MatrixInput: React.FC<MatrixInputProps> = ({ 
  matrix, 
  onChange, 
  label, 
  maxRows = 6, 
  maxCols = 6 
}) => {
  const [focusedCell, setFocusedCell] = useState<{row: number, col: number} | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  useEffect(() => {
    inputRefs.current = matrix.map(row => 
      Array(row.length).fill(null).map(() => React.createRef<HTMLInputElement>())
    );
  }, [matrix.length, matrix[0]?.length]);

  const handleCellChange = (row: number, col: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    const newMatrix = matrix.map((r, i) => 
      r.map((c, j) => i === row && j === col ? numValue : c)
    );
    onChange(newMatrix);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const { key } = e;
    let newRow = row;
    let newCol = col;

    switch (key) {
      case 'ArrowUp':
        e.preventDefault();
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newRow = Math.min(rows - 1, row + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
      case 'Tab':
        e.preventDefault();
        newCol = Math.min(cols - 1, col + 1);
        break;
      case 'Enter':
        e.preventDefault();
        newRow = row + 1 < rows ? row + 1 : 0;
        break;
    }

    if (inputRefs.current[newRow]?.[newCol]) {
      inputRefs.current[newRow][newCol]?.focus();
      setFocusedCell({ row: newRow, col: newCol });
    }
  };

  const addRow = () => {
    if (rows < maxRows) {
      const newRow = Array(cols).fill(0);
      onChange([...matrix, newRow]);
    }
  };

  const removeRow = () => {
    if (rows > 1) {
      onChange(matrix.slice(0, -1));
    }
  };

  const addCol = () => {
    if (cols < maxCols) {
      const newMatrix = matrix.map(row => [...row, 0]);
      onChange(newMatrix);
    }
  };

  const removeCol = () => {
    if (cols > 1) {
      const newMatrix = matrix.map(row => row.slice(0, -1));
      onChange(newMatrix);
    }
  };

  const resetMatrix = () => {
    onChange(createMatrix(rows, cols, 0));
  };

  const generateRandomMatrix = () => {
    const newMatrix = matrix.map(row => 
      row.map(() => Math.floor(Math.random() * 21) - 10) // Random integers from -10 to 10
    );
    onChange(newMatrix);
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-theme-text">{label}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-theme-muted">{rows}×{cols}</span>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="relative">
        <div className="grid gap-1 p-4 bg-theme-surface rounded-lg border border-theme-border">
          {matrix.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((cell, colIndex) => (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    ref={el => {
                      if (inputRefs.current[rowIndex]) {
                        inputRefs.current[rowIndex][colIndex] = el;
                      }
                    }}
                    type="number"
                    step="any"
                    value={cell === 0 ? '' : formatNumber(cell)}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                    onBlur={() => setFocusedCell(null)}
                    className={`
                      w-16 h-12 text-center text-sm font-mono rounded border transition-all duration-200
                      ${focusedCell?.row === rowIndex && focusedCell?.col === colIndex
                        ? 'border-theme-accent ring-2 ring-theme-accent/20 bg-theme-accent/5'
                        : 'border-theme-border bg-theme-bg hover:border-theme-accent/50'
                      }
                      text-theme-text placeholder-theme-muted
                      focus:outline-none
                    `}
                    placeholder="0"
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Matrix brackets */}
        <div className="absolute left-2 top-4 bottom-4 w-1 border-l-2 border-t-2 border-b-2 border-theme-muted rounded-l"></div>
        <div className="absolute right-2 top-4 bottom-4 w-1 border-r-2 border-t-2 border-b-2 border-theme-muted rounded-r"></div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={removeRow}
            disabled={rows <= 1}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remove row"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm text-theme-muted">Rows</span>
          <button
            onClick={addRow}
            disabled={rows >= maxRows}
            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Add row"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={removeCol}
            disabled={cols <= 1}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remove column"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm text-theme-muted">Cols</span>
          <button
            onClick={addCol}
            disabled={cols >= maxCols}
            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Add column"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={resetMatrix}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-border/50 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
          title="Reset to zeros"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        <button
          onClick={generateRandomMatrix}
          className="px-3 py-2 rounded-lg bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 transition-colors"
          title="Generate random values"
        >
          Random
        </button>
      </div>
    </motion.div>
  );
};

export default MatrixInput;