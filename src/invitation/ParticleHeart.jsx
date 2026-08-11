import React, { useRef, useEffect, useCallback } from 'react';

/**
 * ParticleHeart — animates particles forming a mathematically generated
 * heart curve, and then morphs them into a text string ("Sweety").
 */

// Heart parametric formula
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

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ParticleHeart({ onFormed, color = '#ffb6c1', text = 'Sweety', reduceMotion = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const onFormedRef = useRef(onFormed);
  useEffect(() => { onFormedRef.current = onFormed; }, [onFormed]);

  const stateRef = useRef({
    phase: 0,           // 0: assemble heart, 1: hold heart, 2: morph to text, 3: hold text
    particles: [],
    travelers: [],
    assembleProgress: 0,
    morphProgress: 0,
    phase1StartTime: 0,
    notified: false,
  });

  const initParticles = useCallback((canvas, w, h) => {
    const SCALE = Math.min(w, h) * 0.026;
    
    // Increase particle count significantly to make text denser and clearer
    const PARTICLE_COUNT = reduceMotion ? 300 : Math.min(900, Math.floor((w * h) / 1000));

    // 1. Generate Heart Targets
    const heartTargets = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = (i / PARTICLE_COUNT) * 2 * Math.PI;
      const pt = heartPoint(t);
      heartTargets.push({
        x: w / 2 + pt.x * SCALE,
        y: h / 2 + pt.y * SCALE,
      });
    }

    // 2. Generate Text Targets using offscreen canvas
    const textTargets = [];
    if (text) {
      const intW = Math.floor(w);
      const intH = Math.floor(h);
      const offC = document.createElement('canvas');
      const offCtx = offC.getContext('2d', { willReadFrequently: true });
      offC.width = intW;
      offC.height = intH;
      
      // Draw text - dynamically scale to fit width
      let fontSize = 100; // reference size
      offCtx.font = `bold ${fontSize}px "Dancing Script", cursive`;
      const metrics = offCtx.measureText(text);
      const textWidth = metrics.width || (text.length * fontSize * 0.5); 
      
      // Target 75% of screen width (a bit smaller so it's sharper)
      const targetWidth = Math.min(intW * 0.75, 700);
      fontSize = (targetWidth / textWidth) * fontSize;
      
      // Ensure height doesn't break out of screen
      fontSize = Math.min(fontSize, intH * 0.35);

      offCtx.font = `bold ${fontSize}px "Dancing Script", cursive`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText(text, intW / 2, intH / 2);

      // Extract pixels
      const imgData = offCtx.getImageData(0, 0, intW, intH).data;
      const validPoints = [];
      // Sample every 2nd pixel for higher resolution text mapping
      for (let y = 0; y < intH; y += 2) {
        for (let x = 0; x < intW; x += 2) {
          const alpha = imgData[(y * intW + x) * 4 + 3];
          if (alpha > 128) {
            validPoints.push({ x, y });
          }
        }
      }

      console.log("[ParticleHeart] Found text points:", validPoints.length);
      // Map particles to valid text points (wrap around if not enough points)
      if (validPoints.length > 0) {
        // Shuffle valid points for a random look
        validPoints.sort(() => Math.random() - 0.5);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const pt = validPoints[i % validPoints.length];
          // Very slight scatter for sharpness
          textTargets.push({
            x: pt.x + (Math.random() - 0.5) * 1.5,
            y: pt.y + (Math.random() - 0.5) * 1.5,
          });
        }
      } else {
        // Fallback if text measuring fails
        for (let i = 0; i < PARTICLE_COUNT; i++) textTargets.push(heartTargets[i]);
      }
    }

    // 3. Initialize Particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * w * 0.4,
        y: h / 2 + (Math.random() - 0.5) * h * 0.4,
        hx: heartTargets[i].x,  // heart x
        hy: heartTargets[i].y,  // heart y
        tx: textTargets.length > 0 ? textTargets[i].x : heartTargets[i].x, // text x
        ty: textTargets.length > 0 ? textTargets[i].y : heartTargets[i].y, // text y
        size: Math.random() * 2.2 + 1.2,
        opacity: 0,
        phaseOffset: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.01,
      });
    }

    // Traveler particles (outline glow dots for the heart phase)
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
      morphProgress: 0,
      phase1StartTime: 0,
      notified: false,
      SCALE,
      w,
      h,
    };
  }, [reduceMotion, text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load font before measuring if possible (hacky wait for document.fonts)
    document.fonts?.ready.then(() => {
      start();
    }).catch(() => start());

    let W, H;
    const dpr = window.devicePixelRatio || 1;
    let resizeListener;

    function start() {
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
      resizeListener = resize;

      const ctx = canvas.getContext('2d');

      const draw = (timestamp) => {
        const { phase, particles, travelers, SCALE, w, h } = stateRef.current;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const time = timestamp * 0.001;

        // === PHASE 0: Assembling Heart ===
        if (phase === 0) {
          stateRef.current.assembleProgress = Math.min(1, stateRef.current.assembleProgress + 0.004);
          const prog = easeOutCubic(stateRef.current.assembleProgress);

          particles.forEach((p) => {
            p.x = lerp(p.x, p.hx, p.speed);
            p.y = lerp(p.y, p.hy, p.speed);
            p.opacity = Math.min(1, p.opacity + 0.015);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(color, p.opacity * prog);
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fill();
          });

          if (stateRef.current.assembleProgress >= 1) {
            stateRef.current.phase = 1;
            stateRef.current.phase1StartTime = timestamp;
          }
        }

        // === PHASE 1: Hold Heart ===
        if (phase === 1) {
          drawHalo(ctx, w, h, SCALE, color);
          
          particles.forEach((p) => {
            const oscillateX = Math.sin(time * 1.2 + p.phaseOffset) * 1.5;
            const oscillateY = Math.cos(time * 0.9 + p.phaseOffset) * 1.2;
            const px = p.hx + oscillateX;
            const py = p.hy + oscillateY;

            // Keep current position updated so it doesn't snap on morph
            p.x = px;
            p.y = py;

            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(color, 0.85);
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fill();
          });

          drawTravelers(ctx, travelers, w, h, SCALE, reduceMotion);

          // Hold heart for 2 seconds, then morph
          if (timestamp - stateRef.current.phase1StartTime > 2000) {
            stateRef.current.phase = 2;
          }
        }

        // === PHASE 2: Morph to Text ===
        if (phase === 2) {
          stateRef.current.morphProgress = Math.min(1, stateRef.current.morphProgress + 0.008);
          
          particles.forEach((p) => {
            // Speed up morphing by using a stronger lerp
            p.x = lerp(p.x, p.tx, 0.04);
            p.y = lerp(p.y, p.ty, 0.04);
            
            // Text color gradient
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba('#ffffff', 0.85);
            ctx.shadowColor = '#ffb6c1';
            ctx.shadowBlur = 10;
            ctx.fill();
          });

          if (stateRef.current.morphProgress >= 1) {
            stateRef.current.phase = 3;
            if (!stateRef.current.notified && onFormedRef.current) {
              stateRef.current.notified = true;
              onFormedRef.current();
            }
          }
        }

        // === PHASE 3: Hold Text ===
        if (phase === 3) {
          particles.forEach((p) => {
            // Gentle floating for text
            const oscillateX = Math.sin(time * 1.5 + p.phaseOffset) * 0.4;
            const oscillateY = Math.cos(time * 1.2 + p.phaseOffset) * 0.4;
            const px = p.tx + oscillateX;
            const py = p.ty + oscillateY;

            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba('#ffffff', 0.9);
            ctx.shadowColor = '#ffb6c1';
            ctx.shadowBlur = 12;
            ctx.fill();
          });
        }

        ctx.restore();
        animRef.current = requestAnimationFrame(draw);
      };

      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (resizeListener) window.removeEventListener('resize', resizeListener);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
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

function drawHalo(ctx, w, h, SCALE, color) {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, SCALE * 18);
  gradient.addColorStop(0, hexToRgba(color, 0.06));
  gradient.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawTravelers(ctx, travelers, w, h, SCALE, reduceMotion) {
  if (reduceMotion) return;
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
