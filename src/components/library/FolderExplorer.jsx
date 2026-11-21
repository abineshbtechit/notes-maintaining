import React from 'react';
import { Folders, FolderSync } from 'lucide-react';

export default function FolderExplorer({
  notes,
  registeredFolders,
  selectedFolder,
  selectedTopic,
  onSelectFolder,
  onSelectTopic,
  onOpenMoveFolderModal
}) {
  // Compute counts
  const folderCounts = {};
  const topicCounts = {};

  notes.forEach(n => {
    const f = n.folder || 'General';
    const t = n.topic || 'General Notes';
    folderCounts[f] = (folderCounts[f] || 0) + 1;

    if (!topicCounts[f]) topicCounts[f] = {};
    topicCounts[f][t] = (topicCounts[f][t] || 0) + 1;
  });

  registeredFolders.forEach(r => {
    if (folderCounts[r.folder] === undefined) folderCounts[r.folder] = 0;
    if (!topicCounts[r.folder]) topicCounts[r.folder] = {};
    (r.topics || []).forEach(top => {
      if (topicCounts[r.folder][top] === undefined) topicCounts[r.folder][top] = 0;
    });
  });

  const sortedFolders = Object.keys(folderCounts).sort();

  return (
    <div className="folder-explorer-card">
      {/* Breadcrumbs Bar with Action Button */}
      <div className="breadcrumbs-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <span
            className={`breadcrumb-item ${selectedFolder === 'all' ? 'active' : ''}`}
            onClick={() => {
              onSelectFolder('all');
              onSelectTopic('all');
            }}
          >
            <Folders style={{ width: 15, height: 15 }} /> All Folders
          </span>

          {selectedFolder !== 'all' && (
            <>
              <span className="breadcrumb-separator">&gt;</span>
              <span
                className={`breadcrumb-item ${selectedTopic === 'all' ? 'active' : ''}`}
                onClick={() => onSelectTopic('all')}
              >
                📁 {selectedFolder}
              </span>
            </>
          )}

          {selectedFolder !== 'all' && selectedTopic !== 'all' && (
            <>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item active">
                🏷️ {selectedTopic}
              </span>
            </>
          )}
        </div>

        {/* Move / Merge Folders Action Trigger */}
        <button
          type="button"
          className="btn-duo-secondary"
          style={{ padding: '4px 10px', fontSize: 11, flexShrink: 0, textTransform: 'none' }}
          onClick={onOpenMoveFolderModal}
          title="Move or merge entire folders and topics"
        >
          <FolderSync style={{ width: 13, height: 13, color: 'var(--primary-dark)' }} />
          Move Folders / Topics
        </button>
      </div>

      {/* Folder Chips Row */}
      <div className="folder-chips-row">
        <button
          type="button"
          className={`folder-pill ${selectedFolder === 'all' ? 'active' : ''}`}
          onClick={() => {
            onSelectFolder('all');
            onSelectTopic('all');
          }}
        >
          All Folders <span className="pill-count">{notes.length}</span>
        </button>

        {sortedFolders.map(fName => (
          <button
            key={fName}
            type="button"
            className={`folder-pill ${selectedFolder === fName ? 'active' : ''}`}
            onClick={() => {
              onSelectFolder(fName);
              onSelectTopic('all');
            }}
          >
            📁 {fName} <span className="pill-count">{folderCounts[fName]}</span>
          </button>
        ))}
      </div>

      {/* Topics Sub-bar when a folder is selected */}
      {selectedFolder !== 'all' && (
        <div className="topic-subbar">
          <span className="topic-subbar-label">Topics:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              className={`topic-pill ${selectedTopic === 'all' ? 'active' : ''}`}
              onClick={() => onSelectTopic('all')}
            >
              All Topics
            </button>
            {Object.keys(topicCounts[selectedFolder] || {}).map(tName => (
              <button
                key={tName}
                type="button"
                className={`topic-pill ${selectedTopic === tName ? 'active' : ''}`}
                onClick={() => onSelectTopic(tName)}
              >
                🏷️ {tName} <span style={{ fontSize: 10, opacity: 0.7 }}>({topicCounts[selectedFolder][tName]})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
