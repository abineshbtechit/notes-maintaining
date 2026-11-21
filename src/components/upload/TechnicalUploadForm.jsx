import React, { useState } from 'react';
import { Terminal, Check } from 'lucide-react';
import { db } from '../../services/db.js';

export default function TechnicalUploadForm({
  folders,
  onOpenNewFolderModal,
  onNoteSaved,
  showToast
}) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(folders[0]?.folder || 'Computer Science');
  const [topic, setTopic] = useState(folders[0]?.topics[0] || 'Distributed Systems');
  const [language, setLanguage] = useState('markdown');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);

  const currFolderObj = folders.find(f => f.folder.toLowerCase() === folder.toLowerCase());
  const topics = currFolderObj?.topics || ['General Notes'];

  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    const matched = folders.find(f => f.folder.toLowerCase() === newFolder.toLowerCase());
    setTopic(matched?.topics[0] || 'General Notes');
  };

  const insertSnippet = (snippet) => {
    setContent(prev => prev + snippet);
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
      topic: topic || 'General Notes',
      language,
      content: content.trim(),
      summary: summary.trim(),
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      starred: false,
      createdAt: new Date().toISOString()
    };

    await db.saveNote(newNote);
    showToast(`🚀 Technical Document Saved in ${folder} → ${topic}! (+20 XP)`);

    setTitle('');
    setContent('');
    setSummary('');
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
        <button
          type="button"
          className="btn-duo-secondary"
          style={{ padding: '6px 14px', fontSize: 12 }}
          onClick={() => setShowLivePreview(!showLivePreview)}
        >
          {showLivePreview ? 'Hide Preview' : 'Live Preview'}
        </button>
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
            <label className="form-label">Topic / Sub-folder *</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <select
                className="form-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              >
                {topics.map(t => (
                  <option key={t} value={t}>{t}</option>
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
            <label className="form-label">Technical Content (Markdown & Code) *</label>
            <div className="editor-wrapper">
              <div className="editor-toolbar">
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
              </div>
              <textarea
                className="form-textarea code-font"
                placeholder="# Technical Overview&#10;&#10;Explain algorithms, architecture tradeoffs, or paste code snippets..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {showLivePreview && (
              <div className="live-markdown-preview">
                <pre><code>{content || '// Live preview will appear here'}</code></pre>
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
    </div>
  );
}
