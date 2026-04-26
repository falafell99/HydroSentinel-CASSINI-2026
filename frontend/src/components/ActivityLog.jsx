import React from 'react';
import { X, Shield, Eye, Mail, Satellite, LogIn } from 'lucide-react';

const ICON_MAP = { Shield, Eye, Mail, Satellite, LogIn };

const INITIAL_LOG = [
  { time: '09:14', iconName: 'Shield',   color: 'var(--green)',  label: 'Cease order issued · Field A-47 · Tóth I.' },
  { time: '08:55', iconName: 'Eye',      color: 'var(--blue)',   label: 'Field B-33 inspected · Pipe leak confirmed' },
  { time: '08:30', iconName: 'Mail',     color: 'var(--text-muted)', label: 'Daily digest sent · 847 fields · 4 anomalies' },
  { time: '07:58', iconName: 'Satellite',color: 'var(--teal)',   label: 'Sentinel-2 data refreshed · Pest County' },
  { time: '07:30', iconName: 'LogIn',    color: 'var(--text-muted)', label: 'Session started · Inspector Kovács' },
];

export default function ActivityLog({ open, onClose, entries = [] }) {
  const all = [...entries, ...INITIAL_LOG];
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.25)', zIndex: 1400 }} />
      <div style={{
        position: 'fixed', top: 52, right: 0, bottom: 0, width: 360,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
        zIndex: 1500, display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Inspector Activity Log</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Session: 25 Apr 2026 · Kovács P.</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {all.map(({ time, iconName, color, label }, i) => {
            const Icon = ICON_MAP[iconName] || Shield;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, animation: `rowEntrance 0.3s ease-out ${i * 40}ms both` }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
