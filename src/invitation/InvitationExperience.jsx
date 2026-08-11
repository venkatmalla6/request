import React, { useState, useEffect } from 'react';
import { SCENES } from './scenes.js';
import { SceneTransition } from './SceneTransition.jsx';
import { IntroScene } from './IntroScene.jsx';
import { MessageScene } from './MessageScene.jsx';
import { InvitationCard } from './InvitationCard.jsx';
import { MeetingFormScene } from './MeetingFormScene.jsx';
import { ResponseScene } from './ResponseScene.jsx';
import { SoundToggle } from './SoundToggle.jsx';
import bgmFile from '../assets/bgm.mp3';
import './invitation.css';

/**
 * InvitationExperience — the root component for the /invitation route.
 *
 * Scene flow:
 *   INTRO (Heart->Sweety) → MESSAGE → INVITATION ──(YES)──► MEETING_FORM → CONFIRMATION
 *                                                ↘ (NO/MAYBE) ──────────► RESPECTFUL_END
 */
export function InvitationExperience() {
  const [scene, setScene] = useState(SCENES.START);
  const audioRef = React.useRef(null);
  // Default to true, but we must start playback synchronously on interaction
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Synchronously play audio if enabled
  const playAudioSync = () => {
    if (audioRef.current && soundEnabled) {
      audioRef.current.muted = false;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.log("Audio play prevented:", e));
      }
    }
  };

  // Try to play immediately when they enter the website (might be blocked)
  useEffect(() => {
    if (scene !== SCENES.START) {
      playAudioSync();
    }
  }, [scene]);

  // Ensure audio plays when user interacts if they haven't muted it
  const handleUserInteraction = () => {
    playAudioSync();
  };

  // Handle explicit toggle from the sound button
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (audioRef.current) {
      if (newState) {
        audioRef.current.muted = false;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => console.log("Audio play prevented:", e));
        }
      } else {
        audioRef.current.pause();
      }
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

  const handleStart = () => {
    handleUserInteraction();
    go(SCENES.INTRO);
  };

  return (
    <div
      className="inv-root"
      style={{ '--inv-bg': '#050609' }}
      aria-label="Invitation experience"
      onClick={handleUserInteraction} // Catch any click on the background to start audio
    >
      {/* Background Audio */}
      <audio ref={audioRef} src={bgmFile} autoPlay loop />

      {/* Sound toggle — always visible in top-right */}
      <SoundToggle
        enabled={soundEnabled}
        onToggle={toggleSound}
      />

      {/* Back link to main app (top-left, subtle) */}
      <a href="/animator" className="inv-back-link" aria-label="Back to Heart Text Animator">
        ← Animator
      </a>

      {/* Scene: START OVERLAY (Requires user interaction to start audio) */}
      <SceneTransition active={scene === SCENES.START}>
        <div className="inv-scene" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            className="inv-btn inv-btn--primary inv-btn--glow" 
            onClick={handleStart}
            style={{ padding: '1.5rem 3rem', fontSize: '1.2rem' }}
          >
            Tap to Begin
          </button>
        </div>
      </SceneTransition>

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
