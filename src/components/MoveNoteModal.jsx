import React, { useState, useEffect } from 'react';
import { FolderInput, ArrowRight, Check } from 'lucide-react';
import { db } from '../services/db.js';

export default function MoveNoteModal({
  note,
  onClose,
  onMoved,
  onOpenNewFolderModal,
  showToast
}) {
  if (!note) return null;

  const [folders, setFolders] = useState([]);
  const [targetFolder, setTargetFolder] = useState(note.folder || 'Percentages');
  const [targetTopic, setTargetTopic] = useState(note.topic || '');
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const regFolders = db.getRegisteredFolders();
    setFolders(regFolders);
    const curr = regFolders.find(f => f.folder.toLowerCase() === targetFolder.toLowerCase());
    const topList = curr?.topics || [];
    setTopics(topList);
    if (targetTopic && !topList.includes(targetTopic)) {
      setTargetTopic('');
    }
  }, [targetFolder]);

  const handleFolderChange = (newFolder) => {
    setTargetFolder(newFolder);
    const curr = folders.find(f => f.folder.toLowerCase() === newFolder.toLowerCase());
    const topList = curr?.topics || [];
    setTopics(topList);
    setTargetTopic('');
  };

  const handleMove = async (e) => {
    e.preventDefault();
    if (!targetFolder.trim()) return;

    await db.moveNote(note.id, targetFolder, targetTopic);
    showToast(
      targetTopic
        ? `📁 Moved "${note.title}" to ${targetFolder} → ${targetTopic}!`
        : `📁 Moved "${note.title}" to ${targetFolder}!`
    );
    onMoved();
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderInput style={{ color: 'var(--primary)', width: 22, height: 22 }} />
            <h3 style={{ fontSize: 18 }}>Move Note across Folders</h3>
          </div>
          <button type="button" className="btn-icon-subtle" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleMove}>
          <div className="modal-body" style={{ padding: '22px 24px' }}>
            {/* Note Info */}
            <div style={{
              background: 'var(--surface-muted)',
              padding: 14,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              marginBottom: 18
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Note to Move:
              </span>
              <h4 style={{ fontSize: 15, margin: '4px 0 6px', color: 'var(--text-primary)' }}>{note.title}</h4>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Current:</span>
                <strong>📁 {note.folder || 'General'}</strong>
                {note.topic ? (
                  <>
                    <span>/</span>
                    <span>🏷️ {note.topic}</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}> (Folder Root)</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0 16px', color: 'var(--primary-dark)' }}>
              <ArrowRight style={{ width: 20, height: 20 }} />
            </div>

            {/* Destination Selection */}
            <div className="form-group">
              <label className="form-label">Destination Folder / Section *</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  className="form-select"
                  value={targetFolder}
                  onChange={(e) => handleFolderChange(e.target.value)}
                  required
                >
                  {folders.map(f => (
                    <option key={f.folder} value={f.folder}>
                      📁 {f.folder}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon-subtle"
                  title="Create New Folder"
                  onClick={() => onOpenNewFolderModal('folder')}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Destination Topic / Sub-folder (Optional)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  className="form-select"
                  value={targetTopic}
                  onChange={(e) => setTargetTopic(e.target.value)}
                >
                  <option value="">📁 None (Root of folder)</option>
                  {topics.map(t => (
                    <option key={t} value={t}>
                      🏷️ {t}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon-subtle"
                  title="Create New Topic"
                  onClick={() => onOpenNewFolderModal('topic', targetFolder)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-duo-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-duo-primary">
              <Check style={{ width: 16, height: 16 }} />
              Confirm Move
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
