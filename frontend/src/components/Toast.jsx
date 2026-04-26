import React, { useEffect, useState } from 'react';

function ToastItem({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 4000;
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
    }, 50);
    const timeout = setTimeout(() => onDismiss(toast.id), duration);
    return () => { clearInterval(iv); clearTimeout(timeout); };
  }, []);

  const leftColor = toast.type === 'success' ? 'var(--green)' : toast.type === 'error' ? 'var(--red)' : toast.type === 'warning' ? 'var(--amber)' : 'var(--teal)';
  const barColor = leftColor;

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${leftColor}`,
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        minWidth: 300, maxWidth: 380,
        overflow: 'hidden',
        animation: 'slideInBottom 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
        pointerEvents: 'all',
      }}
    >
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{toast.icon || '✓'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{toast.title}</div>
          {toast.body && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{toast.body}</div>}
        </div>
      </div>
      <div style={{ height: 2, background: 'var(--bg-elevated)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: barColor, transition: 'width 0.05s linear' }} />
      </div>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(toast => <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />)}
    </div>
  );
}
