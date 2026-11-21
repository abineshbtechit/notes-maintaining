import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import FloatingDock from './components/FloatingDock.jsx';
import Toast from './components/Toast.jsx';
import UploadStudio from './components/upload/UploadStudio.jsx';
import NotesLibrary from './components/library/NotesLibrary.jsx';
import InspectorModal from './components/InspectorModal.jsx';
import EditNoteModal from './components/EditNoteModal.jsx';
import NewFolderModal from './components/NewFolderModal.jsx';
import MoveNoteModal from './components/MoveNoteModal.jsx';
import MoveFolderModal from './components/MoveFolderModal.jsx';
import { db } from './services/db.js';
import { seedDefaultDataIfEmpty } from './services/sampleData.js';

export default function App() {
  const [currentView, setCurrentView] = useState('upload'); // 'upload' | 'library'
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ total: 0, photos: 0, technical: 0, formula: 0, starred: 0 });
  const [folders, setFolders] = useState([]);
  
  // Modals & Overlays
  const [activeInspectorNote, setActiveInspectorNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [movingNote, setMovingNote] = useState(null);
  const [isMoveFolderOpen, setIsMoveFolderOpen] = useState(false);
  const [newFolderConfig, setNewFolderConfig] = useState(null);
  const [toast, setToast] = useState(null);

  // Celebratory toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Reload data from DB
  const refreshData = useCallback(async () => {
    const allNotes = await db.getAllNotes();
    const counts = await db.countNotes();
    const regFolders = db.getRegisteredFolders();
    setNotes(allNotes);
    setStats(counts);
    setFolders(regFolders);
  }, []);

  // Initialize DB & Sync Data with Server on initial mount
  useEffect(() => {
    async function init() {
      await db.init();
      await db.syncWithServer();
      await seedDefaultDataIfEmpty();
      await refreshData();
    }
    init();
  }, [refreshData]);

  // Whenever switching views, pull fresh notes and folders from server
  useEffect(() => {
    if (currentView === 'library') {
      refreshData();
    }
  }, [currentView, refreshData]);

  // When note is saved, refresh and auto-switch to library so user immediately sees it
  const handleNoteSaved = async () => {
    await refreshData();
    setCurrentView('library');
  };

  // Handlers
  const handleToggleStar = async (id) => {
    const updated = await db.toggleStar(id);
    if (updated) {
      showToast(updated.starred ? '⭐ Added to Starred!' : 'Removed from Starred');
      await refreshData();
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await db.deleteNote(id);
      showToast('🗑️ Note deleted successfully');
      await refreshData();
    }
  };

  return (
    <>
      {/* Top Header */}
      <Header currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {currentView === 'upload' ? (
          <UploadStudio
            folders={folders}
            onOpenNewFolderModal={(type, parentFolder) => setNewFolderConfig({ type, parentFolder })}
            onViewLibrary={() => setCurrentView('library')}
            onNoteSaved={handleNoteSaved}
            showToast={showToast}
          />
        ) : (
          <NotesLibrary
            notes={notes}
            stats={stats}
            registeredFolders={folders}
            onViewNote={setActiveInspectorNote}
            onEditNote={setEditingNote}
            onMoveNote={setMovingNote}
            onOpenMoveFolderModal={() => setIsMoveFolderOpen(true)}
            onDeleteNote={handleDeleteNote}
            onToggleStar={handleToggleStar}
            onGoToUpload={() => setCurrentView('upload')}
          />
        )}
      </main>

      {/* Floating Pill Bottom Navigation Dock */}
      <FloatingDock currentView={currentView} onViewChange={setCurrentView} />

      {/* Fullscreen Inspector Modal */}
      <InspectorModal
        note={activeInspectorNote}
        onClose={() => setActiveInspectorNote(null)}
        onEdit={(note) => {
          setActiveInspectorNote(null);
          setEditingNote(note);
        }}
        onMove={(note) => {
          setActiveInspectorNote(null);
          setMovingNote(note);
        }}
        showToast={showToast}
      />

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onSaved={refreshData}
        onOpenNewFolderModal={(type, parentFolder) => setNewFolderConfig({ type, parentFolder })}
        showToast={showToast}
      />

      {/* Move Note Modal */}
      <MoveNoteModal
        note={movingNote}
        onClose={() => setMovingNote(null)}
        onMoved={refreshData}
        onOpenNewFolderModal={(type, parentFolder) => setNewFolderConfig({ type, parentFolder })}
        showToast={showToast}
      />

      {/* Move Folder / Topic Modal */}
      <MoveFolderModal
        isOpen={isMoveFolderOpen}
        onClose={() => setIsMoveFolderOpen(false)}
        onMoved={refreshData}
        showToast={showToast}
      />

      {/* Create New Folder / Topic Modal */}
      <NewFolderModal
        config={newFolderConfig}
        onClose={() => setNewFolderConfig(null)}
        onCreated={refreshData}
        showToast={showToast}
      />

      {/* Toast Notice */}
      <Toast toast={toast} />
    </>
  );
}
