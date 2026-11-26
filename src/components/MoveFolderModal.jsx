import React, { useState, useEffect } from 'react';
import { FolderSync, ArrowRight, Check, X, Layers, Tag } from 'lucide-react';
import { db } from '../services/db.js';

export default function MoveFolderModal({
  isOpen,
  onClose,
  onMoved,
  showToast
}) {
  if (!isOpen) return null;

  const [tabMode, setTabMode] = useState('folder'); // 'folder' | 'topic'
  const [folders, setFolders] = useState([]);
  
  // Folder Move State
  const [sourceFolder, setSourceFolder] = useState('');
  const [targetFolder, setTargetFolder] = useState('');

  // Topic Move State
  const [topicSourceFolder, setTopicSourceFolder] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicTargetFolder, setTopicTargetFolder] = useState('');
  const [availableTopics, setAvailableTopics] = useState([]);

  useEffect(() => {
    const regFolders = db.getRegisteredFolders();
    setFolders(regFolders);

    if (regFolders.length >= 2) {
      setSourceFolder(regFolders[0].folder);
      setTargetFolder(regFolders[1].folder);

      setTopicSourceFolder(regFolders[0].folder);
      setTopicTargetFolder(regFolders[1].folder);
      setAvailableTopics(regFolders[0].topics || ['General Notes']);
      setSelectedTopic(regFolders[0].topics?.[0] || 'General Notes');
    } else if (regFolders.length === 1) {
      setSourceFolder(regFolders[0].folder);
      setTopicSourceFolder(regFolders[0].folder);
      setAvailableTopics(regFolders[0].topics || ['General Notes']);
      setSelectedTopic(regFolders[0].topics?.[0] || 'General Notes');
    }
  }, [isOpen]);

  const handleTopicSourceFolderChange = (fName) => {
    setTopicSourceFolder(fName);
    const matched = folders.find(f => f.folder.toLowerCase() === fName.toLowerCase());
    const topList = matched?.topics || ['General Notes'];
    setAvailableTopics(topList);
    setSelectedTopic(topList[0] || 'General Notes');
  };

  const handleMoveFolderSubmit = async (e) => {
    e.preventDefault();
    if (!sourceFolder || !targetFolder || sourceFolder === targetFolder) {
      showToast('⚠️ Please select two different folders', 'warning');
      return;
    }

    await db.moveFolder(sourceFolder, targetFolder);
    showToast(`📁 Successfully merged "${sourceFolder}" into "${targetFolder}"!`);
    onMoved();
    onClose();
  };

  const handleMoveTopicSubmit = async (e) => {
    e.preventDefault();
    if (!topicSourceFolder || !selectedTopic || !topicTargetFolder || topicSourceFolder === topicTargetFolder) {
      showToast('⚠️ Please select a valid topic and a different target folder', 'warning');
      return;
    }

    await db.moveTopic(topicSourceFolder, selectedTopic, topicTargetFolder);
    showToast(`🏷️ Topic "${selectedTopic}" moved from ${topicSourceFolder} to ${topicTargetFolder}!`);
    onMoved();
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderSync style={{ color: 'var(--primary)', width: 22, height: 22 }} />
            <h3 style={{ fontSize: 18 }}>Move & Transfer Across Folders</h3>
          </div>
          <button type="button" className="btn-icon-subtle" onClick={onClose} title="Close">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn-duo-secondary ${tabMode === 'folder' ? 'active' : ''}`}
            style={{
              flex: 1,
              borderColor: tabMode === 'folder' ? 'var(--primary)' : 'var(--border)',
              background: tabMode === 'folder' ? 'var(--primary-soft)' : '#FFF'
            }}
            onClick={() => setTabMode('folder')}
          >
            <Layers style={{ width: 16, height: 16 }} />
            Move Entire Folder
          </button>
          <button
            type="button"
            className={`btn-duo-secondary ${tabMode === 'topic' ? 'active' : ''}`}
            style={{
              flex: 1,
              borderColor: tabMode === 'topic' ? 'var(--primary)' : 'var(--border)',
              background: tabMode === 'topic' ? 'var(--primary-soft)' : '#FFF'
            }}
            onClick={() => setTabMode('topic')}
          >
            <Tag style={{ width: 16, height: 16 }} />
            Move Specific Topic
          </button>
        </div>

        {/* Mode 1: Move Entire Folder */}
        {tabMode === 'folder' && (
          <form onSubmit={handleMoveFolderSubmit}>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Transfer all notes and topics from one folder into another. The source folder will be merged into the target.
              </p>

              <div className="form-group">
                <label className="form-label">Source Folder (Folder to Move) *</label>
                <select
                  className="form-select"
                  value={sourceFolder}
                  onChange={(e) => setSourceFolder(e.target.value)}
                  required
                >
                  {folders.map(f => (
                    <option key={f.folder} value={f.folder}>
                      📁 {f.folder}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0 12px', color: 'var(--primary-dark)' }}>
                <ArrowRight style={{ width: 20, height: 20 }} />
              </div>

              <div className="form-group">
                <label className="form-label">Destination Folder *</label>
                <select
                  className="form-select"
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                  required
                >
                  {folders.filter(f => f.folder !== sourceFolder).map(f => (
                    <option key={f.folder} value={f.folder}>
                      📁 {f.folder}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                background: 'var(--surface-muted)',
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}>
                ℹ️ All notes inside <strong>📁 {sourceFolder}</strong> will now be organized under <strong>📁 {targetFolder}</strong>, and existing topics will be merged.
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-duo-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-duo-primary">
                <Check style={{ width: 16, height: 16 }} />
                Move / Merge Folder
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Move Specific Topic */}
        {tabMode === 'topic' && (
          <form onSubmit={handleMoveTopicSubmit}>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Move a single topic along with all its contained notes into a different folder.
              </p>

              <div className="form-group">
                <label className="form-label">From Folder *</label>
                <select
                  className="form-select"
                  value={topicSourceFolder}
                  onChange={(e) => handleTopicSourceFolderChange(e.target.value)}
                  required
                >
                  {folders.map(f => (
                    <option key={f.folder} value={f.folder}>
                      📁 {f.folder}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Topic to Move *</label>
                <select
                  className="form-select"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  required
                >
                  {availableTopics.map(t => (
                    <option key={t} value={t}>
                      🏷️ {t}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0 12px', color: 'var(--primary-dark)' }}>
                <ArrowRight style={{ width: 20, height: 20 }} />
              </div>

              <div className="form-group">
                <label className="form-label">Move To Destination Folder *</label>
                <select
                  className="form-select"
                  value={topicTargetFolder}
                  onChange={(e) => setTopicTargetFolder(e.target.value)}
                  required
                >
                  {folders.filter(f => f.folder !== topicSourceFolder).map(f => (
                    <option key={f.folder} value={f.folder}>
                      📁 {f.folder}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                background: 'var(--surface-muted)',
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}>
                ℹ️ All notes categorized under <strong>🏷️ {selectedTopic}</strong> will be transferred into <strong>📁 {topicTargetFolder}</strong>.
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-duo-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-duo-primary">
                <Check style={{ width: 16, height: 16 }} />
                Move Topic
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
