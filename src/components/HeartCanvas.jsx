import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Download, RefreshCw, ZoomIn, ZoomOut, Maximize2, Sparkles, Heart } from 'lucide-react';
import { audioSynth } from '../utils/AudioSynthesizer';

export const HeartCanvas = ({
  text = "I love you",
  minScale = 11,
  maxScale = 16,
  color = "#ffb6c1",
  fontFamily = "Arial",
  fontSize = 9,
  speed = 1,
  isPlaying = true,
  onStepChange,
  onFinished,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Animation state stored in refs for smooth requestAnimationFrame performance
  const animationRef = useRef(null);
  const currentScaleRef = useRef(minScale);
  const currentStepRef = useRef(0);
  const drawnPointsRef = useRef([]); // Stores { x, y, scale, angle, text }
  const particlesRef = useRef([]);

  // Generate background ambient particles once
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Compute (x, y) coordinates for a given scale and step index (0..119)
  const calculateHeartPoint = (scaleVal, stepIdx) => {
    const steps = 120;
    const angle = (stepIdx * Math.PI * 2) / steps;
    
    // Parametric heart formula from prompt
    const rawX = 16 * Math.pow(Math.sin(angle), 3);
    const rawY = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);

    // Canvas Y-axis is inverted (downwards is positive)
    const x = rawX * scaleVal;
    const y = -rawY * scaleVal;

    return { x, y, angle };
  };

  // Reset drawing
  const resetAnimation = useCallback(() => {
    currentScaleRef.current = minScale;
    currentStepRef.current = 0;
    drawnPointsRef.current = [];
  }, [minScale]);

  useEffect(() => {
    resetAnimation();
  }, [text, minScale, maxScale, color, resetAnimation]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();
    let accumulatedSteps = 0;

    const render = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Update Canvas Size for Retina/DPI displays
      const width = containerRef.current && containerRef.current.clientWidth > 0
        ? containerRef.current.clientWidth
        : window.innerWidth || 800;
      const height = containerRef.current && containerRef.current.clientHeight > 0
        ? containerRef.current.clientHeight
        : window.innerHeight - 150 || 600;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Center origin + user pan & zoom
      const centerX = width / 2 + pan.x;
      const centerY = height / 2 + pan.y;

      // Draw subtle starry background particles
      ctx.fillStyle = '#ffffff';
      particlesRef.current.forEach((p) => {
        p.opacity += p.speed;
        if (p.opacity > 0.7 || p.opacity < 0.2) p.speed = -p.speed;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(centerX + p.x * zoom, centerY + p.y * zoom, p.size * zoom, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Progress animation if playing
      if (isPlaying) {
        // Calculate steps to add based on speed parameter
        const stepsPerSec = 160 * speed;
        accumulatedSteps += stepsPerSec * delta;

        while (accumulatedSteps >= 1) {
          accumulatedSteps -= 1;

          if (currentScaleRef.current <= maxScale) {
            const pt = calculateHeartPoint(currentScaleRef.current, currentStepRef.current);
            drawnPointsRef.current.push({
              x: pt.x,
              y: pt.y,
              scale: currentScaleRef.current,
              angle: pt.angle,
            });

            // Audio pop sound feedback
            if (currentStepRef.current % 4 === 0) {
              audioSynth.playPop(currentScaleRef.current, currentStepRef.current / 120);
            }

            // Move step index
            currentStepRef.current += 1;
            if (currentStepRef.current >= 120) {
              currentStepRef.current = 0;
              currentScaleRef.current += 1;
            }

            if (onStepChange) {
              onStepChange(drawnPointsRef.current.length);
            }
          } else {
            if (onFinished) onFinished();
          }
        }
      }

      // Draw all accumulated text points
      ctx.font = `bold ${fontSize * zoom}px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outer Glow Effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 * zoom;
      ctx.fillStyle = color;

      const points = drawnPointsRef.current;
      const totalPoints = points.length;

      for (let i = 0; i < totalPoints; i++) {
        const pt = points[i];
        const px = centerX + pt.x * zoom;
        const py = centerY + pt.y * zoom;

        // Slight pulse glow for newly drawn points
        if (i > totalPoints - 10 && isPlaying) {
          ctx.shadowBlur = 20 * zoom;
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.shadowBlur = 8 * zoom;
          ctx.fillStyle = color;
        }

        ctx.fillText(text, px, py);
      }

      // Reset shadow for active turtle cursor / lead point
      ctx.shadowBlur = 0;

      // Draw active leading indicator (Turtle drawing cursor)
      if (isPlaying && currentScaleRef.current <= maxScale) {
        const lead = calculateHeartPoint(currentScaleRef.current, currentStepRef.current);
        const lx = centerX + lead.x * zoom;
        const ly = centerY + lead.y * zoom;

        // Lead glowing ring
        ctx.beginPath();
        ctx.arc(lx, ly, 12 * zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(lx, ly, 4 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, minScale, maxScale, color, fontFamily, fontSize, speed, isPlaying, zoom, pan, onStepChange, onFinished]);

  // Pan / Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Zoom handlers
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // High-Resolution Snapshot Export
  const downloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res offscreen canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');

    // Fill dark background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1920, 1080);

    const centerX = 1920 / 2;
    const centerY = 1080 / 2;

    ctx.font = `bold ${fontSize * 1.8}px ${fontFamily}, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;

    drawnPointsRef.current.forEach((pt) => {
      ctx.fillText(text, centerX + pt.x * 1.8, centerY + pt.y * 1.8);
    });

    // Add signature watermark
    ctx.font = '14px Fira Code, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('Created with Heart Text Animator', 1920 - 150, 1080 - 30);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `heart-${text.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  };

  const progressPercent = Math.min(
    100,
    Math.floor((drawnPointsRef.current.length / ((maxScale - minScale + 1) * 120)) * 100)
  );

  return (
    <div className="canvas-stage-window" ref={containerRef}>
      {/* Overlay Status Badge */}
      <div className="overlay-badge">
        <div className={`status-dot ${isPlaying ? 'drawing' : ''}`} />
        <span>
          {progressPercent < 100
            ? `Drawing: ${progressPercent}% (${drawnPointsRef.current.length} points)`
            : 'Completed ❤️'}
        </span>
      </div>

      {/* Canvas Area */}
      <div
        className="canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Floating Canvas Toolbar */}
      <div className="floating-toolbar">
        <button className="icon-btn" onClick={zoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button className="icon-btn" onClick={zoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button className="icon-btn" onClick={resetView} title="Reset View">
          <Maximize2 size={16} />
        </button>
        <button className="icon-btn" onClick={resetAnimation} title="Restart Drawing">
          <RefreshCw size={16} />
        </button>
        <button className="icon-btn active" onClick={downloadSnapshot} title="Download PNG Snapshot">
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};
