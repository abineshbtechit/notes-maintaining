import React from 'react';
import { Sparkles, PlusCircle, Library } from 'lucide-react';

export default function Header({ currentView, onViewChange }) {
  return (
    <header className="top-header">
      <div className="brand-wrapper">
        <div className="brand-logo-badge" title="Notes Hub">
          <Sparkles style={{ width: 20, height: 20 }} />
        </div>
        <div>
          <h1 className="brand-title">
            NOTES HUB
            <span className="brand-badge">Apple × Duolingo</span>
          </h1>
        </div>
      </div>

      <div className="header-actions">
        {/* Gamified Duolingo Streak Pill */}
        <div className="streak-pill" title="Current Daily Study Streak">
          <span className="streak-flame">🔥</span>
          <span className="streak-text">5 Day Streak</span>
        </div>

        {/* Navigation Switcher Pills */}
        <div className="nav-toggle-group">
          <button
            type="button"
            className={`nav-toggle-btn ${currentView === 'upload' ? 'active' : ''}`}
            onClick={() => onViewChange('upload')}
            title="Upload Studio"
          >
            <PlusCircle style={{ width: 16, height: 16 }} />
            <span className="nav-toggle-label">Upload</span>
          </button>
          <button
            type="button"
            className={`nav-toggle-btn ${currentView === 'library' ? 'active' : ''}`}
            onClick={() => onViewChange('library')}
            title="View Notes"
          >
            <Library style={{ width: 16, height: 16 }} />
            <span className="nav-toggle-label">Library</span>
          </button>
        </div>
      </div>
    </header>
  );
}
