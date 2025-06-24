import React, { useRef, useEffect, useState } from 'react';
import { Cuboid as Cube, RotateCw, Move3D, Zap, Play, Pause, RotateCcw, Settings, Layers, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Matrix, Vector, multiplyMatrices, formatNumber } from '../../utils/matrixOperations';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ThreeDVisualizationProps {
  matrix?: Matrix;
  vectors?: Vector[];
  showAxes?: boolean;
  showGrid?: boolean;
}

const ThreeDVisualization: React.FC<ThreeDVisualizationProps> = ({
  matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  vectors = [],
  showAxes: showAxesProp = true,
  showGrid: showGridProp = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.5, z: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [zoom, setZoom] = useState(200);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showWireframe, setShowWireframe] = useState(true);
  const [showSurfaces, setShowSurfaces] = useState(true);
  const [lightingEnabled, setLightingEnabled] = useState(true);
  const [selectedObject, setSelectedObject] = useState<'cube' | 'sphere' | 'pyramid'>('cube');
  const [showAxes, setShowAxes] = useState(showAxesProp);
  const [showGrid, setShowGrid] = useState(showGridProp);
  const animationRef = useRef<number>();
  const autoRotateRef = useRef<number>();

  // 3D transformation matrices
  const getRotationMatrix = (rx: number, ry: number, rz: number) => {
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);

    // Combined rotation matrix (Z * Y * X)
    return [
      [cosY * cosZ, -cosY * sinZ, sinY],
      [sinX * sinY * cosZ + cosX * sinZ, -sinX * sinY * sinZ + cosX * cosZ, -sinX * cosY],
      [-cosX * sinY * cosZ + sinX * sinZ, cosX * sinY * sinZ + sinX * cosZ, cosX * cosY]
    ];
  };

  const project3DTo2D = (point: Point3D, viewMatrix: Matrix, centerX: number, centerY: number, scale: number) => {
    const transformed = multiplyMatrices(viewMatrix, [[point.x], [point.y], [point.z]]);
    const perspective = 1 / (1 + transformed[2][0] * 0.001); // Simple perspective
    return {
      x: centerX + transformed[0][0] * scale * perspective,
      y: centerY - transformed[1][0] * scale * perspective,
      z: transformed[2][0],
      perspective
    };
  };

  const calculateLighting = (normal: Point3D, lightDirection: Point3D = { x: 1, y: 1, z: 1 }) => {
    const dot = normal.x * lightDirection.x + normal.y * lightDirection.y + normal.z * lightDirection.z;
    const normalMag = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
    const lightMag = Math.sqrt(lightDirection.x ** 2 + lightDirection.y ** 2 + lightDirection.z ** 2);
    return Math.max(0.2, Math.abs(dot) / (normalMag * lightMag));
  };

  const drawLine3D = (
    ctx: CanvasRenderingContext2D,
    start: Point3D,
    end: Point3D,
    viewMatrix: Matrix,
    centerX: number,
    centerY: number,
    scale: number,
    color: string,
    lineWidth: number = 2
  ) => {
    const startProj = project3DTo2D(start, viewMatrix, centerX, centerY, scale);
    const endProj = project3DTo2D(end, viewMatrix, centerX, centerY, scale);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startProj.x, startProj.y);
    ctx.lineTo(endProj.x, endProj.y);
    ctx.stroke();
  };

  const drawVector3D = (
    ctx: CanvasRenderingContext2D,
    vector: Vector,
    viewMatrix: Matrix,
    centerX: number,
    centerY: number,
    scale: number,
    color: string,
    label: string
  ) => {
    const start = { x: 0, y: 0, z: 0 };
    const end = { x: vector[0], y: vector[1], z: vector[2] || 0 };

    drawLine3D(ctx, start, end, viewMatrix, centerX, centerY, scale, color, 4);

    // Draw arrowhead
    const endProj = project3DTo2D(end, viewMatrix, centerX, centerY, scale);
    const startProj = project3DTo2D(start, viewMatrix, centerX, centerY, scale);
    
    const angle = Math.atan2(endProj.y - startProj.y, endProj.x - startProj.x);
    const arrowLength = 15 * endProj.perspective;
    const arrowAngle = Math.PI / 6;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(endProj.x, endProj.y);
    ctx.lineTo(
      endProj.x - arrowLength * Math.cos(angle - arrowAngle),
      endProj.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(endProj.x, endProj.y);
    ctx.lineTo(
      endProj.x - arrowLength * Math.cos(angle + arrowAngle),
      endProj.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();

    // Label with depth-based sizing
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(10, 14 * endProj.perspective)}px Inter`;
    ctx.fillText(label, endProj.x + 10, endProj.y - 10);
  };

  const drawCube = (
    ctx: CanvasRenderingContext2D,
    viewMatrix: Matrix,
    centerX: number,
    centerY: number,
    scale: number,
    transformMatrix?: Matrix,
    progress: number = 1
  ) => {
    // Define cube vertices
    const vertices = [
      { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
    ];

    // Apply transformation if provided
    let transformedVertices = vertices;
    if (transformMatrix) {
      transformedVertices = vertices.map(vertex => {
        const original = [vertex.x, vertex.y, vertex.z];
        const transformed = multiplyMatrices(transformMatrix, [[vertex.x], [vertex.y], [vertex.z]]);
        
        // Interpolate for animation
        const x = original[0] + (transformed[0][0] - original[0]) * progress;
        const y = original[1] + (transformed[1][0] - original[1]) * progress;
        const z = original[2] + (transformed[2][0] - original[2]) * progress;
        
        return { x, y, z };
      });
    }

    // Define cube faces with normals for lighting
    const faces = [
      { vertices: [0, 1, 2, 3], normal: { x: 0, y: 0, z: -1 }, color: '#ff6b6b' }, // Front
      { vertices: [4, 7, 6, 5], normal: { x: 0, y: 0, z: 1 }, color: '#4ecdc4' },  // Back
      { vertices: [0, 4, 5, 1], normal: { x: 0, y: -1, z: 0 }, color: '#45b7d1' }, // Bottom
      { vertices: [2, 6, 7, 3], normal: { x: 0, y: 1, z: 0 }, color: '#96ceb4' },  // Top
      { vertices: [0, 3, 7, 4], normal: { x: -1, y: 0, z: 0 }, color: '#feca57' }, // Left
      { vertices: [1, 5, 6, 2], normal: { x: 1, y: 0, z: 0 }, color: '#ff9ff3' }   // Right
    ];

    // Project vertices
    const projectedVertices = transformedVertices.map(v => 
      project3DTo2D(v, viewMatrix, centerX, centerY, scale)
    );

    // Sort faces by average z-depth for proper rendering
    const facesWithDepth = faces.map(face => {
      const avgZ = face.vertices.reduce((sum, i) => sum + projectedVertices[i].z, 0) / face.vertices.length;
      return { ...face, avgZ };
    }).sort((a, b) => a.avgZ - b.avgZ);

    // Draw faces
    if (showSurfaces) {
      facesWithDepth.forEach(face => {
        const lighting = lightingEnabled ? calculateLighting(face.normal) : 1;
        const alpha = transformMatrix ? 0.7 : 0.3;
        
        ctx.fillStyle = transformMatrix 
          ? `rgba(239, 68, 68, ${alpha})` 
          : `${face.color}${Math.floor(lighting * 255 * alpha).toString(16).padStart(2, '0')}`;
        
        ctx.beginPath();
        face.vertices.forEach((vertexIndex, i) => {
          const proj = projectedVertices[vertexIndex];
          if (i === 0) {
            ctx.moveTo(proj.x, proj.y);
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        });
        ctx.closePath();
        ctx.fill();
      });
    }

    // Draw wireframe
    if (showWireframe) {
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
        [4, 5], [5, 6], [6, 7], [7, 4], // Top face
        [0, 4], [1, 5], [2, 6], [3, 7]  // Vertical edges
      ];

      ctx.strokeStyle = transformMatrix ? '#ef4444' : '#374151';
      ctx.lineWidth = transformMatrix ? 2 : 1;
      
      edges.forEach(([start, end]) => {
        const startProj = projectedVertices[start];
        const endProj = projectedVertices[end];
        
        ctx.beginPath();
        ctx.moveTo(startProj.x, startProj.y);
        ctx.lineTo(endProj.x, endProj.y);
        ctx.stroke();
      });
    }
  };

  const drawSphere = (
    ctx: CanvasRenderingContext2D,
    viewMatrix: Matrix,
    centerX: number,
    centerY: number,
    scale: number,
    transformMatrix?: Matrix,
    progress: number = 1
  ) => {
    const radius = 1;
    const segments = 16;
    const rings = 12;
    
    // Generate sphere vertices
    const vertices: Point3D[] = [];
    for (let ring = 0; ring <= rings; ring++) {
      const phi = (ring / rings) * Math.PI;
      for (let segment = 0; segment <= segments; segment++) {
        const theta = (segment / segments) * 2 * Math.PI;
        vertices.push({
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.cos(phi),
          z: radius * Math.sin(phi) * Math.sin(theta)
        });
      }
    }

    // Apply transformation
    let transformedVertices = vertices;
    if (transformMatrix) {
      transformedVertices = vertices.map(vertex => {
        const original = [vertex.x, vertex.y, vertex.z];
        const transformed = multiplyMatrices(transformMatrix, [[vertex.x], [vertex.y], [vertex.z]]);
        
        const x = original[0] + (transformed[0][0] - original[0]) * progress;
        const y = original[1] + (transformed[1][0] - original[1]) * progress;
        const z = original[2] + (transformed[2][0] - original[2]) * progress;
        
        return { x, y, z };
      });
    }

    // Project vertices
    const projectedVertices = transformedVertices.map(v => 
      project3DTo2D(v, viewMatrix, centerX, centerY, scale)
    );

    // Draw wireframe
    if (showWireframe) {
      ctx.strokeStyle = transformMatrix ? '#ef4444' : '#374151';
      ctx.lineWidth = 1;
      
      // Draw longitude lines
      for (let segment = 0; segment < segments; segment++) {
        ctx.beginPath();
        for (let ring = 0; ring <= rings; ring++) {
          const index = ring * (segments + 1) + segment;
          const proj = projectedVertices[index];
          if (ring === 0) {
            ctx.moveTo(proj.x, proj.y);
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
        ctx.stroke();
      }
      
      // Draw latitude lines
      for (let ring = 0; ring <= rings; ring++) {
        ctx.beginPath();
        for (let segment = 0; segment <= segments; segment++) {
          const index = ring * (segments + 1) + segment;
          const proj = projectedVertices[index];
          if (segment === 0) {
            ctx.moveTo(proj.x, proj.y);
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
        ctx.stroke();
      }
    }
  };

  const drawPyramid = (
    ctx: CanvasRenderingContext2D,
    viewMatrix: Matrix,
    centerX: number,
    centerY: number,
    scale: number,
    transformMatrix?: Matrix,
    progress: number = 1
  ) => {
    // Define pyramid vertices
    const vertices = [
      { x: 0, y: 1.5, z: 0 },    // Apex
      { x: -1, y: -0.5, z: -1 }, // Base corners
      { x: 1, y: -0.5, z: -1 },
      { x: 1, y: -0.5, z: 1 },
      { x: -1, y: -0.5, z: 1 }
    ];

    // Apply transformation
    let transformedVertices = vertices;
    if (transformMatrix) {
      transformedVertices = vertices.map(vertex => {
        const original = [vertex.x, vertex.y, vertex.z];
        const transformed = multiplyMatrices(transformMatrix, [[vertex.x], [vertex.y], [vertex.z]]);
        
        const x = original[0] + (transformed[0][0] - original[0]) * progress;
        const y = original[1] + (transformed[1][0] - original[1]) * progress;
        const z = original[2] + (transformed[2][0] - original[2]) * progress;
        
        return { x, y, z };
      });
    }

    // Project vertices
    const projectedVertices = transformedVertices.map(v => 
      project3DTo2D(v, viewMatrix, centerX, centerY, scale)
    );

    // Define faces
    const faces = [
      { vertices: [1, 2, 3, 4], color: '#ff6b6b' }, // Base
      { vertices: [0, 1, 2], color: '#4ecdc4' },    // Side 1
      { vertices: [0, 2, 3], color: '#45b7d1' },    // Side 2
      { vertices: [0, 3, 4], color: '#96ceb4' },    // Side 3
      { vertices: [0, 4, 1], color: '#feca57' }     // Side 4
    ];

    // Draw faces
    if (showSurfaces) {
      faces.forEach(face => {
        const alpha = transformMatrix ? 0.7 : 0.3;
        ctx.fillStyle = transformMatrix 
          ? `rgba(239, 68, 68, ${alpha})` 
          : `${face.color}${Math.floor(255 * alpha).toString(16).padStart(2, '0')}`;
        
        ctx.beginPath();
        face.vertices.forEach((vertexIndex, i) => {
          const proj = projectedVertices[vertexIndex];
          if (i === 0) {
            ctx.moveTo(proj.x, proj.y);
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        });
        ctx.closePath();
        ctx.fill();
      });
    }

    // Draw wireframe
    if (showWireframe) {
      const edges = [
        [1, 2], [2, 3], [3, 4], [4, 1], // Base
        [0, 1], [0, 2], [0, 3], [0, 4]  // Sides
      ];

      ctx.strokeStyle = transformMatrix ? '#ef4444' : '#374151';
      ctx.lineWidth = transformMatrix ? 2 : 1;
      
      edges.forEach(([start, end]) => {
        const startProj = projectedVertices[start];
        const endProj = projectedVertices[end];
        
        ctx.beginPath();
        ctx.moveTo(startProj.x, startProj.y);
        ctx.lineTo(endProj.x, endProj.y);
        ctx.stroke();
      });
    }
  };

  const drawAxes = (
    ctx: CanvasRenderingContext2D,
    viewMatrix: Matrix,
    centerX: number,
    centerY: number,
    scale: number
  ) => {
    const axisLength = 2;
    
    // X-axis (red)
    drawLine3D(
      ctx,
      { x: 0, y: 0, z: 0 },
      { x: axisLength, y: 0, z: 0 },
      viewMatrix,
      centerX,
      centerY,
      scale,
      '#ef4444',
      3
    );
    
    // Y-axis (green)
    drawLine3D(
      ctx,
      { x: 0, y: 0, z: 0 },
      { x: 0, y: axisLength, z: 0 },
      viewMatrix,
      centerX,
      centerY,
      scale,
      '#10b981',
      3
    );
    
    // Z-axis (blue)
    drawLine3D(
      ctx,
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: axisLength },
      viewMatrix,
      centerX,
      centerY,
      scale,
      '#3b82f6',
      3
    );

    // Axis labels
    const xEnd = project3DTo2D({ x: axisLength, y: 0, z: 0 }, viewMatrix, centerX, centerY, scale);
    const yEnd = project3DTo2D({ x: 0, y: axisLength, z: 0 }, viewMatrix, centerX, centerY, scale);
    const zEnd = project3DTo2D({ x: 0, y: 0, z: axisLength }, viewMatrix, centerX, centerY, scale);

    ctx.font = 'bold 16px Inter';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('X', xEnd.x + 10, xEnd.y);
    ctx.fillStyle = '#10b981';
    ctx.fillText('Y', yEnd.x + 10, yEnd.y);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Z', zEnd.x + 10, zEnd.y);
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    viewMatrix: Matrix,
    centerX: number,
    centerY: number,
    scale: number
  ) => {
    const gridSize = 3;
    const gridSpacing = 1;

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;

    // XY plane grid
    for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
      drawLine3D(
        ctx,
        { x: -gridSize, y: i, z: 0 },
        { x: gridSize, y: i, z: 0 },
        viewMatrix,
        centerX,
        centerY,
        scale,
        '#e5e7eb',
        0.5
      );
      drawLine3D(
        ctx,
        { x: i, y: -gridSize, z: 0 },
        { x: i, y: gridSize, z: 0 },
        viewMatrix,
        centerX,
        centerY,
        scale,
        '#e5e7eb',
        0.5
      );
    }

    // XZ plane grid (lighter)
    ctx.strokeStyle = '#f3f4f6';
    for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
      drawLine3D(
        ctx,
        { x: -gridSize, y: 0, z: i },
        { x: gridSize, y: 0, z: i },
        viewMatrix,
        centerX,
        centerY,
        scale,
        '#f3f4f6',
        0.3
      );
      drawLine3D(
        ctx,
        { x: i, y: 0, z: -gridSize },
        { x: i, y: 0, z: gridSize },
        viewMatrix,
        centerX,
        centerY,
        scale,
        '#f3f4f6',
        0.3
      );
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const viewMatrix = getRotationMatrix(rotation.x, rotation.y, rotation.z);

    if (showGrid) {
      drawGrid(ctx, viewMatrix, centerX, centerY, zoom);
    }

    if (showAxes) {
      drawAxes(ctx, viewMatrix, centerX, centerY, zoom);
    }

    // Draw original object
    switch (selectedObject) {
      case 'cube':
        drawCube(ctx, viewMatrix, centerX, centerY, zoom);
        break;
      case 'sphere':
        drawSphere(ctx, viewMatrix, centerX, centerY, zoom);
        break;
      case 'pyramid':
        drawPyramid(ctx, viewMatrix, centerX, centerY, zoom);
        break;
    }

    // Draw transformed object if matrix is not identity
    const isIdentity = matrix.every((row, i) => 
      row.every((val, j) => i === j ? Math.abs(val - 1) < 1e-10 : Math.abs(val) < 1e-10)
    );

    if (!isIdentity) {
      switch (selectedObject) {
        case 'cube':
          drawCube(ctx, viewMatrix, centerX, centerY, zoom, matrix, animationProgress);
          break;
        case 'sphere':
          drawSphere(ctx, viewMatrix, centerX, centerY, zoom, matrix, animationProgress);
          break;
        case 'pyramid':
          drawPyramid(ctx, viewMatrix, centerX, centerY, zoom, matrix, animationProgress);
          break;
      }
    }

    // Draw vectors
    vectors.forEach((vector, index) => {
      const colors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'];
      const labels = ['A', 'B', 'C', 'D'];
      drawVector3D(
        ctx,
        vector,
        viewMatrix,
        centerX,
        centerY,
        zoom,
        colors[index % colors.length],
        labels[index % labels.length]
      );
    });

    // Draw transformation info
    if (!isIdentity) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Inter';
      ctx.fillText('3D Transformation Matrix:', 20, 30);
      ctx.font = '12px monospace';
      matrix.forEach((row, i) => {
        const rowStr = `[${row.map(val => formatNumber(val, 2).padStart(6)).join(' ')}]`;
        ctx.fillText(rowStr, 20, 50 + i * 20);
      });
    }
  };

  useEffect(() => {
    draw();
  }, [rotation, matrix, vectors, animationProgress, zoom, showAxes, showGrid, showWireframe, showSurfaces, lightingEnabled, selectedObject]);

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

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  useEffect(() => {
    if (autoRotate) {
      const rotate = () => {
        setRotation(prev => ({
          x: prev.x,
          y: prev.y + 0.01,
          z: prev.z
        }));
        autoRotateRef.current = requestAnimationFrame(rotate);
      };
      autoRotateRef.current = requestAnimationFrame(rotate);
    } else if (autoRotateRef.current) {
      cancelAnimationFrame(autoRotateRef.current);
    }

    return () => {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, [autoRotate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-theme-text flex items-center gap-2">
          <Cube className="w-5 h-5" />
          Enhanced 3D Visualization
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="flex items-center gap-1 px-3 py-2 bg-theme-accent text-theme-bg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Animate
          </button>
          <button
            onClick={toggleAutoRotate}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              autoRotate 
                ? 'bg-green-500 text-white' 
                : 'bg-theme-border text-theme-text hover:bg-theme-border/70'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            Auto Rotate
          </button>
          <button
            onClick={resetAnimation}
            className="flex items-center gap-1 px-3 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Object Selection */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'cube', label: 'Cube', icon: Cube },
          { key: 'sphere', label: 'Sphere', icon: Move3D },
          { key: 'pyramid', label: 'Pyramid', icon: Zap }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedObject(key as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
              selectedObject === key 
                ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' 
                : 'border-theme-border hover:border-theme-accent/50 text-theme-text'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Rendering Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showWireframe}
            onChange={(e) => setShowWireframe(e.target.checked)}
            className="rounded border-theme-border"
          />
          <span className="text-sm text-theme-text">Wireframe</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showSurfaces}
            onChange={(e) => setShowSurfaces(e.target.checked)}
            className="rounded border-theme-border"
          />
          <span className="text-sm text-theme-text">Surfaces</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lightingEnabled}
            onChange={(e) => setLightingEnabled(e.target.checked)}
            className="rounded border-theme-border"
          />
          <span className="text-sm text-theme-text">Lighting</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="rounded border-theme-border"
          />
          <span className="text-sm text-theme-text">Grid</span>
        </label>
      </div>

      <div className="relative bg-white rounded-lg border border-theme-border overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-auto cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const startRotation = { ...rotation };

            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX;
              const deltaY = e.clientY - startY;
              
              setRotation({
                x: startRotation.x + deltaY * 0.01,
                y: startRotation.y + deltaX * 0.01,
                z: startRotation.z
              });
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
          onWheel={(e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(prev => Math.max(50, Math.min(500, prev * zoomFactor)));
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-text mb-2">
            Rotation X: {(rotation.x * 180 / Math.PI).toFixed(0)}°
          </label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.1"
            value={rotation.x}
            onChange={(e) => setRotation(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-text mb-2">
            Rotation Y: {(rotation.y * 180 / Math.PI).toFixed(0)}°
          </label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.1"
            value={rotation.y}
            onChange={(e) => setRotation(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-text mb-2">
            Rotation Z: {(rotation.z * 180 / Math.PI).toFixed(0)}°
          </label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.1"
            value={rotation.z}
            onChange={(e) => setRotation(prev => ({ ...prev, z: parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>

      <div className="text-sm text-theme-muted">
        <p>
          <strong>Enhanced 3D Features:</strong> Multiple 3D objects • Perspective projection • 
          Depth-based rendering • Surface lighting • Auto-rotation • Interactive controls
        </p>
        <p className="mt-1">
          Drag to rotate • Scroll to zoom • Use sliders for precise rotation control
        </p>
      </div>
    </div>
  );
};

export default ThreeDVisualization;