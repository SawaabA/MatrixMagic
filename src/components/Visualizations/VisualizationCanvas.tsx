import React, { useState, useRef, useEffect } from 'react';
import { Eye, Play, Pause, RotateCcw, Zap, Move3D, BarChart3, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixInput from '../MatrixInput';
import { Matrix, Vector, transpose, determinant, multiplyMatrices, createMatrix } from '../../utils/matrixOperations';

interface Point2D {
  x: number;
  y: number;
}

const VisualizationCanvas: React.FC = () => {
  const [activeViz, setActiveViz] = useState<'vectors' | 'transformations' | 'eigenvalues'>('vectors');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Vector visualization state
  const [vectorA, setVectorA] = useState<Vector>([3, 2]);
  const [vectorB, setVectorB] = useState<Vector>([1, 3]);
  const [showDotProduct, setShowDotProduct] = useState(false);

  // Transformation state
  const [transformMatrix, setTransformMatrix] = useState<Matrix>([[1, 0], [0, 1]]);
  const [originalPoints, setOriginalPoints] = useState<Point2D[]>([
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }
  ]);

  // Eigenvalue visualization state
  const [eigenMatrix, setEigenMatrix] = useState<Matrix>([[2, 1], [1, 2]]);

  const visualizations = [
    {
      key: 'vectors',
      label: '2D Vectors',
      icon: Move3D,
      description: 'Visualize vectors, dot products, and cross products',
      color: 'from-blue-400 to-blue-600'
    },
    {
      key: 'transformations',
      label: 'Matrix Transformations',
      icon: Zap,
      description: 'See how matrices transform geometric shapes',
      color: 'from-purple-400 to-purple-600'
    },
    {
      key: 'eigenvalues',
      label: 'Eigenvalues & Eigenvectors',
      icon: BarChart3,
      description: 'Visualize eigenvectors as special directions',
      color: 'from-green-400 to-green-600'
    }
  ] as const;

  useEffect(() => {
    drawVisualization();
  }, [activeViz, vectorA, vectorB, transformMatrix, eigenMatrix, animationProgress, showDotProduct, zoom, panOffset]);

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system with zoom and pan
    const centerX = canvas.width / 2 + panOffset.x;
    const centerY = canvas.height / 2 + panOffset.y;
    const scale = 40 * zoom;

    // Draw grid
    drawGrid(ctx, centerX, centerY, scale);

    switch (activeViz) {
      case 'vectors':
        drawVectors(ctx, centerX, centerY, scale);
        break;
      case 'transformations':
        drawTransformations(ctx, centerX, centerY, scale);
        break;
      case 'eigenvalues':
        drawEigenvalues(ctx, centerX, centerY, scale);
        break;
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Grid lines
    const gridSpacing = scale;
    const startX = Math.floor(-centerX / gridSpacing) * gridSpacing;
    const startY = Math.floor(-centerY / gridSpacing) * gridSpacing;

    for (let x = startX; x < ctx.canvas.width - centerX; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(centerX + x, 0);
      ctx.lineTo(centerX + x, ctx.canvas.height);
      ctx.stroke();
    }

    for (let y = startY; y < ctx.canvas.height - centerY; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, centerY + y);
      ctx.lineTo(ctx.canvas.width, centerY + y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(ctx.canvas.width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, ctx.canvas.height);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter';
    ctx.fillText('x', ctx.canvas.width - 20, centerY - 10);
    ctx.fillText('y', centerX + 10, 20);

    // Grid numbers
    ctx.font = '10px Inter';
    ctx.fillStyle = '#6b7280';
    for (let i = -10; i <= 10; i++) {
      if (i !== 0) {
        const x = centerX + i * scale;
        const y = centerY - i * scale;
        
        if (x > 0 && x < ctx.canvas.width) {
          ctx.fillText(i.toString(), x - 5, centerY + 15);
        }
        if (y > 0 && y < ctx.canvas.height) {
          ctx.fillText(i.toString(), centerX + 5, y + 5);
        }
      }
    }
  };

  const drawVector = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    vector: Vector,
    color: string,
    label: string
  ) => {
    const endX = centerX + vector[0] * scale;
    const endY = centerY - vector[1] * scale; // Flip Y for screen coordinates

    // Vector line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(endY - centerY, endX - centerX);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - arrowAngle),
      endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + arrowAngle),
      endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px Inter';
    ctx.fillText(label, endX + 10, endY - 10);
  };

  const drawVectors = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    // Draw vector A
    drawVector(ctx, centerX, centerY, scale, vectorA, '#3b82f6', 'A');
    
    // Draw vector B
    drawVector(ctx, centerX, centerY, scale, vectorB, '#ef4444', 'B');

    // Draw sum vector A + B
    const sum = [vectorA[0] + vectorB[0], vectorA[1] + vectorB[1]];
    drawVector(ctx, centerX, centerY, scale, sum, '#10b981', 'A + B');

    // Draw parallelogram for vector addition
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    const aEndX = centerX + vectorA[0] * scale;
    const aEndY = centerY - vectorA[1] * scale;
    const bEndX = centerX + vectorB[0] * scale;
    const bEndY = centerY - vectorB[1] * scale;
    const sumEndX = centerX + sum[0] * scale;
    const sumEndY = centerY - sum[1] * scale;

    ctx.beginPath();
    ctx.moveTo(aEndX, aEndY);
    ctx.lineTo(sumEndX, sumEndY);
    ctx.moveTo(bEndX, bEndY);
    ctx.lineTo(sumEndX, sumEndY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Show dot product if enabled
    if (showDotProduct) {
      const dotProduct = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1];
      const angle = Math.acos(dotProduct / (Math.sqrt(vectorA[0]**2 + vectorA[1]**2) * Math.sqrt(vectorB[0]**2 + vectorB[1]**2)));
      
      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(`A · B = ${dotProduct.toFixed(2)}`, 20, 30);
      ctx.fillText(`Angle = ${(angle * 180 / Math.PI).toFixed(1)}°`, 20, 50);
    }
  };

  const drawTransformations = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    // Draw original unit square
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.rect(centerX, centerY - scale, scale, scale);
    ctx.stroke();
    ctx.setLineDash([]);

    // Transform the unit square
    const corners = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
    const transformedCorners = corners.map(corner => {
      const result = multiplyMatrices(transformMatrix, [[corner[0]], [corner[1]]]);
      return [result[0][0], result[1][0]];
    });

    // Animate transformation if playing
    let currentCorners = transformedCorners;
    if (isAnimating) {
      currentCorners = corners.map((corner, i) => {
        const original = corner;
        const transformed = transformedCorners[i];
        return [
          original[0] + (transformed[0] - original[0]) * animationProgress,
          original[1] + (transformed[1] - original[1]) * animationProgress
        ];
      });
    }

    // Draw transformed shape
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    currentCorners.forEach((corner, i) => {
      const x = centerX + corner[0] * scale;
      const y = centerY - corner[1] * scale;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw transformation matrix info
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Inter';
    ctx.fillText('Transformation Matrix:', 20, 30);
    ctx.font = '12px monospace';
    ctx.fillText(`[${transformMatrix[0][0].toFixed(2)} ${transformMatrix[0][1].toFixed(2)}]`, 20, 50);
    ctx.fillText(`[${transformMatrix[1][0].toFixed(2)} ${transformMatrix[1][1].toFixed(2)}]`, 20, 70);
    
    const det = determinant(transformMatrix);
    ctx.fillText(`Determinant: ${det.toFixed(2)}`, 20, 90);
    ctx.fillText(`Area scaling: ${Math.abs(det).toFixed(2)}x`, 20, 110);
  };

  const drawEigenvalues = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    // Calculate eigenvalues and eigenvectors (simplified for 2x2)
    const a = eigenMatrix[0][0];
    const b = eigenMatrix[0][1];
    const c = eigenMatrix[1][0];
    const d = eigenMatrix[1][1];
    
    const trace = a + d;
    const det = a * d - b * c;
    const discriminant = trace * trace - 4 * det;
    
    if (discriminant >= 0) {
      const lambda1 = (trace + Math.sqrt(discriminant)) / 2;
      const lambda2 = (trace - Math.sqrt(discriminant)) / 2;
      
      // Calculate eigenvectors
      let v1: Vector, v2: Vector;
      
      if (Math.abs(b) > 1e-10) {
        v1 = [lambda1 - d, b];
        v2 = [lambda2 - d, b];
      } else if (Math.abs(c) > 1e-10) {
        v1 = [c, lambda1 - a];
        v2 = [c, lambda2 - a];
      } else {
        v1 = [1, 0];
        v2 = [0, 1];
      }
      
      // Normalize eigenvectors
      const norm1 = Math.sqrt(v1[0]**2 + v1[1]**2);
      const norm2 = Math.sqrt(v2[0]**2 + v2[1]**2);
      v1 = [v1[0]/norm1 * 2, v1[1]/norm1 * 2];
      v2 = [v2[0]/norm2 * 2, v2[1]/norm2 * 2];
      
      // Draw eigenvectors
      drawVector(ctx, centerX, centerY, scale, v1, '#ef4444', `v₁ (λ=${lambda1.toFixed(2)})`);
      drawVector(ctx, centerX, centerY, scale, v2, '#3b82f6', `v₂ (λ=${lambda2.toFixed(2)})`);
      
      // Draw eigenvalue info
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Inter';
      ctx.fillText('Eigenvalues & Eigenvectors:', 20, 30);
      ctx.font = '12px monospace';
      ctx.fillText(`λ₁ = ${lambda1.toFixed(3)}`, 20, 50);
      ctx.fillText(`λ₂ = ${lambda2.toFixed(3)}`, 20, 70);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * zoomFactor)));
  };

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationProgress(0);
    
    const animate = () => {
      setAnimationProgress(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          setIsAnimating(false);
          return 1;
        }
        return next;
      });
      
      if (animationProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationProgress(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Visualization Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {visualizations.map(({ key, label, icon: Icon, description, color }) => (
          <motion.button
            key={key}
            onClick={() => setActiveViz(key)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${activeViz === key 
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
                  activeViz === key ? 'text-theme-accent' : 'text-theme-text'
                }`}>
                  {label}
                </h3>
                <p className="text-theme-muted text-sm">{description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
            <h3 className="text-lg font-semibold text-theme-text mb-4">Controls</h3>
            
            {activeViz === 'vectors' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">Vector A</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={vectorA[0]}
                      onChange={(e) => setVectorA([parseFloat(e.target.value) || 0, vectorA[1]])}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                      placeholder="x"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={vectorA[1]}
                      onChange={(e) => setVectorA([vectorA[0], parseFloat(e.target.value) || 0])}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                      placeholder="y"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">Vector B</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={vectorB[0]}
                      onChange={(e) => setVectorB([parseFloat(e.target.value) || 0, vectorB[1]])}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                      placeholder="x"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={vectorB[1]}
                      onChange={(e) => setVectorB([vectorB[0], parseFloat(e.target.value) || 0])}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                      placeholder="y"
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showDotProduct}
                    onChange={(e) => setShowDotProduct(e.target.checked)}
                    className="rounded border-theme-border"
                  />
                  <span className="text-sm text-theme-text">Show dot product & angle</span>
                </label>
              </div>
            )}

            {activeViz === 'transformations' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">Transformation Matrix</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={transformMatrix[0][0]}
                      onChange={(e) => {
                        const newMatrix = [...transformMatrix];
                        newMatrix[0][0] = parseFloat(e.target.value) || 0;
                        setTransformMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={transformMatrix[0][1]}
                      onChange={(e) => {
                        const newMatrix = [...transformMatrix];
                        newMatrix[0][1] = parseFloat(e.target.value) || 0;
                        setTransformMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={transformMatrix[1][0]}
                      onChange={(e) => {
                        const newMatrix = [...transformMatrix];
                        newMatrix[1][0] = parseFloat(e.target.value) || 0;
                        setTransformMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={transformMatrix[1][1]}
                      onChange={(e) => {
                        const newMatrix = [...transformMatrix];
                        newMatrix[1][1] = parseFloat(e.target.value) || 0;
                        setTransformMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setTransformMatrix([[2, 0], [0, 1]])}
                    className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    Horizontal Stretch
                  </button>
                  <button
                    onClick={() => setTransformMatrix([[Math.cos(Math.PI/4), -Math.sin(Math.PI/4)], [Math.sin(Math.PI/4), Math.cos(Math.PI/4)]])}
                    className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    45° Rotation
                  </button>
                  <button
                    onClick={() => setTransformMatrix([[1, 0.5], [0, 1]])}
                    className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                  >
                    Shear
                  </button>
                </div>
              </div>
            )}

            {activeViz === 'eigenvalues' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">Matrix for Eigenanalysis</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={eigenMatrix[0][0]}
                      onChange={(e) => {
                        const newMatrix = [...eigenMatrix];
                        newMatrix[0][0] = parseFloat(e.target.value) || 0;
                        setEigenMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={eigenMatrix[0][1]}
                      onChange={(e) => {
                        const newMatrix = [...eigenMatrix];
                        newMatrix[0][1] = parseFloat(e.target.value) || 0;
                        setEigenMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={eigenMatrix[1][0]}
                      onChange={(e) => {
                        const newMatrix = [...eigenMatrix];
                        newMatrix[1][0] = parseFloat(e.target.value) || 0;
                        setEigenMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={eigenMatrix[1][1]}
                      onChange={(e) => {
                        const newMatrix = [...eigenMatrix];
                        newMatrix[1][1] = parseFloat(e.target.value) || 0;
                        setEigenMatrix(newMatrix);
                      }}
                      className="px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View & Animation Controls */}
          <div className="bg-theme-surface rounded-xl p-6 border border-theme-border">
            <h3 className="text-lg font-semibold text-theme-text mb-4">View & Animation</h3>
            
            {/* Animation Controls */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={startAnimation}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {activeViz === 'transformations' ? 'Animate Transform' : 'Play'}
                </button>
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
              
              {isAnimating && (
                <div className="w-full bg-theme-border rounded-full h-2">
                  <div 
                    className="bg-theme-accent h-2 rounded-full transition-all duration-100"
                    style={{ width: `${animationProgress * 100}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* View Controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
                  className="flex items-center gap-1 px-3 py-2 bg-theme-bg border border-theme-border rounded-lg hover:bg-theme-border/50 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                  Zoom Out
                </button>
                <span className="text-sm text-theme-muted px-2">{(zoom * 100).toFixed(0)}%</span>
                <button
                  onClick={() => setZoom(prev => Math.min(5, prev * 1.25))}
                  className="flex items-center gap-1 px-3 py-2 bg-theme-bg border border-theme-border rounded-lg hover:bg-theme-border/50 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                  Zoom In
                </button>
              </div>
              
              <button
                onClick={resetView}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-theme-bg border border-theme-border rounded-lg hover:bg-theme-border/50 transition-colors"
              >
                <Move className="w-4 h-4" />
                Reset View
              </button>
            </div>
          </div>
        </motion.div>

        {/* Visualization Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-theme-surface rounded-xl border border-theme-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-text">
                {visualizations.find(v => v.key === activeViz)?.label}
              </h3>
              <div className="text-sm text-theme-muted">
                Interactive • Drag to pan • Scroll to zoom
              </div>
            </div>
            
            <div className="relative bg-white rounded-lg border border-theme-border overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-auto cursor-move"
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              />
            </div>
            
            <div className="mt-4 text-sm text-theme-muted">
              <p>
                {activeViz === 'vectors' && 'Adjust vector components to see how they add geometrically. Enable dot product to see the angle between vectors. Drag to pan and scroll to zoom.'}
                {activeViz === 'transformations' && 'Modify the transformation matrix to see how it affects the unit square. Try different transformations like scaling, rotation, and shearing. Use animation to see the transformation in action.'}
                {activeViz === 'eigenvalues' && 'Eigenvectors are shown as special directions that only get scaled (not rotated) by the matrix transformation. Drag to pan and scroll to zoom for better viewing.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VisualizationCanvas;