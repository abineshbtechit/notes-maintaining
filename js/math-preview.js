/**
 * Math rendering helper using KaTeX
 */

class MathRenderer {
  constructor() {
    this.isReady = typeof katex !== 'undefined';
  }

  render(latexString, targetElement, displayMode = true) {
    if (!targetElement) return;

    if (!latexString || !latexString.trim()) {
      targetElement.innerHTML = '<span style="color: var(--text-muted); font-size: 14px; font-style: italic;">Enter LaTeX code above to preview equation</span>';
      return;
    }

    try {
      if (typeof katex !== 'undefined') {
        katex.render(latexString, targetElement, {
          displayMode: displayMode,
          throwOnError: false,
          errorColor: '#DE4545'
        });
      } else {
        // Fallback display while KaTeX script loads
        targetElement.textContent = latexString;
      }
    } catch (err) {
      console.warn('KaTeX render error:', err);
      targetElement.innerHTML = `<span style="color: var(--error); font-size: 13px;">Equation formatting error: ${err.message}</span>`;
    }
  }

  insertSnippet(textarea, snippet) {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    textarea.value = text.substring(0, start) + snippet + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    
    // Trigger input event for live preview listeners
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

window.mathRenderer = new MathRenderer();
