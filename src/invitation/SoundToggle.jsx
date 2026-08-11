import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import './invitation.css';

export function SoundToggle({ enabled, onToggle }) {
  return (
    <button
      className="inv-sound-toggle"
      onClick={onToggle}
      aria-label={enabled ? 'Mute sound' : 'Enable sound'}
      title={enabled ? 'Sound On' : 'Sound Off'}
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
