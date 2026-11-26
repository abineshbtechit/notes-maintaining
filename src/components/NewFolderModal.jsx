import React, { useState } from 'react';
import { db } from '../services/db.js';

export default function NewFolderModal({ config, onClose, onCreated, showToast }) {
  if (!config) return null;

  const { type, parentFolder } = config; // type: 'folder' | 'topic'
  const [name, setName] = useState('');
  const [initialTopic, setInitialTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    if (type === 'folder') {
      const initTopic = initialTopic.trim() || 'General Notes';
      db.registerFolder(cleanName, initTopic);
      showToast(`📁 Folder "${cleanName}" created!`);
      onCreated(cleanName, initTopic);
    } else {
      db.registerFolder(parentFolder, cleanName);
      showToast(`🏷️ Topic "${cleanName}" created in ${parentFolder}!`);
      onCreated(parentFolder, cleanName);
    }

    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 18 }}>
            {type === 'folder' ? 'Create New Folder / Subject' : `New Topic in "${parentFolder}"`}
          </h3>
          <button type="button" className="btn-icon-subtle" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: 20 }}>
            <div className="form-group">
              <label className="form-label">
                {type === 'folder' ? 'Folder Name *' : 'Topic Name *'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={type === 'folder' ? 'e.g. Percentages, Calculus' : 'e.g. Profit & Loss'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            {type === 'folder' && (
              <div className="form-group">
                <label className="form-label">Initial Topic (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Profit & Loss"
                  value={initialTopic}
                  onChange={(e) => setInitialTopic(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-duo-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-duo-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
