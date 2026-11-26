import React, { useState } from 'react';
import { Download, Pencil, FolderInput, Eye, Code } from 'lucide-react';
import MathView from './MathView.jsx';
import MarkdownViewer from './MarkdownViewer.jsx';

export default function InspectorModal({ note, onClose, onEdit, onMove, showToast }) {
  if (!note) return null;

  const [techViewMode, setTechViewMode] = useState('formatted'); // 'formatted' | 'raw'

  const handleCopy = () => {
    const textToCopy = note.type === 'technical' ? note.content : (note.latexText || '');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      showToast('📋 Copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(note, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_note.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Note exported as JSON!');
  };

  const badgeClass = note.type === 'photo' ? 'photo' : note.type === 'technical' ? 'tech' : 'formula';

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className={`note-type-badge ${badgeClass}`}>{note.type.toUpperCase()}</span>
            <h3 style={{ fontSize: 20, marginTop: 6 }}>{note.title}</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              📁 {note.folder || 'General'}
              {note.topic ? ` • 🏷️ ${note.topic}` : ''} • {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button type="button" className="btn-icon-subtle" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {note.type === 'photo' && (
            <div>
              {(note.images || []).map((imgSrc, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    PAGE {i + 1}
                  </div>
                  <img src={imgSrc} className="modal-img-viewer" alt={`Notes Page ${i + 1}`} />
                </div>
              ))}
              {note.notesText && (
                <div style={{ background: 'var(--surface-muted)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginTop: 12 }}>
                  <h4 style={{ marginBottom: 6, fontSize: 14 }}>Notes & Remarks:</h4>
                  <p>{note.notesText}</p>
                </div>
              )}
            </div>
          )}

          {note.type === 'technical' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Format: {note.language || 'Markdown'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn-duo-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      background: techViewMode === 'formatted' ? 'var(--primary-light)' : undefined,
                      borderColor: techViewMode === 'formatted' ? 'var(--primary)' : undefined,
                      fontWeight: techViewMode === 'formatted' ? 700 : 500
                    }}
                    onClick={() => setTechViewMode('formatted')}
                  >
                    <Eye style={{ width: 13, height: 13 }} />
                    Formatted Output
                  </button>
                  <button
                    type="button"
                    className="btn-duo-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      background: techViewMode === 'raw' ? 'var(--primary-light)' : undefined,
                      borderColor: techViewMode === 'raw' ? 'var(--primary)' : undefined,
                      fontWeight: techViewMode === 'raw' ? 700 : 500
                    }}
                    onClick={() => setTechViewMode('raw')}
                  >
                    <Code style={{ width: 13, height: 13 }} />
                    Raw Code
                  </button>
                </div>
              </div>

              {techViewMode === 'formatted' ? (
                <div style={{
                  background: 'var(--surface-container)',
                  padding: '22px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  maxHeight: 520,
                  overflowY: 'auto'
                }}>
                  <MarkdownViewer content={note.content} />
                </div>
              ) : (
                <div className="modal-code-viewer">{note.content}</div>
              )}
              {note.diagramUrl && (
                <div style={{ marginTop: 18 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Attached Whiteboard / Diagram Snapshot
                  </h4>
                  <img src={note.diagramUrl} className="modal-img-viewer" alt="Attached Whiteboard or Diagram" />
                </div>
              )}
              {note.summary && (
                <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                  <strong style={{ fontSize: 13, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                    Key Takeaways:
                  </strong>
                  <p style={{ fontSize: 14 }}>{note.summary}</p>
                </div>
              )}
            </div>
          )}

          {note.type === 'formula' && (
            <div>
              {note.mode === 'screenshot' && note.screenshotUrl ? (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img src={note.screenshotUrl} className="modal-img-viewer" style={{ maxHeight: 380 }} alt="Formula Screenshot" />
                </div>
              ) : (
                <>
                  <div className="modal-math-viewer">
                    <MathView latex={note.latexText || ''} displayMode={true} />
                  </div>
                  <div style={{ background: 'var(--surface-muted)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>
                    <strong>LaTeX:</strong> {note.latexText}
                  </div>
                </>
              )}

              {note.breakdown && (
                <div style={{ padding: 16, background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ marginBottom: 6, fontSize: 14 }}>Variable Legend & Conceptual Breakdown:</h4>
                  <p style={{ fontSize: 14 }}>{note.breakdown}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-duo-secondary"
              onClick={() => {
                onClose();
                if (onMove) onMove(note);
              }}
              title="Move to another folder or topic"
            >
              <FolderInput style={{ width: 15, height: 15 }} />
              Move Note
            </button>
            <button
              type="button"
              className="btn-duo-secondary"
              onClick={() => {
                onClose();
                onEdit(note);
              }}
            >
              <Pencil style={{ width: 15, height: 15 }} />
              Edit Note
            </button>
            {note.type !== 'photo' && (
              <button type="button" className="btn-duo-secondary" onClick={handleCopy}>
                {note.type === 'technical' ? 'Copy Code / Text' : 'Copy LaTeX Code'}
              </button>
            )}
          </div>
          <button type="button" className="btn-duo-primary" onClick={handleDownload}>
            <Download style={{ width: 16, height: 16 }} />
            Export Note
          </button>
        </div>
      </div>
    </div>
  );
}
