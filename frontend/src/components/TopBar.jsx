import React, { useEffect, useState } from 'react';

export default function TopBar({ anomalyCount }) {
  const [freshnessKey, setFreshnessKey] = useState(0);
  const [minutesAgo, setMinutesAgo] = useState(3);

  useEffect(() => {
    const iv = setInterval(() => setFreshnessKey(k => k + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setMinutesAgo(m => m + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 52,
      background: 'var(--bg-header)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '0 20px',
      zIndex: 1000,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="10" stroke="var(--teal)" strokeWidth="1.5" fill="var(--teal-light)" />
          <path d="M11 4C11 4 6 8.5 6 12C6 14.8 8.2 17 11 17C13.8 17 16 14.8 16 12C16 8.5 11 4Z"
            fill="var(--teal)" />
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
          AQUAGUARD
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }} />

      {/* Freshness bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
          SATELLITE DATA FRESHNESS
        </span>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            key={freshnessKey}
            style={{
              height: '100%',
              background: 'var(--teal)',
              borderRadius: 2,
              animation: 'freshnessReset 30s linear forwards',
            }}
          />
        </div>
      </div>

      {/* LIVE indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <span className="dot-live" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', fontWeight: 500 }}>LIVE</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· Sentinel-2 updated {minutesAgo}m ago</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Anomaly badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: 'var(--red-light)',
        border: '1px solid var(--red-border)',
        borderRadius: 20, padding: '5px 12px',
        flexShrink: 0,
      }}>
        <span className="dot-anomaly" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
          {anomalyCount} ANOMALIES
        </span>
      </div>

      {/* Inspector pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: '5px 14px',
        cursor: 'pointer', flexShrink: 0,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--teal), var(--blue))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: '#fff',
        }}>K</div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
          Pest County · Insp. Kovács
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▾</span>
      </div>
    </header>
  );
}
