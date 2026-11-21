import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import MathView from '../MathView.jsx';

export default function NoteCard({
  note,
  onView,
  onEdit,
  onDelete,
  onToggleStar
}) {
  let badgeLabel = 'Note';
  let badgeClass = 'photo';

  if (note.type === 'photo') {
    badgeLabel = `📸 Photo (${note.images?.length || 1} pg)`;
    badgeClass = 'photo';
  } else if (note.type === 'technical') {
    badgeLabel = `💻 Tech (${note.language || 'Code'})`;
    badgeClass = 'tech';
  } else if (note.type === 'formula') {
    badgeLabel = note.mode === 'screenshot' ? '📐 Formula (Image)' : '📐 Formula (LaTeX)';
    badgeClass = 'formula';
  }

  const dateStr = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="note-card">
      <div className="note-card-header">
        <span className={`note-type-badge ${badgeClass}`}>{badgeLabel}</span>
        <button
          type="button"
          className={`note-star-btn ${note.starred ? 'starred' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(note.id);
          }}
          title="Star note"
        >
          ★
        </button>
      </div>

      <div className="note-folder-tag">
        📁 {note.folder || 'General'} &nbsp;/&nbsp; 🏷️ {note.topic || 'General Notes'}
      </div>

      <h4 className="note-card-title">{note.title}</h4>
      <div className="note-card-meta">
        <span>📅 {dateStr}</span>
      </div>

      {/* Preview Area */}
      <div className="card-preview-area">
        {note.type === 'photo' && note.images && note.images.length > 0 && (
          <img src={note.images[0]} className="card-img-preview" alt={note.title} />
        )}

        {note.type === 'technical' && (
          <div className="card-code-preview">
            {(note.content || '').substring(0, 160) + '...'}
          </div>
        )}

        {note.type === 'formula' && (
          note.mode === 'screenshot' && note.screenshotUrl ? (
            <img src={note.screenshotUrl} className="card-img-preview" alt={note.title} />
          ) : (
            <div className="card-formula-preview">
              <MathView latex={note.latexText || ''} displayMode={false} />
            </div>
          )
        )}
      </div>

      {/* Tags */}
      <div className="note-tags-row">
        {(note.tags || []).map(t => (
          <span key={t} className="note-tag">#{t}</span>
        ))}
      </div>

      {/* Card Footer Actions */}
      <div className="note-card-footer">
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn-duo-secondary"
            onClick={() => onView(note)}
          >
            View
          </button>
          <button
            type="button"
            className="btn-edit-note"
            onClick={() => onEdit(note)}
            title="Edit note in library"
          >
            <Pencil style={{ width: 14, height: 14 }} />
            Edit
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={() => onDelete(note.id)}
            title="Delete Note"
          >
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
