import React, { useState, useEffect } from 'react';
import { SCENES } from './scenes.js';
import { SceneTransition } from './SceneTransition.jsx';
import { IntroScene } from './IntroScene.jsx';
import { MessageScene } from './MessageScene.jsx';
import { InvitationCard } from './InvitationCard.jsx';
import { MeetingFormScene } from './MeetingFormScene.jsx';
import { ResponseScene } from './ResponseScene.jsx';
import { SoundToggle } from './SoundToggle.jsx';
import './invitation.css';

/**
 * InvitationExperience — the root component for the /invitation route.
 *
 * Scene flow:
 *   INTRO (Heart->Sweety) → MESSAGE → INVITATION ──(YES)──► MEETING_FORM → CONFIRMATION
 *                                                ↘ (NO/MAYBE) ──────────► RESPECTFUL_END
 */
export function InvitationExperience() {
  const [scene, setScene] = useState(SCENES.INTRO);
  // Default to true as requested, though browsers may block it until the first interaction
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const audioRef = React.useRef(null);

  // Handle audio play/pause based on soundEnabled state
  useEffect(() => {
    if (audioRef.current) {
      if (soundEnabled) {
        audioRef.current.muted = false;
        // Attempt to play. Note: Browsers block autoplay unmuted without user interaction.
        // It will automatically start playing on the first user click if blocked.
        audioRef.current.play().catch((err) => {
          console.log("Autoplay blocked until user interaction:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [soundEnabled]);

  // Ensure audio plays when user interacts if they haven't muted it
  const handleUserInteraction = () => {
    if (soundEnabled && audioRef.current && audioRef.current.paused) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {});
    }
  };

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const go = (nextScene) => {
    handleUserInteraction();
    setScene(nextScene);
  };

  return (
    <div
      className="inv-root"
      style={{ '--inv-bg': '#050609' }}
      aria-label="Invitation experience"
      onClick={handleUserInteraction} // Catch any click on the background to start audio
    >
      {/* Background Audio */}
      <audio ref={audioRef} src="/bgm.mp3" loop />

      {/* Sound toggle — always visible in top-right */}
      <SoundToggle
        enabled={soundEnabled}
        onToggle={() => setSoundEnabled((p) => !p)}
      />

      {/* Back link to main app (top-left, subtle) */}
      <a href="/animator" className="inv-back-link" aria-label="Back to Heart Text Animator">
        ← Animator
      </a>

      {/* Scene: INTRO */}
      <SceneTransition active={scene === SCENES.INTRO}>
        <IntroScene onOpen={() => go(SCENES.MESSAGE)} />
      </SceneTransition>

      {/* Scene: MESSAGE */}
      <SceneTransition active={scene === SCENES.MESSAGE}>
        <MessageScene onContinue={() => go(SCENES.INVITATION)} />
      </SceneTransition>

      {/* Scene: INVITATION CARD (YES / NO decision) */}
      <SceneTransition active={scene === SCENES.INVITATION}>
        <InvitationCard
          onYes={() => go(SCENES.MEETING_FORM)}
          onMaybe={() => go(SCENES.RESPECTFUL_END)}
        />
      </SceneTransition>

      {/* Scene: MEETING FORM — she fills in date / time / place */}
      <SceneTransition active={scene === SCENES.MEETING_FORM}>
        <MeetingFormScene onConfirmed={() => go(SCENES.CONFIRMATION)} />
      </SceneTransition>

      {/* Scene: YES CONFIRMATION */}
      <SceneTransition active={scene === SCENES.CONFIRMATION}>
        <ResponseScene type="yes" />
      </SceneTransition>

      {/* Scene: RESPECTFUL END */}
      <SceneTransition active={scene === SCENES.RESPECTFUL_END}>
        <ResponseScene type="maybe" />
      </SceneTransition>
    </div>
  );
}
