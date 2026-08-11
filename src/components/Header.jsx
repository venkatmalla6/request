import React from 'react';
import { Heart, Layout, Code, Eye, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header className="app-header">
      <div className="app-title">
        <Heart className="heart-icon-glow" size={24} fill="#ff2a6d" />
        <div>
          <span>Heart Text Animator</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '10px' }}>
            Interactive HTML5 Canvas Art
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          <Sparkles size={14} color="#ffb6c1" />
          Interactive Math Art
        </a>
      </div>
    </header>
  );
};
