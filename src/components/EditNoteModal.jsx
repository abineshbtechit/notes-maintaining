import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import MathView from './MathView.jsx';
import { db } from '../services/db.js';

export default function EditNoteModal({
  note,
  onClose,
  onSaved,
  onOpenNewFolderModal,
  showToast
}) {
  if (!note) return null;

  const [title, setTitle] = useState(note.title || '');
  const [folder, setFolder] = useState(note.folder || 'General');
  const [topic, setTopic] = useState(note.topic || '');
  const [tags, setTags] = useState((note.tags || []).join(', '));
  
  // Type specific
  const [notesText, setNotesText] = useState(note.notesText || '');
  const [techContent, setTechContent] = useState(note.content || '');
  const [techSummary, setTechSummary] = useState(note.summary || '');
  const [latexText, setLatexText] = useState(note.latexText || '');
  const [breakdown, setBreakdown] = useState(note.breakdown || '');

  // Folders list
  const [folders, setFolders] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const regFolders = db.getRegisteredFolders();
    setFolders(regFolders);
    const currFolder = regFolders.find(f => f.folder.toLowerCase() === folder.toLowerCase());
    setTopics(currFolder?.topics || []);
  }, [folder]);

  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    const currFolder = folders.find(f => f.folder.toLowerCase() === newFolder.toLowerCase());
    const newTopics = currFolder?.topics || [];
    setTopics(newTopics);
    setTopic('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedNote = {
      ...note,
      title: title.trim(),
      folder: folder.trim() || 'General',
      topic: topic ? topic.trim() : '',
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      updatedAt: new Date().toISOString()
    };

    if (note.type === 'photo') {
      updatedNote.notesText = notesText.trim();
    } else if (note.type === 'technical') {
      updatedNote.content = techContent.trim();
      updatedNote.summary = techSummary.trim();
    } else if (note.type === 'formula') {
      if (note.mode === 'latex' || latexText) {
        updatedNote.latexText = latexText.trim();
      }
      updatedNote.breakdown = breakdown.trim();
    }

    await db.saveNote(updatedNote);
    showToast(`✏️ Note "${updatedNote.title}" updated successfully!`);
    onSaved(updatedNote);
    onClose();
  };

  const badgeClass = note.type === 'photo' ? 'photo' : note.type === 'technical' ? 'tech' : 'formula';

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className={`note-type-badge ${badgeClass}`}>EDIT NOTE</span>
            <h3 style={{ fontSize: 20, marginTop: 6 }}>Edit Note Details</h3>
          </div>
          <button type="button" className="btn-icon-subtle" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '24px 28px' }}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Folder / Section *</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select
                    className="form-select"
                    value={folder}
                    onChange={(e) => handleFolderChange(e.target.value)}
                    required
                  >
                    {folders.map(f => (
                      <option key={f.folder} value={f.folder}>
                        {f.folder}
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
                <label className="form-label">Topic / Sub-folder (Optional)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select
                    className="form-select"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="">📁 None (No subfolder)</option>
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
                    onClick={() => onOpenNewFolderModal('topic', folder)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic Type-specific fields */}
              {note.type === 'photo' && (
                <div className="form-group full-width">
                  <label className="form-label">Lecture Remarks / Key Notes</label>
                  <textarea
                    className="form-textarea"
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                  />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                    📸 Note contains {note.images ? note.images.length : 0} uploaded image page(s).
                  </div>
                </div>
              )}

              {note.type === 'technical' && (
                <>
                  <div className="form-group full-width">
                    <label className="form-label">Technical Content (Markdown & Code) *</label>
                    <textarea
                      className="form-textarea code-font"
                      style={{ minHeight: 200 }}
                      value={techContent}
                      onChange={(e) => setTechContent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Key Takeaways / Abstract</label>
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: 80 }}
                      value={techSummary}
                      onChange={(e) => setTechSummary(e.target.value)}
                    />
                  </div>
                </>
              )}

              {note.type === 'formula' && (
                <>
                  {(note.mode === 'latex' || latexText) && (
                    <div className="form-group full-width">
                      <label className="form-label">LaTeX Equation Code *</label>
                      <textarea
                        className="form-textarea code-font"
                        value={latexText}
                        onChange={(e) => setLatexText(e.target.value)}
                        required
                      />
                      <div style={{ marginTop: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Equation Live Preview:
                        </span>
                        <div className="math-rendered-preview-box">
                          <MathView latex={latexText} displayMode={true} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label className="form-label">Variable Legend & Conceptual Breakdown</label>
                    <textarea
                      className="form-textarea"
                      value={breakdown}
                      onChange={(e) => setBreakdown(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="form-group full-width">
                <label className="form-label">Tags (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-duo-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-duo-primary">
              <Check style={{ width: 16, height: 16 }} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
