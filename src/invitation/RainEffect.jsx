import React, { useRef, useEffect } from 'react';

/**
 * RainEffect — fullscreen canvas rain that ramps up intensity
 * as noCount increases. Uses refs-only for zero re-render overhead.
 */
export function RainEffect({ intensity = 1, active = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dropsRef = useRef([]);
  const intensityRef = useRef(intensity);

  // Keep intensity ref in sync without restarting the effect
  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');

    // Initialise a pool of 300 drops
    const MAX_DROPS = 300;
    const spawnDrop = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      length: Math.random() * 18 + 8,
      speed: Math.random() * 6 + 4,
      opacity: Math.random() * 0.35 + 0.1,
      width: Math.random() * 1 + 0.4,
      color: Math.random() > 0.85 ? '#a8d8ff' : '#7cb8ff',
    });

    dropsRef.current = Array.from({ length: MAX_DROPS }, spawnDrop);

    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const lvl = Math.min(intensityRef.current, 50); // 1-50

      // Visible drop count scales 20→300 as intensity 1→50
      const visibleCount = Math.floor(20 + (lvl / 50) * 280);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < visibleCount; i++) {
        const d = dropsRef.current[i];
        d.y += d.speed * (0.6 + lvl * 0.04);

        // Reset drop when it goes off screen
        if (d.y > H + d.length) {
          d.x = Math.random() * W;
          d.y = -d.length;
          d.speed = Math.random() * 6 + 4;
        }

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.15, d.y + d.length);
        ctx.strokeStyle = d.color;
        ctx.globalAlpha = d.opacity;
        ctx.lineWidth = d.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []); // runs once

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        opacity: active ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
      aria-hidden="true"
    />
  );
}
