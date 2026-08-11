import React, { useState, useEffect } from 'react';
import { CinematicText } from './CinematicText.jsx';
import { invitationConfig } from './invitationConfig.js';
import './invitation.css';

export function MessageScene({ onContinue }) {
  const [currentLine, setCurrentLine] = useState(-1);
  const { personalMessages } = invitationConfig;
  const TOTAL = personalMessages.length;

  useEffect(() => {
    const timers = [];
    // Show each line with a 1.6s gap
    for (let i = 0; i < TOTAL; i++) {
      timers.push(setTimeout(() => setCurrentLine(i), 800 + i * 1600));
    }
    return () => timers.forEach(clearTimeout);
  }, [TOTAL]);

  const allShown = currentLine >= TOTAL - 1;

  return (
    <div className="inv-scene inv-scene--message" aria-label="Personal message">
      <div className="inv-message-content">
        {personalMessages.map((msg, i) => (
          <CinematicText
            key={i}
            text={msg}
            visible={currentLine >= i}
            variant={i === TOTAL - 1 ? 'heading' : 'body'}
            className={`inv-msg-line ${i === TOTAL - 1 ? 'inv-msg-line--final' : ''}`}
            delay={0}
          />
        ))}

        <div className={`inv-open-btn-wrapper ${allShown ? 'inv-open-btn-wrapper--visible' : ''}`}
          style={{ transitionDelay: '600ms', marginTop: '3rem' }}>
          <button
            className="inv-btn inv-btn--primary"
            onClick={onContinue}
            aria-label="Continue to invitation"
          >
            I'm listening →
          </button>
        </div>
      </div>
    </div>
  );
}
