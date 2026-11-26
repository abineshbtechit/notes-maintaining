import React, { useState, useRef } from 'react';
import { UploadCloud, Check, Image as ImageIcon, Camera } from 'lucide-react';
import CameraModal from '../CameraModal.jsx';
import { db } from '../../services/db.js';

export default function PhotoUploadForm({
  folders,
  onOpenNewFolderModal,
  onNoteSaved,
  showToast
}) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(folders[0]?.folder || 'Percentages');
  const [topic, setTopic] = useState('');
  const [qualityFilter, setQualityFilter] = useState('standard');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [notesText, setNotesText] = useState('');
  const [tags, setTags] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  const currFolderObj = folders.find(f => f.folder.toLowerCase() === folder.toLowerCase());
  const topics = currFolderObj?.topics || [];

  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    setTopic('');
  };

  const handleFiles = (files) => {
    const imgFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    imgFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhotos(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (dataUrl) => {
    setUploadedPhotos(prev => [...prev, dataUrl]);
    showToast(`📸 Captured Page ${uploadedPhotos.length + 1} added!`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRemovePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('⚠️ Please enter a title for your handwritten notes', 'warning');
      return;
    }
    if (uploadedPhotos.length === 0) {
      showToast('📸 Please upload or snap at least one photo of your notes', 'warning');
      return;
    }

    const newNote = {
      id: 'photo-' + Date.now(),
      type: 'photo',
      title: title.trim(),
      folder: folder || 'General',
      topic: topic ? topic.trim() : '',
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      images: [...uploadedPhotos],
      notesText: notesText.trim(),
      qualityFilter,
      starred: false,
      createdAt: new Date().toISOString()
    };

    await db.saveNote(newNote);
    showToast(
      topic
        ? `✨ Photo Notes Saved in ${folder} → ${topic}! (+15 XP)`
        : `✨ Photo Notes Saved in ${folder}! (+15 XP)`
    );

    setTitle('');
    setUploadedPhotos([]);
    setNotesText('');
    setTags('');
    onNoteSaved();
  };

  return (
    <div className="section-flow">
      <div className="form-header-bar">
        <h3>
          <ImageIcon style={{ color: 'var(--primary)' }} />
          Section 1: Upload Handwritten Notes (Photo)
        </h3>
        <button
          type="button"
          className="btn-duo-secondary"
          style={{ padding: '7px 14px', fontSize: 13 }}
          onClick={() => setIsCameraOpen(true)}
        >
          <Camera style={{ width: 16, height: 16, color: 'var(--primary-dark)' }} />
          Snap with Camera
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Note Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Profit & Loss Shortcut Rules"
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
                  <option key={f.folder} value={f.folder}>{f.folder}</option>
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
                <option value="">📁 None (No subfolder — save in folder root)</option>
                {topics.map(t => (
                  <option key={t} value={t}>🏷️ {t}</option>
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

          <div className="form-group full-width">
            <label className="form-label">Capture or Select Note Photos *</label>
            <div
              className="dropzone-box"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="dropzone-icon" />
              <div className="dropzone-prompt">Drag and drop photos here, or click to browse</div>
              <div className="dropzone-subtext">Supports camera photos, document scans, and multi-page notebooks</div>
              
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="btn-duo-primary"
                  style={{ fontSize: 13, padding: '9px 18px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCameraOpen(true);
                  }}
                >
                  <Camera style={{ width: 17, height: 17 }} />
                  Take Photo via Camera
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="file-hidden-input"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Image Filter:
              </span>
              <div className="filter-pill-group">
                <button
                  type="button"
                  className={`filter-pill ${qualityFilter === 'standard' ? 'active' : ''}`}
                  onClick={() => setQualityFilter('standard')}
                >
                  Original Color
                </button>
                <button
                  type="button"
                  className={`filter-pill ${qualityFilter === 'contrast' ? 'active' : ''}`}
                  onClick={() => setQualityFilter('contrast')}
                >
                  High Contrast (Pencil & Ink)
                </button>
              </div>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="preview-gallery">
                {uploadedPhotos.map((dataUrl, idx) => (
                  <div
                    key={idx}
                    className={`preview-thumb-card ${qualityFilter === 'contrast' ? 'enhanced' : ''}`}
                  >
                    <img src={dataUrl} alt={`Page ${idx + 1}`} />
                    <button
                      type="button"
                      className="preview-thumb-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(idx);
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Lecture Remarks / Key Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add any supplementary notes, questions, or context from the lecture..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Tags (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="percentages, profit-loss, quantitative, formulas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          <button
            type="button"
            className="btn-duo-secondary"
            onClick={() => {
              setTitle('');
              setUploadedPhotos([]);
              setNotesText('');
              setTags('');
            }}
          >
            Reset
          </button>
          <button type="submit" className="btn-duo-primary">
            <Check style={{ width: 18, height: 18 }} />
            Save Photo Notes ({uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'page' : 'pages'})
          </button>
        </div>
      </form>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Scan Handwritten Notes Page"
      />
    </div>
  );
}
