import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement,
  Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useWeatherData, weatherIcon } from '../hooks/useWeatherData.js';
import { useCounterAnimation } from '../hooks/useCounterAnimation.js';
import { FIELDS, COUNTY_TREND, SUMMARY } from '../data/fields.js';
import { CheckCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const TOOLTIP = {
  backgroundColor: '#fff',
  borderColor: '#E2E8F2',
  borderWidth: 1,
  titleColor: '#0F1F3D',
  bodyColor: '#4A6080',
  padding: 10,
};
const GRID = { color: '#E2E8F2' };
const TICK = (size = 10) => ({ color: '#8FA3BF', font: { family: 'DM Mono', size } });

// ── Enforcement table with modal ──
function EnforcementTable({ onAction }) {
  const rows = FIELDS.filter(f => f.status !== 'ok').sort((a, b) => b.wastePercent - a.wastePercent);
  const [issued, setIssued] = useState({});
  const [modal, setModal] = useState(null);

  const confirm = () => {
    if (!modal) return;
    setIssued(prev => ({ ...prev, [modal.id]: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }) }));
    onAction('cease', modal);
    setModal(null);
  };

  return (
    <>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeScaleIn 0.18s ease-out' }}>
          <div className="card" style={{ borderRadius: 10, padding: '28px 30px', maxWidth: 400, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Confirm Action</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              Issue <strong style={{ color: 'var(--red)' }}>{modal.recommendedAction}</strong> to <strong>{modal.owner}</strong> (Field {modal.id})?
              <br />This will be logged in the inspector activity record.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-danger" onClick={confirm} style={{ flex: 1 }}>Confirm</button>
              <button className="btn-outline" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              {['Field', 'Owner', 'Crop', 'Area', 'Waste', 'Urgency', 'Recommended Action', ''].map(h => (
                <th key={h} style={{ padding: '9px 14px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((f, i) => {
              const done = issued[f.id];
              const urg = f.actionUrgency === 'critical' ? '🔴 Critical' : f.actionUrgency === 'high' ? '🔴 High' : f.actionUrgency === 'medium' ? '🟡 Medium' : '🟡 Low';
              const rowBg = i % 2 === 0 ? 'var(--bg-surface)' : '#FAFBFD';
              return (
                <tr key={f.id} style={{ background: done ? 'var(--bg-elevated)' : rowBg, opacity: done ? 0.55 : 1, transition: 'opacity 0.4s', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{f.id}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{f.owner}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{f.crop}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{f.area}ha</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: f.status === 'anomaly' ? 'var(--red)' : 'var(--amber)', fontWeight: 600 }}>+{f.wastePercent}%</td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>{urg}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{f.recommendedAction}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {done
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}><CheckCircle size={12} /> Issued · {done}</span>
                      : <button style={{ padding: '5px 12px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600 }} onClick={() => setModal(f)}>Execute</button>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── KPI Card with animated counter ──
function KPICard({ label, value, color, sub, delay, unit = '' }) {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const animated = useCounterAnimation(num, 1200, delay);
  const display = Number.isInteger(num) ? animated.toLocaleString() : animated.toFixed(1);
  return (
    <div className="card" style={{ padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', animation: `fadeSlideIn 0.4s ease-out ${delay}ms both` }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color, fontWeight: 500, lineHeight: 1 }}>
        {display}<span style={{ fontSize: 14, marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div>
    </div>
  );
}

// Risk level badge helper
function RiskBadge({ flood, drought }) {
  const isFlood   = flood   > 0.5;
  const isDrought = drought > 0.4;
  if (isFlood && isDrought) return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#FEE2E2', color: '#DC2626', fontWeight: 600 }}>Both</span>;
  if (isFlood)   return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#DBEAFE', color: '#2563EB', fontWeight: 600 }}>Flood</span>;
  if (isDrought) return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#FEF3C7', color: '#D97706', fontWeight: 600 }}>Drought</span>;
  return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#DCFCE7', color: '#16A34A', fontWeight: 600 }}>Stable</span>;
}

export default function ReportsTab({ onAction }) {
  const { data: weather, loading: wLoading } = useWeatherData();
  const [visible, setVisible] = useState(false);
  const [waterBodies, setWaterBodies] = useState([]);
  const [wbLoading, setWbLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    fetch('/api/water-bodies/', { signal: AbortSignal.timeout(6000) })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.water_bodies) setWaterBodies(d.water_bodies); })
      .catch(() => {})
      .finally(() => setWbLoading(false));
  }, []);

  if (!visible) return null;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Chart 1 — horizontal waste bars
  const wasteData = {
    labels: FIELDS.slice(0, 6).map(f => `${f.id} ${f.owner}`),
    datasets: [{
      data: FIELDS.slice(0, 6).map(f => f.actualUse - f.cwr),
      backgroundColor: FIELDS.slice(0, 6).map(f => f.status === 'anomaly' ? 'rgba(220,38,38,0.7)' : f.status === 'warning' ? 'rgba(217,119,6,0.7)' : 'rgba(22,163,74,0.7)'),
      borderRadius: 4,
    }],
  };
  const wasteOpts = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    animation: { duration: 800 },
    plugins: { legend: { display: false }, tooltip: TOOLTIP },
    scales: {
      x: { ticks: TICK(10), grid: GRID, title: { display: true, text: 'Litres over CWR', color: '#8FA3BF', font: { size: 10 } } },
      y: { ticks: { ...TICK(10), font: { family: 'DM Mono', size: 10 } }, grid: { display: false } },
    },
  };

  // Chart 2 — county trend
  const trendData = {
    labels: COUNTY_TREND.labels,
    datasets: [
      { label: 'Total Actual Use', data: COUNTY_TREND.actual, borderColor: '#0098A6', backgroundColor: 'rgba(0,152,166,0.07)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3 },
      { label: 'CWR Satellite Est.', data: COUNTY_TREND.cwr, borderColor: '#16A34A', borderDash: [5, 4], fill: false, tension: 0.4, borderWidth: 2, pointRadius: 2 },
      { label: 'Quota Baseline', data: COUNTY_TREND.quota, borderColor: '#CBD5E1', borderDash: [3, 6], fill: false, borderWidth: 1.5, pointRadius: 0 },
    ],
  };
  const trendOpts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 800 },
    plugins: { legend: { labels: { color: '#4A6080', font: { family: 'DM Mono', size: 10 }, boxWidth: 16 } }, tooltip: TOOLTIP },
    scales: { x: { ticks: TICK(10), grid: GRID }, y: { ticks: TICK(10), grid: GRID } },
  };

  // Chart 3 — donut
  const donutData = {
    labels: ['Efficient (791)', 'Warning (52)', 'Anomaly (4)'],
    datasets: [{ data: [791, 52, 4], backgroundColor: ['rgba(22,163,74,0.75)', 'rgba(217,119,6,0.75)', 'rgba(220,38,38,0.8)'], borderColor: ['#16A34A', '#D97706', '#DC2626'], borderWidth: 2 }],
  };
  const donutOpts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 800 }, cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#4A6080', font: { family: 'DM Mono', size: 10 }, boxWidth: 14 } },
      tooltip: TOOLTIP,
    },
  };

  // Chart 4 — quota stacked bar
  const topF = FIELDS.slice(0, 6);
  const quotaData = {
    labels: topF.map(f => f.id),
    datasets: [
      { label: 'Used quota %', data: topF.map(f => f.quotaUsed), backgroundColor: 'rgba(0,152,166,0.75)', borderRadius: 4 },
      { label: 'Remaining %', data: topF.map(f => 100 - f.quotaUsed), backgroundColor: 'rgba(226,232,242,0.8)', borderRadius: 4 },
    ],
  };
  const quotaOpts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 800 },
    plugins: { legend: { labels: { color: '#4A6080', font: { family: 'DM Mono', size: 10 }, boxWidth: 14 } }, tooltip: TOOLTIP },
    scales: {
      x: { stacked: true, ticks: TICK(10), grid: { display: false } },
      y: { stacked: true, ticks: TICK(10), grid: GRID, max: 100 },
    },
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-base)', animation: 'fadeSlideIn 0.25s ease-out' }}>

      {/* Weather strip */}
      <section>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
          7-DAY FORECAST · PEST COUNTY · Open-Meteo / odp.met.hu
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {wLoading
            ? Array(7).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ minWidth: 100, height: 120, flexShrink: 0 }} />)
            : weather?.time.map((date, i) => {
              const isToday = i === 0;
              return (
                <div key={date} className="card" style={{
                  minWidth: 100, borderRadius: 8, padding: '12px 10px', textAlign: 'center', flexShrink: 0,
                  background: isToday ? 'var(--teal-light)' : 'var(--bg-surface)',
                  borderColor: isToday ? 'var(--teal)' : 'var(--border)',
                }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: isToday ? 'var(--teal)' : 'var(--text-muted)', marginBottom: 6 }}>
                    {isToday ? 'TODAY' : days[i]}
                  </div>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{weatherIcon(weather.weathercode?.[i] ?? 0)}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)' }}>
                    {Math.round(weather.temperature_2m_max?.[i] ?? 0)}°
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/{Math.round(weather.temperature_2m_min?.[i] ?? 0)}°</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{(weather.precipitation_sum?.[i] ?? 0).toFixed(1)}mm</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--teal)', marginTop: 2 }}>ET₀ {(weather.et0_fao_evapotranspiration?.[i] ?? 0).toFixed(1)}</div>
                </div>
              );
            })}
        </div>
      </section>

      {/* KPI row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <KPICard label="Fields Monitored" value={SUMMARY.total} color="var(--teal)" sub="MePAR registry · Pest County" delay={0} />
        <KPICard label="Anomalies Today" value={SUMMARY.anomaly} color="var(--red)" sub="waste > 40% above CWR" delay={80} />
        <KPICard label="Total Waste Today" value={SUMMARY.totalWasted} unit="L" color="var(--red)" sub="excess extraction" delay={160} />
        <KPICard label="Compliance Rate" value={SUMMARY.complianceRate} unit="%" color="var(--green)" sub="within quota · this cycle" delay={240} />
      </section>

      {/* Charts 2×2 */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>WATER WASTE BY FIELD — TODAY · L above CWR</div>
          <div style={{ height: 220 }}><Bar data={wasteData} options={wasteOpts} /></div>
        </div>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>7-DAY COUNTY WATER USAGE TREND</div>
          <div style={{ height: 220 }}><Line data={trendData} options={trendOpts} /></div>
        </div>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>STATUS DISTRIBUTION · 847 FIELDS</div>
          <div style={{ height: 220 }}><Doughnut data={donutData} options={donutOpts} /></div>
        </div>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>MONTHLY QUOTA UTILISATION · TOP FIELDS</div>
          <div style={{ height: 220 }}><Bar data={quotaData} options={quotaOpts} /></div>
        </div>
      </section>

      {/* Water distribution */}
      <section className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 14 }}>
          WATER CONSUMPTION DISTRIBUTION · PEST COUNTY · APRIL 2026 · source: Sentinel-1 SAR + data.vizugy.hu
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Where water goes:</div>
          {[
            { label: 'Agricultural irrigation', pct: 71, color: 'var(--teal)' },
            { label: 'Residential / municipal',  pct: 18, color: 'var(--blue)' },
            { label: 'Industrial',               pct: 11, color: 'var(--text-muted)' },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 190 }}>{label}</span>
              <div style={{ flex: 1, height: 10, background: 'var(--bg-elevated)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 5 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, minWidth: 38, textAlign: 'right', fontWeight: 600 }}>{pct}%</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Within irrigation — efficiency breakdown:</div>
          {[
            { label: 'Efficient irrigation', pct: 58, color: 'var(--green)' },
            { label: 'Over-extraction',       pct: 42, color: 'var(--red)' },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 190 }}>{label}</span>
              <div style={{ flex: 1, height: 10, background: 'var(--bg-elevated)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 5 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, minWidth: 38, textAlign: 'right', fontWeight: 600 }}>{pct}%</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          <span style={{ color: 'var(--red)', fontWeight: 600 }}>42%</span> of irrigation water in Pest County is applied to fields with soil already at or above field capacity (Sentinel-1 SAR, April 2026). This represents an estimated <strong>11,400 L/day</strong> of preventable waste across monitored fields.
        </div>
      </section>

      {/* Water Risk Summary */}
      <section className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 14 }}>
          WATER BODY RISK OVERVIEW · KNN ANALYSIS · PEST COUNTY
        </div>
        {wbLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 6 }} />)}
          </div>
        ) : waterBodies.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Backend offline — water risk data unavailable</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Water Body', 'Type', 'Water Level', 'Flow Rate', 'Flood Score', 'Drought Score', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waterBodies.map((wb, i) => (
                  <tr key={wb.id || i} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : '#FAFBFD', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{wb.name}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{wb.type.replace('_', ' ')}</td>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{wb.water_level_m} m</td>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{wb.avg_flow_m3s != null ? `${wb.avg_flow_m3s} m³/s` : '—'}</td>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: (wb.flood_score ?? 0) > 0.5 ? '#2563EB' : (wb.flood_score ?? 0) > 0.3 ? '#D97706' : '#16A34A' }}>
                      {(wb.flood_score ?? 0).toFixed(3)}
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: (wb.drought_score ?? 0) > 0.4 ? '#EA580C' : (wb.drought_score ?? 0) > 0.2 ? '#D97706' : '#16A34A' }}>
                      {(wb.drought_score ?? 0).toFixed(3)}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <RiskBadge flood={wb.flood_score ?? 0} drought={wb.drought_score ?? 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Enforcement table */}
      <section className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 14 }}>
          RECOMMENDED ENFORCEMENT ACTIONS · SORTED BY URGENCY
        </div>
        <EnforcementTable onAction={onAction} />
      </section>
    </div>
  );
}
