import React, { useEffect, useState } from 'react';
import { X, Shield, CheckCircle, AlertTriangle, Flag, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

const DAYS = ['Apr 19', 'Apr 20', 'Apr 21', 'Apr 22', 'Apr 23', 'Apr 24', 'Apr 25'];

function GaugeBar({ value, max = 100, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth((value / max) * 100), 80); return () => clearTimeout(t); }, [value, max]);
  return (
    <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease-out' }} />
    </div>
  );
}

export default function FieldDetailPanel({ field, onClose, onAction }) {
  const [displayedText, setDisplayedText] = useState('');
  const [chartMounted, setChartMounted] = useState(false);

  useEffect(() => {
    if (!field) return;
    setDisplayedText('');
    let i = 0;
    const text = field.systemVerdict;
    const timer = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [field?.id]);

  useEffect(() => {
    const t = setTimeout(() => setChartMounted(true), 120);
    return () => clearTimeout(t);
  }, [field?.id]);

  if (!field) return null;

  const waste = field.actualUse - field.cwr;

  const chartData = {
    labels: DAYS,
    datasets: [
      {
        label: 'Actual use (L)',
        data: field.history,
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220,38,38,0.06)',
        borderWidth: 2,
        pointRadius: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'CWR Estimate (L)',
        data: field.cwrHistory,
        borderColor: '#16A34A',
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: { labels: { color: '#4A6080', font: { family: 'DM Mono', size: 10 }, boxWidth: 18 } },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#E2E8F2',
        borderWidth: 1,
        titleColor: '#0F1F3D',
        bodyColor: '#4A6080',
        padding: 10,
        callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} L` },
      },
    },
    scales: {
      x: { ticks: { color: '#8FA3BF', font: { size: 10, family: 'DM Mono' } }, grid: { color: '#E2E8F2' } },
      y: { ticks: { color: '#8FA3BF', font: { size: 10, family: 'DM Mono' } }, grid: { color: '#E2E8F2' } },
    },
  };

  const statusCls = field.status === 'anomaly' ? 'pill-anomaly' : field.status === 'warning' ? 'pill-warning' : 'pill-ok';

  return (
    <div style={{
      position: 'fixed', top: 52, right: 0, bottom: 0,
      width: 390,
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column',
      zIndex: 800,
      animation: 'slideInRight 0.25s ease-out',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontFamily: 'var(--font-ui)' }}
          >
            ← Map
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" style={{ width: 'auto', padding: '5px 11px', fontSize: 12 }}>Export PDF</button>
            <button
              className="btn-outline"
              style={{ width: 'auto', padding: '5px 11px', fontSize: 12, color: 'var(--amber)', borderColor: '#FDE68A' }}
              onClick={() => onAction('flag', field)}
            >
              <Flag size={11} /> Flag
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-primary)', fontWeight: 600 }}>
            Field {field.id}
          </h2>
          <span className={`pill ${statusCls}`}>
            {field.status === 'anomaly' ? 'Anomaly' : field.status === 'warning' ? 'Warning' : 'Efficient'} · +{field.wastePercent}% over CWR
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {field.owner} · {field.crop} · {field.district} · {field.area} ha
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Last updated: 25 Apr, 08:14
        </div>
      </div>

      {/* 7-day chart */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>
          7-DAY CONSUMPTION vs CWR · L/day
        </div>
        <div style={{ height: 130 }}>
          {chartMounted && <Line data={chartData} options={chartOptions} />}
        </div>
      </div>

      {/* 4 metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {[
          { label: 'Actual use today',  value: `${field.actualUse.toLocaleString()} L`, color: 'var(--red)' },
          { label: 'Satellite CWR',     value: `${field.cwr.toLocaleString()} L`,       color: 'var(--green)' },
          { label: 'Waste delta',        value: `+${waste.toLocaleString()} L`,           color: 'var(--red)', sub: `+${field.wastePercent}%` },
          { label: 'Days flagged',       value: `${field.daysAnomaly} days`,              color: field.daysAnomaly > 0 ? 'var(--red)' : 'var(--green)' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 7, padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color, fontWeight: 500 }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Satellite gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ background: 'var(--teal-light)', border: '1px solid rgba(0,152,166,0.2)', borderRadius: 7, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--teal)', letterSpacing: '0.06em', marginBottom: 4 }}>SENTINEL-2 NDVI</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--teal)', fontWeight: 600 }}>{field.ndvi}</div>
          <GaugeBar value={field.ndvi * 100} color="var(--teal)" />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Vegetation index · Apr 25</div>
        </div>
        <div style={{
          background: field.soilMoisture === 'Saturated' ? 'var(--red-light)' : field.soilMoisture === 'High' ? 'var(--amber-light)' : 'var(--green-light)',
          border: `1px solid ${field.soilMoisture === 'Saturated' ? 'var(--red-border)' : field.soilMoisture === 'High' ? 'var(--amber-border)' : 'var(--green-border)'}`,
          borderRadius: 7, padding: '10px 12px',
        }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>SENTINEL-1 SOIL</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
            color: field.soilMoisture === 'Saturated' ? 'var(--red)' : field.soilMoisture === 'High' ? 'var(--amber)' : 'var(--green)',
          }}>{field.soilMoisture.toUpperCase()}</div>
          <GaugeBar
            value={field.soilMoisture === 'Saturated' ? 100 : field.soilMoisture === 'High' ? 78 : field.soilMoisture === 'Normal' ? 50 : 25}
            color={field.soilMoisture === 'Saturated' ? 'var(--red)' : field.soilMoisture === 'High' ? 'var(--amber)' : 'var(--green)'}
          />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>SAR backscatter · Apr 25</div>
        </div>
      </div>

      {/* Galileo OSNMA */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{
          background: 'var(--teal-light)',
          border: '1px solid rgba(0,152,166,0.25)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: 7, padding: '10px 12px',
          display: 'flex', gap: 10,
        }}>
          <Shield size={16} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <CheckCircle size={11} style={{ color: 'var(--teal)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', fontWeight: 600 }}>
                🔐 METER VERIFIED · GALILEO OSNMA
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              GPS matches registered location · Last signed: {field.galileoTimestamp}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
              SIG: {field.galileoHash}
            </div>
          </div>
        </div>
      </div>

      {/* System verdict */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>SYSTEM VERDICT</div>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 7, padding: '12px', minHeight: 70 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.7 }}>
            {displayedText}
            <span style={{ borderRight: '2px solid var(--teal)', marginLeft: 1, animation: 'livePulse 1s step-end infinite' }}>&nbsp;</span>
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '14px 18px', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>
          RECOMMENDED ACTIONS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(field.actionUrgency === 'critical' || field.actionUrgency === 'high') ? (
            <button className="btn-danger" onClick={() => onAction('cease', field)}>
              <AlertTriangle size={14} /> Issue Cease Irrigation Order
            </button>
          ) : field.actionUrgency === 'medium' ? (
            <button
              onClick={() => onAction('warn', field)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', background: 'var(--amber-light)', color: 'var(--amber)', border: '1px solid var(--amber-border)', borderRadius: 7, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}
            >
              <AlertTriangle size={14} /> Send Warning Notice
            </button>
          ) : (
            <button className="btn-outline" onClick={() => onAction('monitor', field)}>
              <TrendingUp size={14} /> Monitor &amp; Flag Next Cycle
            </button>
          )}
          <button className="btn-outline" onClick={() => onAction('flag', field)}>
            <Flag size={14} /> Flag for Inspection
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 13, cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontFamily: 'var(--font-ui)' }}>
            See inspection workflow ↗
          </button>
        </div>
      </div>
    </div>
  );
}
