import React, { useEffect, useState } from 'react';
import './invitation.css';

/**
 * SceneTransition — wraps any child in a full-page fade container.
 * When `active` is false, it fades out and is removed.
 */
export function SceneTransition({ active, children, className = '' }) {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 20); // next paint
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 700);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!mounted) return null;

  return (
    <div className={`scene-transition ${visible ? 'scene-transition--visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
