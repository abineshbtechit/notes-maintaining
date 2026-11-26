import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  const isWarning = toast.type === 'warning';

  return (
    <div
      className="toast-notice show"
      style={{ borderLeftColor: isWarning ? 'var(--warning)' : 'var(--primary)' }}
    >
      {isWarning ? (
        <AlertCircle style={{ color: 'var(--warning)', width: 22, height: 22 }} />
      ) : (
        <CheckCircle2 style={{ color: 'var(--primary)', width: 22, height: 22 }} />
      )}
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
        {toast.message}
      </span>
    </div>
  );
}
