import React, { useState, useRef } from 'react';
import { Terminal, Check, Camera, Image as ImageIcon, Trash2, Upload, FileText, Eye } from 'lucide-react';
import CameraModal from '../CameraModal.jsx';
import MarkdownViewer from '../MarkdownViewer.jsx';
import { db } from '../../services/db.js';

export default function TechnicalUploadForm({
  folders,
  onOpenNewFolderModal,
  onNoteSaved,
  showToast
}) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(folders[0]?.folder || 'Computer Science');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('markdown');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [diagramImage, setDiagramImage] = useState(null);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const mdFileInputRef = useRef(null);

  const currFolderObj = folders.find(f => f.folder.toLowerCase() === folder.toLowerCase());
  const topics = currFolderObj?.topics || [];

  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    setTopic('');
  };

  const insertSnippet = (snippet) => {
    setContent(prev => prev + snippet);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setContent(text);

      // Auto-extract title from first # header or filename
      if (!title.trim()) {
        const match = text.match(/^#\s+(.+)$/m);
        if (match && match[1]) {
          setTitle(match[1].trim());
        } else {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }

      setLanguage('markdown');
      setShowLivePreview(true);
      showToast(`📄 Loaded "${file.name}"! Formatted markdown output is ready.`);
    };
    reader.readAsText(file);
  };

  const handleCameraCapture = (dataUrl) => {
    setDiagramImage(dataUrl);
    showToast('📷 Architecture diagram / whiteboard snapped!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('⚠️ Title and technical content cannot be empty', 'warning');
      return;
    }

    const newNote = {
      id: 'tech-' + Date.now(),
      type: 'technical',
      title: title.trim(),
      folder: folder || 'General',
      topic: topic ? topic.trim() : '',
      language,
      content: content.trim(),
      summary: summary.trim(),
      diagramUrl: diagramImage || null,
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      starred: false,
      createdAt: new Date().toISOString()
    };

    await db.saveNote(newNote);
    showToast(
      topic
        ? `🚀 Technical Document Saved in ${folder} → ${topic}! (+20 XP)`
        : `🚀 Technical Document Saved in ${folder}! (+20 XP)`
    );

    setTitle('');
    setContent('');
    setSummary('');
    setDiagramImage(null);
    setTags('');
    setShowLivePreview(false);
    onNoteSaved();
  };

  return (
    <div className="section-flow">
      <div className="form-header-bar">
        <h3>
          <Terminal style={{ color: 'var(--primary)' }} />
          Section 2: Upload Technical Content (Text Manner)
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-duo-secondary"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setIsCameraOpen(true)}
            title="Take a photo of whiteboard architecture diagram or code on screen"
          >
            <Camera style={{ width: 14, height: 14, color: 'var(--primary-dark)' }} />
            Snap Whiteboard / Diagram
          </button>
          <button
            type="button"
            className="btn-duo-secondary"
            style={{ padding: '6px 14px', fontSize: 12 }}
            onClick={() => setShowLivePreview(!showLivePreview)}
          >
            {showLivePreview ? 'Hide Preview' : 'Live Preview'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Document Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Cache Invalidation Strategies"
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

          <div className="form-group">
            <label className="form-label">Language / Format</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="markdown">Markdown (.md)</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript / TypeScript</option>
              <option value="sql">SQL / Database</option>
              <option value="cpp">C / C++</option>
              <option value="rust">Rust</option>
              <option value="plaintext">Plain Text</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="system-design, redis, performance"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            {/* File Upload / Dropzone Banner */}
            <div
              className="file-import-banner"
              onClick={() => mdFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              title="Click or drag & drop to import any .md or .txt file"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText style={{ color: 'var(--primary)', width: 22, height: 22, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Upload or Drop Markdown File (.md, .markdown, .txt)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Automatically loads content, sets title, and formats rich output view
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-duo-secondary"
                style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  mdFileInputRef.current?.click();
                }}
              >
                <Upload style={{ width: 14, height: 14 }} />
                Choose File
              </button>
              <input
                type="file"
                ref={mdFileInputRef}
                accept=".md,.markdown,.txt"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </div>

            <label className="form-label">Technical Content (Markdown & Code) *</label>
            <div className="editor-wrapper">
              <div className="editor-toolbar">
                <button
                  type="button"
                  className="tool-btn"
                  style={{ color: 'var(--primary-dark)', fontWeight: 700 }}
                  onClick={() => mdFileInputRef.current?.click()}
                  title="Upload .md / .txt file from your computer"
                >
                  <Upload style={{ width: 13, height: 13, marginRight: 4 }} />
                  Upload .md
                </button>
                <button type="button" className="tool-btn" onClick={() => insertSnippet('**bold**')}>
                  <b>B</b>
                </button>
                <button type="button" className="tool-btn" onClick={() => insertSnippet('*italic*')}>
                  <i>I</i>
                </button>
                <button type="button" className="tool-btn" onClick={() => insertSnippet('\n## Section Heading\n')}>
                  H2
                </button>
                <button type="button" className="tool-btn" onClick={() => insertSnippet('\n```javascript\n// code\n```\n')}>
                  &lt;/&gt;
                </button>
                <button type="button" className="tool-btn" onClick={() => insertSnippet('\n- Item 1\n- Item 2\n')}>
                  • List
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  style={{ color: 'var(--primary-dark)', marginLeft: 'auto' }}
                  onClick={() => setIsCameraOpen(true)}
                  title="Snap Diagram with Camera"
                >
                  <Camera style={{ width: 14, height: 14, marginRight: 4 }} />
                  Snap Diagram
                </button>
              </div>
              <textarea
                className="form-textarea code-font"
                placeholder="# Technical Overview&#10;&#10;Explain algorithms, architecture tradeoffs, or paste code snippets..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Attached Diagram / Whiteboard Photo Preview */}
            {diagramImage && (
              <div style={{
                marginTop: 14,
                padding: 14,
                background: 'var(--surface-muted)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImageIcon style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                    Attached Whiteboard / Diagram Snapshot
                  </span>
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => setDiagramImage(null)}
                    title="Remove attached diagram"
                    style={{ width: 28, height: 28 }}
                  >
                    <Trash2 style={{ width: 14, height: 14, color: 'var(--error)' }} />
                  </button>
                </div>
                <img
                  src={diagramImage}
                  alt="Architecture Diagram"
                  style={{ maxHeight: 200, width: '100%', objectFit: 'contain', background: '#111', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            )}

            {showLivePreview && (
              <div className="live-markdown-preview">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Eye style={{ width: 14, height: 14, color: 'var(--primary)' }} />
                    Formatted Markdown Output
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--primary-dark)', fontWeight: 600 }}>
                    Live Rendered
                  </span>
                </div>
                <MarkdownViewer content={content} />
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Key Takeaways / Abstract (Optional)</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 80 }}
              placeholder="Quick bullet point summary for swift recall during revisions..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          <button
            type="button"
            className="btn-duo-secondary"
            onClick={() => {
              setTitle('');
              setContent('');
              setSummary('');
              setDiagramImage(null);
              setTags('');
            }}
          >
            Reset
          </button>
          <button type="submit" className="btn-duo-primary">
            <Check style={{ width: 18, height: 18 }} />
            Save Technical Document
          </button>
        </div>
      </form>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Snap Whiteboard / Architecture Diagram"
      />
    </div>
  );
}
