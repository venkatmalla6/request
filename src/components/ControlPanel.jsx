import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Palette, Sparkles, Heart, FastForward, Sliders } from 'lucide-react';
import { audioSynth } from '../utils/AudioSynthesizer';

export const ControlPanel = ({
  text,
  setText,
  color,
  setColor,
  speed,
  setSpeed,
  minScale,
  setMinScale,
  maxScale,
  setMaxScale,
  fontFamily,
  setFontFamily,
  isPlaying,
  setIsPlaying,
  soundEnabled,
  setSoundEnabled,
  onReset,
}) => {
  const colorPresets = [
    { name: 'Soft Pink (Original)', value: '#ffb6c1' },
    { name: 'Neon Rose', value: '#ff2a6d' },
    { name: 'Cyber Purple', value: '#9d4edd' },
    { name: 'Golden Light', value: '#ffd700' },
    { name: 'Electric Cyan', value: '#05d9e8' },
    { name: 'Emerald Glow', value: '#22c55e' },
  ];

  const presets = [
    { name: 'Classic Python Turtle (Scale 11-16)', text: 'I love you', min: 11, max: 16, color: '#ffb6c1' },
    { name: 'Dense Glowing Shells (Scale 8-18)', text: 'Forever & Always', min: 8, max: 18, color: '#ff2a6d' },
    { name: 'Golden Romance', text: '❤️ My Love', min: 10, max: 15, color: '#ffd700' },
    { name: 'Cyberpunk Heart', text: 'I Love You', min: 12, max: 17, color: '#9d4edd' },
  ];

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audioSynth.toggleSound(nextState);
    if (nextState) {
      audioSynth.playHeartbeat();
    }
  };

  const applyPreset = (preset) => {
    setText(preset.text);
    setMinScale(preset.min);
    setMaxScale(preset.max);
    setColor(preset.color);
    if (onReset) onReset();
  };

  return (
    <div className="control-drawer glass-panel">
      {/* Playback Controls */}
      <div className="control-group">
        <button
          className="btn-primary"
          onClick={() => {
            setIsPlaying(!isPlaying);
            if (!soundEnabled && !isPlaying) {
              audioSynth.init();
            }
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button className="btn-secondary" onClick={onReset} title="Reset Drawing">
          <RotateCcw size={16} />
          Reset
        </button>

        <button
          className={`icon-btn ${soundEnabled ? 'active' : ''}`}
          onClick={handleToggleSound}
          title={soundEnabled ? 'Mute Sound' : 'Enable Audio Feedback'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Text Customization */}
      <div className="control-group">
        <span className="input-label">Heart Text:</span>
        <input
          type="text"
          className="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I love you"
        />
      </div>

      {/* Color Palette */}
      <div className="control-group">
        <span className="input-label">Color:</span>
        <div className="color-swatches">
          {colorPresets.map((swatch) => (
            <div
              key={swatch.value}
              className={`swatch ${color === swatch.value ? 'selected' : ''}`}
              style={{ backgroundColor: swatch.value }}
              onClick={() => setColor(swatch.value)}
              title={swatch.name}
            />
          ))}
        </div>
      </div>

      {/* Speed Slider */}
      <div className="control-group">
        <span className="input-label">Speed:</span>
        <div className="slider-container">
          <input
            type="range"
            min="0.2"
            max="4"
            step="0.2"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="range-slider"
          />
          <span style={{ fontSize: '0.8rem', width: '32px', color: 'var(--text-secondary)' }}>
            {speed}x
          </span>
        </div>
      </div>

      {/* Scale Range Sliders */}
      <div className="control-group">
        <span className="input-label">Layers:</span>
        <div className="slider-container">
          <input
            type="range"
            min="6"
            max="14"
            value={minScale}
            onChange={(e) => setMinScale(parseInt(e.target.value))}
            className="range-slider"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
          <input
            type="range"
            min="15"
            max="22"
            value={maxScale}
            onChange={(e) => setMaxScale(parseInt(e.target.value))}
            className="range-slider"
          />
        </div>
      </div>

      {/* Preset Selector */}
      <div className="control-group">
        <span className="input-label">Preset:</span>
        <select
          className="select-input"
          onChange={(e) => {
            const chosen = presets.find((p) => p.name === e.target.value);
            if (chosen) applyPreset(chosen);
          }}
        >
          {presets.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
