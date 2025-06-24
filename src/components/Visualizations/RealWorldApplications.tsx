import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Database, Zap, BarChart3, Camera, Gamepad2, Sliders, Palette, Contrast } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeDVisualization from './ThreeDVisualization';
import { Matrix, Vector, multiplyMatrices, transpose, createMatrix } from '../../utils/matrixOperations';

interface Application {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'graphics' | 'data-science' | 'physics' | 'engineering';
  color: string;
}

const RealWorldApplications: React.FC = () => {
  const [activeApp, setActiveApp] = useState<string>('computer-graphics');
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Computer Graphics state
  const [rotationAngle, setRotationAngle] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  // PCA state
  const [dataPoints, setDataPoints] = useState<Vector[]>([
    [2, 3], [3, 3], [3, 5], [5, 4], [5, 6], [6, 5], [7, 4], [8, 5]
  ]);

  // Physics simulation state
  const [pendulumAngle, setPendulumAngle] = useState(Math.PI / 4);
  const [pendulumVelocity, setPendulumVelocity] = useState(0);

  // Image processing state
  const [imageFilter, setImageFilter] = useState<'original' | 'edge' | 'blur' | 'sharpen' | 'emboss'>('edge');
  const [filterStrength, setFilterStrength] = useState(1);
  const [imagePattern, setImagePattern] = useState<'sine' | 'checkerboard' | 'gradient' | 'noise'>('sine');

  const applications: Application[] = [
    {
      id: 'computer-graphics',
      title: 'Computer Graphics',
      description: 'Matrix transformations in 3D rendering and game engines',
      icon: Monitor,
      category: 'graphics',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'data-science',
      title: 'Principal Component Analysis',
      description: 'Dimensionality reduction and data visualization',
      icon: BarChart3,
      category: 'data-science',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'physics',
      title: 'Physics Simulations',
      description: 'Rotation matrices in mechanical systems',
      icon: Zap,
      category: 'physics',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'image-processing',
      title: 'Advanced Image Processing',
      description: 'Convolution filters and matrix operations on images',
      icon: Camera,
      category: 'engineering',
      color: 'from-orange-400 to-orange-600'
    }
  ];

  // Computer Graphics Functions
  const getRotationMatrix = (angle: number): Matrix => [
    [Math.cos(angle), -Math.sin(angle)],
    [Math.sin(angle), Math.cos(angle)]
  ];

  const getScaleMatrix = (sx: number, sy: number): Matrix => [
    [sx, 0],
    [0, sy]
  ];

  const get3DRotationMatrix = (angle: number): Matrix => [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1]
  ];

  // PCA Functions
  const calculatePCA = (points: Vector[]) => {
    // Center the data
    const meanX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    
    const centeredPoints = points.map(p => [p[0] - meanX, p[1] - meanY]);
    
    // Calculate covariance matrix
    let cxx = 0, cxy = 0, cyy = 0;
    centeredPoints.forEach(p => {
      cxx += p[0] * p[0];
      cxy += p[0] * p[1];
      cyy += p[1] * p[1];
    });
    
    const n = points.length - 1;
    const covMatrix: Matrix = [
      [cxx / n, cxy / n],
      [cxy / n, cyy / n]
    ];
    
    // Calculate eigenvalues (simplified for 2x2)
    const trace = covMatrix[0][0] + covMatrix[1][1];
    const det = covMatrix[0][0] * covMatrix[1][1] - covMatrix[0][1] * covMatrix[1][0];
    const discriminant = trace * trace - 4 * det;
    
    if (discriminant < 0) return null;
    
    const lambda1 = (trace + Math.sqrt(discriminant)) / 2;
    const lambda2 = (trace - Math.sqrt(discriminant)) / 2;
    
    // Calculate eigenvectors
    const v1 = covMatrix[0][1] !== 0 
      ? [lambda1 - covMatrix[1][1], covMatrix[0][1]]
      : [1, 0];
    const v2 = covMatrix[0][1] !== 0 
      ? [lambda2 - covMatrix[1][1], covMatrix[0][1]]
      : [0, 1];
    
    // Normalize eigenvectors
    const norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    
    return {
      eigenvalues: [lambda1, lambda2],
      eigenvectors: [
        [v1[0] / norm1, v1[1] / norm1],
        [v2[0] / norm2, v2[1] / norm2]
      ],
      mean: [meanX, meanY],
      varianceExplained: [
        lambda1 / (lambda1 + lambda2),
        lambda2 / (lambda1 + lambda2)
      ]
    };
  };

  // Enhanced Image Processing Functions
  const generateImagePattern = (width: number, height: number, pattern: string) => {
    const imageData = new ImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        let intensity = 0;

        switch (pattern) {
          case 'sine':
            intensity = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 127 + 128;
            break;
          case 'checkerboard':
            intensity = ((Math.floor(x / 10) + Math.floor(y / 10)) % 2) * 255;
            break;
          case 'gradient':
            intensity = (x / width) * 255;
            break;
          case 'noise':
            intensity = Math.random() * 255;
            break;
        }

        data[index] = intensity;     // Red
        data[index + 1] = intensity; // Green
        data[index + 2] = intensity; // Blue
        data[index + 3] = 255;       // Alpha
      }
    }

    return imageData;
  };

  const applyConvolutionFilter = (imageData: ImageData, filter: number[][], strength: number = 1) => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const filteredData = new ImageData(width, height);
    const filtered = filteredData.data;

    const filterSize = filter.length;
    const offset = Math.floor(filterSize / 2);

    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        let sum = 0;
        
        for (let fy = 0; fy < filterSize; fy++) {
          for (let fx = 0; fx < filterSize; fx++) {
            const pixelY = y + fy - offset;
            const pixelX = x + fx - offset;
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const intensity = data[pixelIndex];
            sum += intensity * filter[fy][fx];
          }
        }
        
        const result = Math.max(0, Math.min(255, sum * strength));
        const index = (y * width + x) * 4;
        filtered[index] = result;
        filtered[index + 1] = result;
        filtered[index + 2] = result;
        filtered[index + 3] = 255;
      }
    }

    return filteredData;
  };

  const getFilterKernel = (filterType: string) => {
    switch (filterType) {
      case 'edge':
        return [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
      case 'blur':
        return [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]];
      case 'sharpen':
        return [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
      case 'emboss':
        return [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]];
      default:
        return [[0, 0, 0], [0, 1, 0], [0, 0, 0]]; // Identity
    }
  };

  // Drawing Functions
  const drawComputerGraphics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 50;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale, 0);
      ctx.lineTo(centerX + i * scale, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * scale);
      ctx.lineTo(canvas.width, centerY + i * scale);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Original square
    const originalSquare = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]];
    
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    originalSquare.forEach((point, i) => {
      const x = centerX + point[0] * scale;
      const y = centerY - point[1] * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Apply transformations
    const rotMatrix = getRotationMatrix(rotationAngle);
    const scaleMatrix = getScaleMatrix(scaleX, scaleY);
    const transformMatrix = multiplyMatrices(scaleMatrix, rotMatrix);

    const transformedSquare = originalSquare.map(point => {
      const result = multiplyMatrices(transformMatrix, [[point[0]], [point[1]]]);
      return [result[0][0], result[1][0]];
    });

    // Draw transformed square
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    transformedSquare.forEach((point, i) => {
      const x = centerX + point[0] * scale;
      const y = centerY - point[1] * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Display transformation matrix
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Inter';
    ctx.fillText('Transformation Matrix:', 20, 30);
    ctx.font = '12px monospace';
    ctx.fillText(`[${transformMatrix[0][0].toFixed(2)} ${transformMatrix[0][1].toFixed(2)}]`, 20, 50);
    ctx.fillText(`[${transformMatrix[1][0].toFixed(2)} ${transformMatrix[1][1].toFixed(2)}]`, 20, 70);
  };

  const drawPCA = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 30;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale, 0);
      ctx.lineTo(centerX + i * scale, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * scale);
      ctx.lineTo(canvas.width, centerY + i * scale);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    dataPoints.forEach(point => {
      const x = centerX + point[0] * scale;
      const y = centerY - point[1] * scale;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Calculate and draw PCA
    const pca = calculatePCA(dataPoints);
    if (pca) {
      const { eigenvectors, mean, eigenvalues, varianceExplained } = pca;
      
      // Draw principal components
      const pc1Length = Math.sqrt(eigenvalues[0]) * 2;
      const pc2Length = Math.sqrt(eigenvalues[1]) * 2;
      
      // PC1 (red)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(
        centerX + (mean[0] - eigenvectors[0][0] * pc1Length) * scale,
        centerY - (mean[1] - eigenvectors[0][1] * pc1Length) * scale
      );
      ctx.lineTo(
        centerX + (mean[0] + eigenvectors[0][0] * pc1Length) * scale,
        centerY - (mean[1] + eigenvectors[0][1] * pc1Length) * scale
      );
      ctx.stroke();

      // PC2 (green)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(
        centerX + (mean[0] - eigenvectors[1][0] * pc2Length) * scale,
        centerY - (mean[1] - eigenvectors[1][1] * pc2Length) * scale
      );
      ctx.lineTo(
        centerX + (mean[0] + eigenvectors[1][0] * pc2Length) * scale,
        centerY - (mean[1] + eigenvectors[1][1] * pc2Length) * scale
      );
      ctx.stroke();

      // Draw mean point
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(centerX + mean[0] * scale, centerY - mean[1] * scale, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Display variance explained
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Inter';
      ctx.fillText('Principal Component Analysis:', 20, 30);
      ctx.font = '12px Inter';
      ctx.fillText(`PC1 (red): ${(varianceExplained[0] * 100).toFixed(1)}% variance`, 20, 50);
      ctx.fillText(`PC2 (green): ${(varianceExplained[1] * 100).toFixed(1)}% variance`, 20, 70);
      ctx.fillText(`Mean (yellow): (${mean[0].toFixed(1)}, ${mean[1].toFixed(1)})`, 20, 90);
    }
  };

  const drawPhysics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = 100;
    const length = 150;

    // Draw pendulum support
    ctx.fillStyle = '#374151';
    ctx.fillRect(centerX - 20, centerY - 20, 40, 20);

    // Calculate pendulum position using rotation matrix
    const rotMatrix = getRotationMatrix(pendulumAngle);
    const pendulumEnd = multiplyMatrices(rotMatrix, [[0], [length]]);
    
    const endX = centerX + pendulumEnd[0][0];
    const endY = centerY + pendulumEnd[1][0];

    // Draw pendulum string
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw pendulum bob
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endX, endY, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Draw angle arc
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, Math.PI / 2, Math.PI / 2 + pendulumAngle);
    ctx.stroke();

    // Display physics info
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Inter';
    ctx.fillText('Pendulum Physics Simulation:', 20, 30);
    ctx.font = '12px Inter';
    ctx.fillText(`Angle: ${(pendulumAngle * 180 / Math.PI).toFixed(1)}°`, 20, 50);
    ctx.fillText(`Angular velocity: ${pendulumVelocity.toFixed(3)} rad/s`, 20, 70);
    ctx.fillText('Rotation matrix transforms the pendulum position', 20, 90);
  };

  const drawImageProcessing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imageSize = 120;
    const spacing = 20;

    // Generate original image
    const originalImage = generateImagePattern(imageSize, imageSize, imagePattern);
    
    // Apply filter if not original
    let processedImage = originalImage;
    if (imageFilter !== 'original') {
      const kernel = getFilterKernel(imageFilter);
      processedImage = applyConvolutionFilter(originalImage, kernel, filterStrength);
    }

    // Draw original image
    ctx.putImageData(originalImage, spacing, 50);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(spacing, 50, imageSize, imageSize);

    // Draw processed image
    ctx.putImageData(processedImage, spacing * 2 + imageSize, 50);
    ctx.strokeRect(spacing * 2 + imageSize, 50, imageSize, imageSize);

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Inter';
    ctx.fillText('Original', spacing + imageSize/2 - 25, 40);
    ctx.fillText(`${imageFilter.charAt(0).toUpperCase() + imageFilter.slice(1)} Filter`, 
                 spacing * 2 + imageSize + imageSize/2 - 30, 40);

    // Display convolution info
    ctx.font = 'bold 16px Inter';
    ctx.fillText('Advanced Image Processing:', 20, 25);
    
    // Show current filter kernel
    const kernel = getFilterKernel(imageFilter);
    ctx.font = '10px monospace';
    ctx.fillText('Filter Kernel:', spacing, 200);
    kernel.forEach((row, i) => {
      const rowStr = `[${row.map(val => val.toFixed(2).padStart(6)).join(' ')}]`;
      ctx.fillText(rowStr, spacing, 220 + i * 15);
    });

    // Show filter effects
    ctx.font = '12px Inter';
    ctx.fillText(`Pattern: ${imagePattern}`, spacing * 2 + imageSize, 200);
    ctx.fillText(`Filter: ${imageFilter}`, spacing * 2 + imageSize, 220);
    ctx.fillText(`Strength: ${filterStrength.toFixed(1)}`, spacing * 2 + imageSize, 240);

    // Real-time histogram (simplified)
    const histogramData = new Array(256).fill(0);
    const data = processedImage.data;
    for (let i = 0; i < data.length; i += 4) {
      histogramData[data[i]]++;
    }
    
    const maxCount = Math.max(...histogramData);
    const histogramHeight = 60;
    const histogramWidth = 256;
    const histogramX = spacing;
    const histogramY = 280;
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    histogramData.forEach((count, intensity) => {
      const x = histogramX + intensity;
      const y = histogramY + histogramHeight - (count / maxCount) * histogramHeight;
      if (intensity === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter';
    ctx.fillText('Intensity Histogram', histogramX, histogramY - 10);
  };

  useEffect(() => {
    switch (activeApp) {
      case 'computer-graphics':
        drawComputerGraphics();
        break;
      case 'data-science':
        drawPCA();
        break;
      case 'physics':
        drawPhysics();
        break;
      case 'image-processing':
        drawImageProcessing();
        break;
    }
  }, [activeApp, rotationAngle, scaleX, scaleY, dataPoints, pendulumAngle, animationFrame, imageFilter, filterStrength, imagePattern]);

  // Physics simulation
  useEffect(() => {
    if (activeApp === 'physics' && isAnimating) {
      const interval = setInterval(() => {
        setPendulumAngle(prev => {
          const gravity = 9.81;
          const length = 1.5;
          const damping = 0.995;
          
          const acceleration = -(gravity / length) * Math.sin(prev);
          const newVelocity = pendulumVelocity + acceleration * 0.02;
          setPendulumVelocity(newVelocity * damping);
          
          return prev + newVelocity * 0.02;
        });
      }, 20);
      
      return () => clearInterval(interval);
    }
  }, [activeApp, isAnimating, pendulumVelocity]);

  const startAnimation = () => {
    setIsAnimating(true);
    if (activeApp === 'computer-graphics') {
      const animate = () => {
        setRotationAngle(prev => prev + 0.02);
        if (isAnimating) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();
    }
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Real-World Applications</h2>
          <p className="text-theme-muted">See how linear algebra powers modern technology</p>
        </div>
      </motion.div>

      {/* Application Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {applications.map(({ id, title, description, icon: Icon, color }) => (
          <motion.button
            key={id}
            onClick={() => setActiveApp(id)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${activeApp === id 
                ? 'border-theme-accent bg-theme-accent/10 shadow-lg' 
                : 'border-theme-border hover:border-theme-accent/50 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                  activeApp === id ? 'text-theme-accent' : 'text-theme-text'
                }`}>
                  {title}
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
            
            {activeApp === 'computer-graphics' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Rotation Angle: {(rotationAngle * 180 / Math.PI).toFixed(0)}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={2 * Math.PI}
                    step="0.1"
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Scale X: {scaleX.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scaleX}
                    onChange={(e) => setScaleX(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Scale Y: {scaleY.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scaleY}
                    onChange={(e) => setScaleY(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={isAnimating ? stopAnimation : startAnimation}
                  className="w-full px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isAnimating ? 'Stop Animation' : 'Start Animation'}
                </button>
              </div>
            )}

            {activeApp === 'physics' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Initial Angle: {(pendulumAngle * 180 / Math.PI).toFixed(0)}°
                  </label>
                  <input
                    type="range"
                    min="-1.5"
                    max="1.5"
                    step="0.1"
                    value={pendulumAngle}
                    onChange={(e) => setPendulumAngle(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={isAnimating}
                  />
                </div>

                <button
                  onClick={() => {
                    if (isAnimating) {
                      setIsAnimating(false);
                    } else {
                      setPendulumVelocity(0);
                      setIsAnimating(true);
                    }
                  }}
                  className="w-full px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isAnimating ? 'Stop Simulation' : 'Start Simulation'}
                </button>

                <button
                  onClick={() => {
                    setPendulumAngle(Math.PI / 4);
                    setPendulumVelocity(0);
                    setIsAnimating(false);
                  }}
                  className="w-full px-4 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors"
                >
                  Reset
                </button>
              </div>
            )}

            {activeApp === 'data-science' && (
              <div className="space-y-4">
                <p className="text-sm text-theme-muted">
                  Click on the visualization to add data points and see how PCA adapts.
                </p>
                <button
                  onClick={() => setDataPoints([
                    [2, 3], [3, 3], [3, 5], [5, 4], [5, 6], [6, 5], [7, 4], [8, 5]
                  ])}
                  className="w-full px-4 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-border/70 transition-colors"
                >
                  Reset Data Points
                </button>
              </div>
            )}

            {activeApp === 'image-processing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">Image Pattern</label>
                  <select
                    value={imagePattern}
                    onChange={(e) => setImagePattern(e.target.value as any)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                  >
                    <option value="sine">Sine Wave</option>
                    <option value="checkerboard">Checkerboard</option>
                    <option value="gradient">Gradient</option>
                    <option value="noise">Random Noise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">Filter Type</label>
                  <select
                    value={imageFilter}
                    onChange={(e) => setImageFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                  >
                    <option value="original">Original</option>
                    <option value="edge">Edge Detection</option>
                    <option value="blur">Blur</option>
                    <option value="sharpen">Sharpen</option>
                    <option value="emboss">Emboss</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Filter Strength: {filterStrength.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={filterStrength}
                    onChange={(e) => setFilterStrength(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-3 bg-theme-bg rounded-lg">
                  <h4 className="font-medium text-theme-text mb-2">How It Works:</h4>
                  <ol className="text-sm text-theme-muted space-y-1">
                    <li>1. Generate test image pattern</li>
                    <li>2. Apply convolution filter matrix</li>
                    <li>3. Display processed result</li>
                    <li>4. Show intensity histogram</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-theme-surface rounded-xl border border-theme-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-text">
                {applications.find(app => app.id === activeApp)?.title}
              </h3>
              <div className="text-sm text-theme-muted">
                Interactive Simulation
              </div>
            </div>
            
            <div className="relative bg-white rounded-lg border border-theme-border overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-auto cursor-pointer"
                onClick={(e) => {
                  if (activeApp === 'data-science') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 600;
                    const y = ((e.clientY - rect.top) / rect.height) * 400;
                    
                    // Convert to data coordinates
                    const dataX = (x - 300) / 30;
                    const dataY = (200 - y) / 30;
                    
                    if (dataX >= -10 && dataX <= 10 && dataY >= -10 && dataY <= 10) {
                      setDataPoints(prev => [...prev, [dataX, dataY]]);
                    }
                  }
                }}
              />
            </div>
            
            <div className="mt-4 text-sm text-theme-muted">
              <p>
                {activeApp === 'computer-graphics' && 'Matrix transformations are fundamental to 3D graphics, game engines, and CAD software. Adjust rotation and scaling to see real-time transformations.'}
                {activeApp === 'data-science' && 'PCA finds the principal directions of variance in data. The red line shows the first principal component (maximum variance direction).'}
                {activeApp === 'physics' && 'Rotation matrices describe how objects rotate in space. This pendulum simulation uses rotation matrices to calculate position over time.'}
                {activeApp === 'image-processing' && 'Advanced convolution filters enable edge detection, blurring, sharpening, and artistic effects. The histogram shows the intensity distribution of the processed image.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3D Visualization for Computer Graphics */}
      {activeApp === 'computer-graphics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ThreeDVisualization
            matrix={get3DRotationMatrix(rotationAngle)}
            showAxes={true}
            showGrid={true}
          />
        </motion.div>
      )}
    </div>
  );
};

export default RealWorldApplications;