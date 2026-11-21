import React, { useMemo } from 'react';
import { marked } from 'marked';

// Configure marked with GitHub Flavored Markdown and line breaks
marked.setOptions({
  gfm: true,
  breaks: true
});

export default function MarkdownViewer({ content, className = '' }) {
  const html = useMemo(() => {
    if (!content || !content.trim()) return '<p style="color: var(--text-muted); font-style: italic;">No markdown content to preview.</p>';
    try {
      return marked.parse(content);
    } catch (e) {
      console.error('Markdown parse error:', e);
      return `<pre><code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    }
  }, [content]);

  return (
    <div
      className={`markdown-rendered-view ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
