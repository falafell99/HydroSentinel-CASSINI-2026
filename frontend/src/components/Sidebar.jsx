import React, { useState } from 'react';
import { Map, Table2, BarChart2, Settings, ScrollText, HelpCircle } from 'lucide-react';

const TABS = [
  { id: 'map',      icon: Map,       label: 'Map' },
  { id: 'fields',   icon: Table2,    label: 'Fields' },
  { id: 'reports',  icon: BarChart2, label: 'Reports' },
  { id: 'settings', icon: Settings,  label: 'Settings' },
];

export default function Sidebar({ activeTab, onTabChange, onActivityLogOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed', top: 52, left: 0, bottom: 0,
        width: hovered ? 200 : 56,
        background: 'var(--bg-sidebar)',
        borderRight: 'none',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 900,
        overflow: 'hidden',
      }}
    >
      {/* Main tabs */}
      <div style={{ flex: 1, padding: '10px 0' }}>
        {TABS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '11px 18px',
                background: active ? 'rgba(0,152,166,0.15)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${active ? 'var(--teal)' : 'transparent'}`,
                color: active ? 'var(--teal)' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = active ? 'rgba(0,152,166,0.15)' : 'transparent'; }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.18s' }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { icon: ScrollText, label: 'Activity Log', onClick: onActivityLogOpen },
          { icon: HelpCircle, label: 'Help', onClick: () => {} },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '11px 18px',
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-ui)', fontSize: 13,
              transition: 'color 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.18s' }}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
