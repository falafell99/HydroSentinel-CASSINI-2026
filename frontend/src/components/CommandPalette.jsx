import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { FIELDS } from '../data/fields.js';

export default function CommandPalette({ open, onClose, onFieldSelect }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [recent] = useState(['A-47', 'C-12', 'B-33']);
  const inputRef = useRef(null);

  const results = query.trim().length === 0 ? [] : FIELDS.filter(f => {
    const q = query.toLowerCase();
    return f.id.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q) || f.crop.toLowerCase().includes(q) || f.district.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const handleKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { onFieldSelect(results[selected]); onClose(); setQuery(''); }
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  const statusColor = s => s === 'anomaly' ? 'var(--red)' : s === 'warning' ? 'var(--amber)' : 'var(--green)';

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.35)', backdropFilter: 'blur(3px)', zIndex: 2000 }}
      />
      <div
        style={{
          position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 560, maxWidth: '90vw',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          zIndex: 2001, overflow: 'hidden',
          animation: 'fadeScaleIn 0.18s ease-out',
        }}
        onKeyDown={handleKey}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--teal)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search fields, owners, crops, districts…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontSize: 15 }}
          />
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>}
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)', flexShrink: 0 }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {query.trim() === '' ? (
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>RECENT</div>
              {recent.map(id => {
                const f = FIELDS.find(f => f.id === id);
                if (!f) return null;
                return (
                  <div
                    key={id}
                    onClick={() => { onFieldSelect(f); onClose(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7, cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: statusColor(f.status), fontWeight: 600 }}>{f.id}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.owner} · {f.crop}</span>
                  </div>
                );
              })}
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No fields match "<span style={{ color: 'var(--text-secondary)' }}>{query}</span>"
            </div>
          ) : (
            <div style={{ padding: '6px 10px' }}>
              {results.map((f, i) => (
                <div
                  key={f.id}
                  onClick={() => { onFieldSelect(f); onClose(); setQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2,
                    background: selected === i ? 'var(--teal-light)' : 'transparent',
                    border: `1px solid ${selected === i ? 'rgba(0,152,166,0.3)' : 'transparent'}`,
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: statusColor(f.status), fontWeight: 700, minWidth: 44 }}>{f.id}</span>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{f.owner}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.crop} · {f.district} · {f.area} ha</div>
                    </div>
                  </div>
                  <span className={`pill pill-${f.status === 'ok' ? 'ok' : f.status === 'anomaly' ? 'anomaly' : 'warning'}`}>+{f.wastePercent}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([k, l]) => (
            <span key={k} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <kbd style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)', marginRight: 4 }}>{k}</kbd>{l}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
