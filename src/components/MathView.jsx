import React, { useEffect, useRef } from 'react';
import katex from 'katex';

export default function MathView({ latex, displayMode = true, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!latex || !latex.trim()) {
      containerRef.current.innerHTML = '<span style="color: var(--text-muted); font-size: 14px; font-style: italic;">Enter LaTeX code to preview equation</span>';
      return;
    }

    try {
      katex.render(latex, containerRef.current, {
        displayMode,
        throwOnError: false,
        errorColor: '#DE4545'
      });
    } catch (err) {
      containerRef.current.innerHTML = `<span style="color: var(--error); font-size: 13px;">Equation syntax error: ${err.message}</span>`;
    }
  }, [latex, displayMode]);

  return <div ref={containerRef} className={className} />;
}
