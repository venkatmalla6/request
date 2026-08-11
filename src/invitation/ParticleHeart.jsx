import React, { useRef, useEffect, useCallback } from 'react';

/**
 * ParticleHeart — animates particles forming a mathematically generated
 * heart curve using requestAnimationFrame on an HTML5 Canvas.
 *
 * Phases:
 *  0: assembling (particles move to heart positions)
 *  1: formed (particles gently oscillate + outline travelers)
 *
 * Performance:
 *  - devicePixelRatio aware
 *  - particle count adapts to screen size
 *  - cleanup on unmount
 */

// Heart parametric formula (same as existing HeartCanvas but normalized)
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function ParticleHeart({ onFormed, color = '#ffb6c1', reduceMotion = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  // Store onFormed in a ref so calling it never triggers effect restart
  const onFormedRef = useRef(onFormed);
  useEffect(() => { onFormedRef.current = onFormed; }, [onFormed]);

  const stateRef = useRef({
    phase: 0,           // 0 = assembling, 1 = formed
    particles: [],
    travelers: [],
    assembleProgress: 0, // 0 → 1
    formedNotified: false,
  });

  const initParticles = useCallback((canvas, w, h) => {
    const SCALE = Math.min(w, h) * 0.026; // heart scale relative to canvas
    const PARTICLE_COUNT = reduceMotion ? 60 : Math.min(120, Math.floor((w * h) / 5000));

    // Pre-compute target positions along the heart curve
    const targets = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = (i / PARTICLE_COUNT) * 2 * Math.PI;
      const pt = heartPoint(t);
      targets.push({
        x: w / 2 + pt.x * SCALE,
        y: h / 2 + pt.y * SCALE,
      });
    }

    // Each particle starts randomly scattered near the center
    const particles = targets.map((target, i) => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.4,
      y: h / 2 + (Math.random() - 0.5) * h * 0.4,
      tx: target.x,
      ty: target.y,
      size: Math.random() * 2.2 + 1.2,
      opacity: 0,
      phaseOffset: Math.random() * Math.PI * 2, // for oscillation
      speed: 0.018 + Math.random() * 0.012,
    }));

    // Traveler particles (outline glow dots)
    const TRAVELER_COUNT = reduceMotion ? 0 : 4;
    const travelers = Array.from({ length: TRAVELER_COUNT }, (_, i) => ({
      t: (i / TRAVELER_COUNT) * 2 * Math.PI,
      speed: 0.005 + Math.random() * 0.004,
      size: Math.random() * 3 + 2,
    }));

    stateRef.current = {
      phase: 0,
      particles,
      travelers,
      assembleProgress: 0,
      formedNotified: false,
      SCALE,
      w,
      h,
    };
  }, [reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    let W, H;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width || window.innerWidth;
      H = rect.height || window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      initParticles(canvas, W, H);
    };

    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');

    const draw = (timestamp) => {
      const { phase, particles, travelers, SCALE, w, h } = stateRef.current;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // === PHASE 0: Assembling ===
      if (phase === 0) {
        stateRef.current.assembleProgress = Math.min(
          1,
          stateRef.current.assembleProgress + 0.004
        );
        const prog = easeOutCubic(stateRef.current.assembleProgress);

        particles.forEach((p) => {
          p.x = lerp(p.x, p.tx, p.speed);
          p.y = lerp(p.y, p.ty, p.speed);
          p.opacity = Math.min(1, p.opacity + 0.015);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(color, p.opacity * prog);
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fill();
        });

        if (stateRef.current.assembleProgress >= 1 && !stateRef.current.formedNotified) {
          stateRef.current.phase = 1;
          stateRef.current.formedNotified = true;
          // Use ref so calling callback never restarts the effect
          if (onFormedRef.current) setTimeout(() => onFormedRef.current?.(), 600);
        }
      }

      // === PHASE 1: Formed — oscillate + travelers ===
      if (phase === 1) {
        const time = timestamp * 0.001;

        // Draw glow background halo
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, SCALE * 18);
        gradient.addColorStop(0, hexToRgba(color, 0.06));
        gradient.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Draw particles with oscillation
        particles.forEach((p) => {
          const oscillateX = Math.sin(time * 1.2 + p.phaseOffset) * 1.5;
          const oscillateY = Math.cos(time * 0.9 + p.phaseOffset) * 1.2;
          const px = p.tx + oscillateX;
          const py = p.ty + oscillateY;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(color, 0.85);
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fill();
        });

        // Draw traveler particles along heart outline
        if (!reduceMotion) {
          travelers.forEach((tr) => {
            tr.t += tr.speed;
            const pt = heartPoint(tr.t);
            const tx = w / 2 + pt.x * SCALE;
            const ty = h / 2 + pt.y * SCALE;

            ctx.beginPath();
            ctx.arc(tx, ty, tr.size, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba('#ffffff', 0.9);
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 16;
            ctx.fill();
          });
        }
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  // onFormed intentionally excluded — it lives in onFormedRef
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, initParticles, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
