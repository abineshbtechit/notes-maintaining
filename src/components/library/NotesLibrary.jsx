import React, { useState } from 'react';
import { Layers, Camera, Code, Sigma, Search, BookOpen } from 'lucide-react';
import FolderExplorer from './FolderExplorer.jsx';
import NoteCard from './NoteCard.jsx';

export default function NotesLibrary({
  notes,
  stats,
  registeredFolders,
  onViewNote,
  onEditNote,
  onMoveNote,
  onDeleteNote,
  onToggleStar,
  onOpenMoveFolderModal,
  onGoToUpload
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'photo' | 'technical' | 'formula' | 'starred'
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');

  // Filter notes
  const filteredNotes = notes.filter(note => {
    // 1. Folder & Topic Filter
    if (selectedFolder !== 'all' && (note.folder || 'General') !== selectedFolder) {
      return false;
    }
    if (selectedTopic !== 'all' && (note.topic || 'General Notes') !== selectedTopic) {
      return false;
    }

    // 2. Category Filter
    if (categoryFilter === 'photo' && note.type !== 'photo') return false;
    if (categoryFilter === 'technical' && note.type !== 'technical') return false;
    if (categoryFilter === 'formula' && note.type !== 'formula') return false;
    if (categoryFilter === 'starred' && !note.starred) return false;

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (note.title || '').toLowerCase().includes(q);
      const folderMatch = (note.folder || '').toLowerCase().includes(q);
      const topicMatch = (note.topic || '').toLowerCase().includes(q);
      const tagsMatch = (note.tags || []).some(t => t.includes(q));
      const contentMatch = (note.content || note.notesText || note.breakdown || note.latexText || '').toLowerCase().includes(q);
      return titleMatch || folderMatch || topicMatch || tagsMatch || contentMatch;
    }

    return true;
  });

  return (
    <section className="page-view">
      {/* Header Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <h2 className="hero-title">
          Knowledge Library
        </h2>
        <p className="hero-subtitle">
          Browse, edit, search, and manage your notes structured under dedicated subject folders and topic categories.
        </p>
      </div>

      {/* Quick Metrics Strip */}
      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon"><Layers style={{ color: 'var(--primary-dark)' }} /></div>
          <div>
            <div className="stat-count">{stats.total}</div>
            <div className="stat-label">Total Notes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Camera style={{ color: '#0066CC' }} /></div>
          <div>
            <div className="stat-count">{stats.photos}</div>
            <div className="stat-label">Photo Notes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Code style={{ color: '#7E22CE' }} /></div>
          <div>
            <div className="stat-count">{stats.technical}</div>
            <div className="stat-label">Technical Docs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Sigma style={{ color: 'var(--primary-dark)' }} /></div>
          <div>
            <div className="stat-count">{stats.formula}</div>
            <div className="stat-label">Formulae</div>
          </div>
        </div>
      </div>

      {/* Hierarchical Folder & Topic Explorer */}
      <FolderExplorer
        notes={notes}
        registeredFolders={registeredFolders}
        selectedFolder={selectedFolder}
        selectedTopic={selectedTopic}
        onSelectFolder={setSelectedFolder}
        onSelectTopic={setSelectedTopic}
        onOpenMoveFolderModal={onOpenMoveFolderModal}
      />

      {/* Controls Bar: Search & Category Chips */}
      <div className="library-controls-bar">
        <div className="search-input-wrapper">
          <Search style={{ width: 18, height: 18 }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, topic, formula, code, or #tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-chips">
          <button
            type="button"
            className={`cat-filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All Types
          </button>
          <button
            type="button"
            className={`cat-filter-chip ${categoryFilter === 'photo' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('photo')}
          >
            📸 Photos
          </button>
          <button
            type="button"
            className={`cat-filter-chip ${categoryFilter === 'technical' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('technical')}
          >
            💻 Technical
          </button>
          <button
            type="button"
            className={`cat-filter-chip ${categoryFilter === 'formula' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('formula')}
          >
            📐 Formulae
          </button>
          <button
            type="button"
            className={`cat-filter-chip ${categoryFilter === 'starred' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('starred')}
          >
            ⭐ Starred
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state-card">
            <BookOpen style={{ width: 48, height: 48, margin: '0 auto 12px', display: 'block', color: 'var(--primary)' }} />
            <h3 style={{ marginBottom: 6 }}>No notes found</h3>
            <p>
              No notes matching your current filter in{' '}
              {selectedFolder === 'all' ? 'any folder' : `folder "${selectedFolder}"`}.
            </p>
            <button
              type="button"
              className="btn-duo-primary"
              style={{ marginTop: 16 }}
              onClick={onGoToUpload}
            >
              + Upload Notes Now
            </button>
          </div>
        ) : (
          filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onView={onViewNote}
              onEdit={onEditNote}
              onMove={onMoveNote}
              onDelete={onDeleteNote}
              onToggleStar={onToggleStar}
            />
          ))
        )}
      </div>
    </section>
  );
}
