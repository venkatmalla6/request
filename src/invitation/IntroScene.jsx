import React, { useState, useEffect } from 'react';
import { invitationConfig } from './invitationConfig.js';
import { CinematicText } from './CinematicText.jsx';
import './invitation.css';

export function IntroScene({ onOpen }) {
  const [step, setStep] = useState(0);
  const { intro } = invitationConfig;

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2400);
    const t3 = setTimeout(() => setStep(3), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="inv-scene inv-scene--intro" aria-label="Introduction">
      <div className="inv-intro-content">
        <CinematicText
          text={intro.greeting}
          visible={step >= 1}
          variant="heading"
          className="inv-intro-greeting"
        />
        <CinematicText
          text={intro.teaser}
          visible={step >= 2}
          variant="body"
          className="inv-intro-teaser"
          delay={200}
        />
        <div className={`inv-open-btn-wrapper ${step >= 3 ? 'inv-open-btn-wrapper--visible' : ''}`}>
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
