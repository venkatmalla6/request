import React, { useState, useEffect } from 'react';
import { invitationConfig } from './invitationConfig.js';
import { CinematicText } from './CinematicText.jsx';
import './invitation.css';

/**
 * ResponseScene — shown for both YES (type='yes') and MAYBE (type='maybe') outcomes.
 */
export function ResponseScene({ type = 'yes' }) {
  const [step, setStep] = useState(0);
  const { meeting, respectfulEnd } = invitationConfig;
  const isYes = type === 'yes';

  const lines = isYes
    ? [meeting.confirmation, meeting.closing]
    : [respectfulEnd.line1, respectfulEnd.line2, respectfulEnd.line3, respectfulEnd.closing];

  useEffect(() => {
    const timers = lines.map((_, i) =>
      setTimeout(() => setStep(i + 1), 600 + i * 1400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="inv-scene inv-scene--response" aria-label={isYes ? 'Confirmation' : 'Respectful ending'}>
      <div className="inv-response-content">
        {isYes && (
          <div className="inv-response-icon" aria-hidden="true">❤️</div>
        )}
        {!isYes && (
          <div className="inv-response-icon" aria-hidden="true">🌿</div>
        )}

        {lines.map((line, i) => (
          <CinematicText
            key={i}
            text={line}
            visible={step > i}
            variant={i === 0 ? 'heading' : 'body'}
            className="inv-response-line"
            delay={0}
          />
        ))}
      </div>
    </div>
  );
}
