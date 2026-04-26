import React, { useState } from 'react';
import { ChevronDown, CheckCircle, Circle } from 'lucide-react';
import { DATA_SOURCES } from '../data/fields.js';
import { useMobile } from '../hooks/useMobile.js';

// ── Accordion panel ──
function Panel({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ borderRadius: 8, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 18px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
          textAlign: 'left',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        {title}
        <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', color: open ? 'var(--teal)' : 'var(--text-muted)', flexShrink: 0 }}>
          <ChevronDown size={16} />
        </span>
      </button>
      {open && <div style={{ padding: '18px 18px' }}>{children}</div>}
    </div>
  );
}

// ── Input field ──
function Input({ label, defaultValue, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>{label}</label>}
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', boxSizing: 'border-box',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontSize: 14,
          outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,152,166,0.15)'; }}
        onBlur={e =>  { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

// ── Slider ──
function Slider({ label, defaultValue, min = 0, max = 100, unit = '%' }) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{label}</label>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--teal)', fontWeight: 600, flexShrink: 0 }}>{val}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={val}
        onChange={e => setVal(Number(e.target.value))}
        style={{
          width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none',
          background: `linear-gradient(to right, var(--teal) ${((val - min) / (max - min)) * 100}%, var(--border) ${((val - min) / (max - min)) * 100}%)`,
          borderRadius: 3, outline: 'none', cursor: 'pointer', accentColor: 'var(--teal)',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{min}{unit}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{max}{unit}</span>
      </div>
    </div>
  );
}

// ── Toggle ──
function Toggle({ label, defaultChecked = false, disabled = false, note }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, opacity: disabled ? 0.5 : 1, gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{label}</span>
        {note && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{note}</span>}
      </div>
      <button
        onClick={() => !disabled && setOn(o => !o)}
        disabled={disabled}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: on ? 'var(--teal)' : '#CBD5E1',
          border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 4, left: on ? 22 : 4,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

// ── API status cards ──
const API_CARDS = [
  { status: 'live', name: 'Open-Meteo',     desc: 'Free weather & ET₀ · Pest County · Lat 47.5° N', latency: '32ms',  hasKeyInput: false },
  { status: 'live', name: 'data.vizugy.hu', desc: 'Hungarian Water Authority · hydrology telemetry', latency: '128ms', hasKeyInput: false },
  { status: 'demo', name: 'Sentinel Hub',   desc: 'NDVI/SAR imagery · Add API key to activate real imagery', latency: null, hasKeyInput: true },
  { status: 'demo', name: 'Galileo OSNMA',  desc: 'Meter GPS authentication · Hardware integration required', latency: null, hasKeyInput: false },
  { status: 'demo', name: 'MePAR Registry', desc: 'Field parcel data · Government partnership required', latency: null, hasKeyInput: false },
];

const REFRESH_OPTS = ['Every 30 min', 'Every hour', 'Every 2 hours', 'Once daily'];

export default function SettingsTab() {
  const [selectedRefresh, setSelectedRefresh] = useState(1);
  const isMobile = useMobile();

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: isMobile ? '12px 14px' : '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-base)', animation: 'fadeSlideIn 0.25s ease-out' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.12em', paddingBottom: 4 }}>
        SYSTEM CONFIGURATION · AquaGuard v2.0 · Pest County
      </div>

      {/* ── Section 1: Inspector Profile ── */}
      <Panel title="Inspector Profile" defaultOpen>
        {/* Single column on mobile, 2-column on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
          <Input label="Full Name"  defaultValue="Kovács Péter" />
          <Input label="Badge ID"   defaultValue="OVIT-1847" />
          <Input label="County"     defaultValue="Pest County" />
          <Input label="Authority"  defaultValue="OVIT Regional Water Authority" />
          <Input label="Email"      defaultValue="kovacs.p@ovit.hu" type="email" />
          <Input label="Phone"      defaultValue="+36 1 234 5678" />
        </div>
        <button className="btn-primary" style={{ width: isMobile ? '100%' : 'auto', padding: '10px 20px' }}>Save Profile</button>
      </Panel>

      {/* ── Section 2: Alert Thresholds ── */}
      <Panel title="Alert Thresholds">
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.6 }}>
          Changes instantly recalculate field statuses across all 847 monitored fields.
        </div>
        <Slider label="Anomaly threshold (above CWR)" defaultValue={40} min={10} max={80} />
        <Slider label="Warning threshold (above CWR)" defaultValue={15} min={5}  max={40} />
      </Panel>

      {/* ── Section 3: API Connections ── */}
      <Panel title="API Connections">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {API_CARDS.map(({ status, name, desc, latency, hasKeyInput }) => (
            <div key={name} className="card" style={{ padding: '12px 14px', borderRadius: 8 }}>
              {/* On mobile: stack icon+info above button; on desktop: single row */}
              <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <div style={{ flexShrink: 0, paddingTop: isMobile ? 2 : 0 }}>
                  {status === 'live'
                    ? <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                    : <Circle     size={16} style={{ color: 'var(--text-muted)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                      background: status === 'live' ? 'var(--green-light)' : 'var(--bg-elevated)',
                      color: status === 'live' ? 'var(--green)' : 'var(--text-muted)',
                      border: `1px solid ${status === 'live' ? 'var(--green-border)' : 'var(--border)'}`,
                    }}>
                      {status.toUpperCase()}
                    </span>
                    {latency && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)' }}>{latency}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{desc}</div>
                </div>
                {/* Configure button: full-width at bottom on mobile */}
                <button
                  className="btn-outline"
                  style={{ width: isMobile ? '100%' : 'auto', padding: '7px 14px', fontSize: 12, flexShrink: 0, marginTop: isMobile ? 8 : 0 }}
                >
                  Configure
                </button>
              </div>
              {hasKeyInput && (
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    placeholder="Enter Sentinel Hub API key…"
                    style={{ flex: '1 1 180px', minWidth: 0, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-elevated)', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.background = '#fff'; }}
                    onBlur={e =>  { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-elevated)'; }}
                  />
                  <button className="btn-teal-outline" style={{ padding: '8px 14px', fontSize: 12, flexShrink: 0 }}>Verify key</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Section 4: Notification Settings ── */}
      <Panel title="Notification Settings">
        <Toggle label="Email alert on new anomaly" defaultChecked />
        <Toggle label="Daily digest email (07:00)" defaultChecked />
        <Toggle label="SMS alerts" note="(coming soon)" disabled />
      </Panel>

      {/* ── Section 5: Data & Refresh Rate ── */}
      <Panel title="Data & Refresh Rate">
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Field data refresh interval:</div>
          {/* On mobile: 2×2 grid; on desktop: single pill row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,auto)',
            gap: 6,
            background: 'var(--bg-elevated)',
            borderRadius: 8,
            padding: 4,
          }}>
            {REFRESH_OPTS.map((opt, i) => (
              <button
                key={opt}
                onClick={() => setSelectedRefresh(i)}
                style={{
                  padding: '8px 10px', borderRadius: 6,
                  background: selectedRefresh === i ? 'var(--teal)' : 'transparent',
                  color: selectedRefresh === i ? '#fff' : 'var(--text-secondary)',
                  border: 'none', fontFamily: 'var(--font-ui)', fontSize: 12,
                  fontWeight: selectedRefresh === i ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >{opt}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Satellite imagery (Sentinel-2) is always fetched on the 2-hour cadence regardless of this setting. This controls IoT meter polling frequency.
        </div>
      </Panel>

      {/* ── Data Source Registry ── */}
      <div className="card" style={{ padding: '16px 14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 14 }}>
          DATA SOURCE REGISTRY
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '140px 1fr', gap: isMobile ? 4 : '8px 16px' }}>
          {Object.entries(DATA_SOURCES).map(([key, val]) => (
            <React.Fragment key={key}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: isMobile ? 10 : 0, paddingLeft: isMobile ? 0 : 0 }}>
                {val}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
