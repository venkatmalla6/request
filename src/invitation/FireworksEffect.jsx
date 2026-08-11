import React, { useRef, useEffect } from 'react';

/**
 * FireworksEffect — fullscreen canvas burst that plays when YES is clicked.
 * Launches multiple rockets that explode in colorful particle bursts.
 * Auto-cleans up after ~4 seconds.
 */
export function FireworksEffect({ onDone }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const rocketsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = window.innerHeight;

    const COLORS = [
      '#ff2a6d', '#ffb6c1', '#ff85a1', '#ffd700',
      '#ff6b6b', '#c0392b', '#ff4da6', '#ff99cc',
      '#ffe0ec', '#ffffff', '#ffa07a', '#ff69b4',
      '#f39c12', '#e74c3c', '#9b59b6', '#3498db',
    ];

    function randomColor() {
      return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    // ── Particle (explosion debris) ──────────────────────────────
    class Particle {
      constructor(x, y, color) {
        this.x = x; this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1;
        this.alpha = 1;
        this.decay = Math.random() * 0.018 + 0.008;
        this.radius = Math.random() * 3 + 1;
        this.gravity = 0.12;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 5) this.trail.shift();
        this.vx *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw(ctx) {
        // Trail
        this.trail.forEach((pt, i) => {
          const t = i / this.trail.length;
          ctx.beginPath();
          ctx.arc(pt.x * dpr, pt.y * dpr, this.radius * dpr * t * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = pt.alpha * t * 0.4;
          ctx.fill();
        });
        // Head
        ctx.beginPath();
        ctx.arc(this.x * dpr, this.y * dpr, this.radius * dpr, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();
      }
      isDead() { return this.alpha <= 0; }
    }

    // ── Rocket (rises then explodes) ─────────────────────────────
    class Rocket {
      constructor(delay = 0) {
        this.x = W * (0.15 + Math.random() * 0.7);
        this.y = H + 10;
        this.targetY = H * (0.1 + Math.random() * 0.45);
        this.color = randomColor();
        this.speed = H * 0.012 + Math.random() * H * 0.006;
        this.exploded = false;
        this.delay = delay;
        this.delayLeft = delay;
        this.trail = [];
      }
      update(particles) {
        if (this.delayLeft > 0) { this.delayLeft--; return; }
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        this.y -= this.speed;
        if (this.y <= this.targetY && !this.exploded) {
          this.exploded = true;
          this.burst(particles);
        }
      }
      burst(particles) {
        const count = 90 + Math.floor(Math.random() * 60);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, this.y, randomColor()));
        }
        // Ring burst
        const ring = 24;
        for (let i = 0; i < ring; i++) {
          const angle = (i / ring) * Math.PI * 2;
          const p = new Particle(this.x, this.y, '#ffffff');
          p.vx = Math.cos(angle) * 10;
          p.vy = Math.sin(angle) * 10;
          p.decay = 0.03;
          p.radius = 2;
          particles.push(p);
        }
      }
      draw(ctx) {
        if (this.exploded || this.delayLeft > 0) return;
        this.trail.forEach((pt, i) => {
          const t = i / this.trail.length;
          ctx.beginPath();
          ctx.arc(pt.x * dpr, pt.y * dpr, 2 * dpr * t, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = t * 0.6;
          ctx.fill();
        });
        ctx.beginPath();
        ctx.arc(this.x * dpr, this.y * dpr, 3 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12 * dpr;
        ctx.fill();
      }
      isDone() { return this.exploded; }
    }

    // Launch rockets in waves
    const LAUNCHES = [0, 8, 18, 30, 44, 58, 72, 88, 104, 120];
    LAUNCHES.forEach((delay, i) => {
      const count = i < 3 ? 1 : 2;
      for (let j = 0; j < count; j++) {
        rocketsRef.current.push(new Rocket(delay + j * 6));
      }
    });

    let startTime = null;
    const DURATION = 4500; // ms

    const draw = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      ctx.save();
      ctx.fillStyle = 'rgba(5,6,9,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update rockets
      rocketsRef.current.forEach(r => r.update(particlesRef.current));

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => !p.isDead());
      particlesRef.current.forEach(p => { p.update(); p.draw(ctx); });

      // Draw rockets
      rocketsRef.current.forEach(r => r.draw(ctx));

      ctx.restore();

      if (elapsed < DURATION || particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animRef.current);
        if (onDone) onDone();
      }
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []); // run once on mount

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999,
      }}
      aria-hidden="true"
    />
  );
}
