import React, { useState, useEffect } from 'react';
import { invitationConfig } from './invitationConfig.js';
import { CinematicText } from './CinematicText.jsx';
import './invitation.css';

export function MeetingOptions({ onConfirm }) {
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);
  const { meeting } = invitationConfig;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="inv-scene inv-scene--meeting" aria-label="Meeting options">
      <div className={`inv-meeting-content ${visible ? 'inv-meeting-content--visible' : ''}`}>
        <CinematicText
          text={meeting.thankYou}
          visible={visible}
          variant="heading"
          className="inv-meeting-thanks"
          delay={0}
        />
        <CinematicText
          text={meeting.youChoose}
          visible={visible}
          variant="body"
          className="inv-meeting-sub"
          delay={600}
        />

        <div className="inv-meeting-options" style={{ transitionDelay: '1000ms' }}>
          <div className="inv-option-group">
            <span className="inv-option-label">{meeting.whatLabel}</span>
            <div className="inv-option-chips">
              {meeting.whatOptions.map((opt) => (
                <button
                  key={opt}
                  className={`inv-chip ${selected === opt ? 'inv-chip--selected' : ''}`}
                  onClick={() => setSelected(opt)}
                  aria-pressed={selected === opt}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="inv-option-group">
            <span className="inv-option-label">{meeting.whereLabel}</span>
            <p className="inv-option-value">{meeting.whereOption}</p>
          </div>

          <div className="inv-option-group">
            <span className="inv-option-label">{meeting.whenLabel}</span>
            <p className="inv-option-value">{meeting.whenOption}</p>
          </div>
        </div>

        <button
          className="inv-btn inv-btn--primary"
          onClick={onConfirm}
          style={{ marginTop: '2.5rem' }}
          aria-label="Confirm meeting"
        >
          {selected ? `${selected} — sounds good ✓` : 'Confirm →'}
        </button>
      </div>
    </div>
  );
}
