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
        const speed = Math.random() * 5 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.radius = Math.random() * 2 + 1;
        this.gravity = 0.1;
      }
      update() {
        this.vx *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x * dpr, this.y * dpr, this.radius * dpr, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
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
        this.speed = H * 0.015 + Math.random() * H * 0.008;
        this.exploded = false;
        this.delay = delay;
        this.delayLeft = delay;
      }
      update(particles) {
        if (this.delayLeft > 0) { this.delayLeft--; return; }
        this.y -= this.speed;
        if (this.y <= this.targetY && !this.exploded) {
          this.exploded = true;
          this.burst(particles);
        }
      }
      burst(particles) {
        const count = 30 + Math.floor(Math.random() * 20);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, this.y, randomColor()));
        }
        // Ring burst
        const ring = 12;
        for (let i = 0; i < ring; i++) {
          const angle = (i / ring) * Math.PI * 2;
          const p = new Particle(this.x, this.y, '#ffffff');
          p.vx = Math.cos(angle) * 7;
          p.vy = Math.sin(angle) * 7;
          p.decay = 0.04;
          p.radius = 1.5;
          particles.push(p);
        }
      }
      draw(ctx) {
        if (this.exploded || this.delayLeft > 0) return;
        ctx.beginPath();
        ctx.arc(this.x * dpr, this.y * dpr, 2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.fill();
      }
      isDone() { return this.exploded; }
    }

    // Launch rockets in waves
    const LAUNCHES = [0, 8, 16, 26, 36, 48, 60, 75, 90, 110];
    LAUNCHES.forEach((delay, i) => {
      const count = i < 4 ? 1 : 2;
      for (let j = 0; j < count; j++) {
        rocketsRef.current.push(new Rocket(delay + j * 5));
      }
    });

    let startTime = null;
    const DURATION = 5000; // ms

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
