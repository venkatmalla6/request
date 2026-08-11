import React, { useEffect, useState } from 'react';
import './invitation.css';

/**
 * CinematicText — renders text with a fade + slight upward slide animation.
 * @param {string} text
 * @param {boolean} visible — when true, animates in
 * @param {string} variant — 'heading' | 'body' | 'muted'
 * @param {number} delay — ms before animation starts
 */
export function CinematicText({ text, visible = true, variant = 'body', delay = 0, className = '', style = {} }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!visible) { setShown(false); return; }
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

  return (
    <p
      className={`cinematic-text cinematic-text--${variant} ${shown ? 'cinematic-text--visible' : ''} ${className}`}
      style={style}
      aria-live="polite"
    >
      {text}
    </p>
  );
}
