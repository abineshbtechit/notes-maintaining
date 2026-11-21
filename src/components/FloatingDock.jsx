import React from 'react';
import { PlusCircle, BookOpen } from 'lucide-react';

export default function FloatingDock({ currentView, onViewChange }) {
  return (
    <nav className="floating-nav-dock" aria-label="Main Navigation">
      <button
        type="button"
        className={`nav-dock-item ${currentView === 'upload' ? 'active' : ''}`}
        onClick={() => onViewChange('upload')}
      >
        <PlusCircle style={{ width: 20, height: 20 }} />
        <span>Upload</span>
      </button>
      <button
        type="button"
        className={`nav-dock-item ${currentView === 'library' ? 'active' : ''}`}
        onClick={() => onViewChange('library')}
      >
        <BookOpen style={{ width: 20, height: 20 }} />
        <span>Library</span>
      </button>
    </nav>
  );
}
