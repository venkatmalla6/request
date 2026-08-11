import React, { useState, useCallback, useRef } from 'react';
import { ParticleHeart } from './ParticleHeart.jsx';
import { CinematicText } from './CinematicText.jsx';
import { invitationConfig } from './invitationConfig.js';
import './invitation.css';

export function HeartScene({ onContinue, reduceMotion = false }) {
  const [showMessages, setShowMessages] = useState(false);
  const { heartMessage, theme } = invitationConfig;

  // Guard: ensure handleFormed fires exactly once even if somehow invoked again
  const formedOnce = useRef(false);
  const handleFormed = useCallback(() => {
    if (formedOnce.current) return;
    formedOnce.current = true;
    setTimeout(() => setShowMessages(true), 800);
  }, []); // stable reference — empty deps


  return (
    <div className="inv-scene inv-scene--heart" aria-label="Animated heart">
      {/* Particle Heart fills the background */}
      <div className="inv-heart-canvas-wrapper">
        <ParticleHeart
          onFormed={handleFormed}
          color={theme.accentPink}
          reduceMotion={reduceMotion}
        />
      </div>

      {/* Overlay message */}
      <div className="inv-heart-overlay">
        <CinematicText
          text={heartMessage.line1}
          visible={showMessages}
          variant="body"
          className="inv-heart-msg"
          delay={0}
        />
        <CinematicText
          text={heartMessage.line2}
          visible={showMessages}
          variant="body"
          className="inv-heart-msg"
          delay={1200}
        />
        <div className={`inv-open-btn-wrapper ${showMessages ? 'inv-open-btn-wrapper--visible' : ''}`}
          style={{ transitionDelay: '2400ms' }}>
          <button
            className="inv-btn inv-btn--ghost"
            onClick={onContinue}
            aria-label={heartMessage.continueLabel}
          >
            {heartMessage.continueLabel} →
          </button>
        </div>
      </div>
    </div>
  );
}
