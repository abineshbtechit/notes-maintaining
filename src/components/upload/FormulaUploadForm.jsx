import React, { useState, useRef } from 'react';
import { FunctionSquare, Code, Image as ImageIcon, Crop, Check, Camera } from 'lucide-react';
import MathView from '../MathView.jsx';
import CameraModal from '../CameraModal.jsx';
import { db } from '../../services/db.js';

export default function FormulaUploadForm({
  folders,
  onOpenNewFolderModal,
  onNoteSaved,
  showToast
}) {
  const [formulaMode, setFormulaMode] = useState('latex'); // 'latex' | 'screenshot'
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(folders[0]?.folder || 'Percentages');
  const [topic, setTopic] = useState('');
  const [latexText, setLatexText] = useState('\\text{Net \\% Change} = a + b + \\frac{a \\cdot b}{100}');
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [breakdown, setBreakdown] = useState('');
  const [tags, setTags] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  const currFolderObj = folders.find(f => f.folder.toLowerCase() === folder.toLowerCase());
  const topics = currFolderObj?.topics || [];

  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    setTopic('');
  };

  const insertSnippet = (snippet) => {
    setLatexText(prev => prev + ' ' + snippet);
  };

  const handleScreenshotFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotUrl(e.target.result);
      setFormulaMode('screenshot');
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl) => {
    setScreenshotUrl(dataUrl);
    setFormulaMode('screenshot');
    showToast('📐 Formula photo captured from camera!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('⚠️ Please provide a formula name or theorem title', 'warning');
      return;
    }

    if (formulaMode === 'latex' && !latexText.trim()) {
      showToast('📐 Please enter LaTeX notation or switch to Screenshot mode', 'warning');
      return;
    }

    if (formulaMode === 'screenshot' && !screenshotUrl) {
      showToast('📸 Please upload or snap a formula screenshot or diagram', 'warning');
      return;
    }

    const newNote = {
      id: 'formula-' + Date.now(),
      type: 'formula',
      title: title.trim(),
      folder: folder || 'General',
      topic: topic ? topic.trim() : '',
      mode: formulaMode,
      latexText: formulaMode === 'latex' ? latexText.trim() : '',
      screenshotUrl: formulaMode === 'screenshot' ? screenshotUrl : null,
      breakdown: breakdown.trim(),
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      starred: false,
      createdAt: new Date().toISOString()
    };

    await db.saveNote(newNote);
    showToast(
      topic
        ? `📐 Formula Saved in ${folder} → ${topic}! (+25 XP)`
        : `📐 Formula Saved in ${folder}! (+25 XP)`
    );

    setTitle('');
    setScreenshotUrl(null);
    setBreakdown('');
    setTags('');
    onNoteSaved();
  };

  return (
    <div className="section-flow">
      <div className="form-header-bar">
        <h3>
          <FunctionSquare style={{ color: 'var(--primary)' }} />
          Section 3: Upload Formulae (Screenshot or Text)
        </h3>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="formula-mode-switch" style={{ margin: 0 }}>
            <button
              type="button"
              className={`formula-mode-btn ${formulaMode === 'latex' ? 'active' : ''}`}
              onClick={() => setFormulaMode('latex')}
            >
              <Code style={{ width: 15, height: 15 }} />
              LaTeX Math
            </button>
            <button
              type="button"
              className={`formula-mode-btn ${formulaMode === 'screenshot' ? 'active' : ''}`}
              onClick={() => setFormulaMode('screenshot')}
            >
              <ImageIcon style={{ width: 15, height: 15 }} />
              Photo / Diagram
            </button>
          </div>

          <button
            type="button"
            className="btn-duo-secondary"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setIsCameraOpen(true)}
            title="Snap equation on blackboard or textbook"
          >
            <Camera style={{ width: 15, height: 15, color: 'var(--primary-dark)' }} />
            Snap with Camera
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Formula / Theorem Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Successive Percentage Change Formula"
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

          {formulaMode === 'latex' ? (
            <div className="form-group full-width">
              <label className="form-label">LaTeX Equation Code</label>
              <div className="math-quick-symbols">
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>
                  QUICK CHIPS:
                </span>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\text{Net \\% Change} = a + b + \\frac{a \\cdot b}{100}')}>% Change</button>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\frac{a}{b}')}>Fraction \frac</button>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\int_{-\\infty}^{\\infty}')}>Integral \int</button>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\sum_{i=1}^{n}')}>Sum \sum</button>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\sqrt{x}')}>Root \sqrt</button>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\partial')}>Partial \partial</button>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\nabla')}>Nabla \nabla</button>
                <button type="button" className="symbol-chip" onClick={() => insertSnippet('\\alpha, \\beta, \\theta')}>Greek \alpha\beta</button>
              </div>

              <textarea
                className="form-textarea code-font"
                placeholder="\text{Net \% Change} = a + b + \frac{a \cdot b}{100}"
                value={latexText}
                onChange={(e) => setLatexText(e.target.value)}
              />

              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Live Mathematical Render:
                </span>
                <div className="math-rendered-preview-box">
                  <MathView latex={latexText} displayMode={true} />
                </div>
              </div>
            </div>
          ) : (
            <div className="form-group full-width">
              <label className="form-label">Upload or Snap Formula Photo / Diagram</label>
              <div
                className="dropzone-box"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files[0]) handleScreenshotFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Crop className="dropzone-icon" />
                <div className="dropzone-prompt">Drag and drop formula photo here, or click to browse</div>
                <div className="dropzone-subtext">Drop crops from textbooks, papers, or blackboard photos</div>
                
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
                    Snap Formula with Camera
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-hidden-input"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) handleScreenshotFile(e.target.files[0]);
                  }}
                />
              </div>

              {screenshotUrl && (
                <div style={{ position: 'relative', maxWidth: 480, margin: '14px auto' }}>
                  <img
                    src={screenshotUrl}
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    alt="Formula Screenshot"
                  />
                  <button
                    type="button"
                    className="preview-thumb-remove"
                    style={{ top: 8, right: 8, width: 28, height: 28 }}
                    onClick={() => setScreenshotUrl(null)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="form-group full-width">
            <label className="form-label">Variable Legend & Conceptual Breakdown (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Explain the variables (e.g. a: first % change, b: second % change) or conditions of validity..."
              value={breakdown}
              onChange={(e) => setBreakdown(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Tags (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="percentages, formulas, shortcuts, quantitative"
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
              setScreenshotUrl(null);
              setBreakdown('');
              setTags('');
            }}
          >
            Reset
          </button>
          <button type="submit" className="btn-duo-primary">
            <Check style={{ width: 18, height: 18 }} />
            Save Formula & Cheatsheet
          </button>
        </div>
      </form>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Capture Formula / Blackboard Equation"
      />
    </div>
  );
}
