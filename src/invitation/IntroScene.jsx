import React, { useState, useCallback, useEffect } from 'react';
import { invitationConfig } from './invitationConfig.js';
import { ParticleHeart } from './ParticleHeart.jsx';
import './invitation.css';

export function IntroScene({ onOpen }) {
  const { intro } = invitationConfig;
  const [showButton, setShowButton] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleFormed = useCallback(() => {
    // Wait a moment after "Sweety" is fully formed before showing the button
    setTimeout(() => {
      setShowButton(true);
    }, 1500);
  }, []);

  return (
    <div className="inv-scene inv-scene--intro" aria-label="Introduction">
      <ParticleHeart 
        onFormed={handleFormed} 
        color={invitationConfig.theme.accentPink}
        text="Sweety"
        reduceMotion={reduceMotion} 
      />
      
      <div className="inv-intro-content" style={{ zIndex: 10, pointerEvents: 'none' }}>
        {/* We push the button down so it appears below the text */}
        <div className={`inv-open-btn-wrapper ${showButton ? 'inv-open-btn-wrapper--visible' : ''}`} style={{ pointerEvents: 'auto', marginTop: '20vh' }}>
          <button
            className="inv-btn inv-btn--primary inv-btn--glow"
            onClick={onOpen}
            aria-label={intro.buttonLabel}
          >
            <span>{intro.buttonLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
