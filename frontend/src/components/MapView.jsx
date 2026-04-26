import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, CircleMarker, Polyline, useMap } from 'react-leaflet';
import { FIELDS, SUMMARY } from '../data/fields.js';
import { useCounterAnimation } from '../hooks/useCounterAnimation.js';
import { Satellite, Droplets, MapPin } from 'lucide-react';

// ─── Field polygon colours ────────────────────────────────────────────────────
const STATUS_STYLE = {
  anomaly: { fillColor: '#DC2626', fillOpacity: 0.32, color: '#DC2626', weight: 2.5 },
  warning: { fillColor: '#D97706', fillOpacity: 0.28, color: '#D97706', weight: 2 },
  ok:      { fillColor: '#16A34A', fillOpacity: 0.24, color: '#16A34A', weight: 2 },
};

// ─── Water body marker colours (mirrors knn.ipynb score_to_color) ─────────────
function wbColor(flood, drought) {
  if (flood >= 0.5 && drought >= 0.4) return '#EF4444'; // red  — both
  if (flood >= 0.5)                   return '#3B82F6'; // blue — flood
  if (drought >= 0.5)                 return '#F97316'; // orange — drought
  return '#22C55E';                                      // green  — ok
}

// Icon per water body type (for the legend)
const WB_ICON = { river: '≋', canal: '⇌', lake: '◉', reservoir: '⬡', oxbow_lake: '↻' };

// Satellite countdown helper
function useSatelliteCountdown(totalSeconds) {
  const [secs, setSecs] = useState(totalSeconds);
  useEffect(() => {
    const iv = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

// Centroid helper
function centroid(coords) {
  const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lon = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return [lat, lon];
}

function AnomalyCard({ field, onOpen, delay }) {
  return (
    <div
      onClick={() => onOpen(field)}
      style={{
        background: 'var(--red-light)', border: '1px solid var(--red-border)',
        borderLeft: '3px solid var(--red)', borderRadius: 8, padding: '12px 14px',
        cursor: 'pointer', transition: 'background 0.12s',
        animation: `fadeSlideIn 0.35s ease-out ${delay}ms both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-light)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
          Field {field.id}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)', fontWeight: 700 }}>
          +{field.wastePercent}%
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{field.crop} · {field.district}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>{field.alertDescription}</div>
      <button style={{ fontSize: 12, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
        onClick={e => { e.stopPropagation(); onOpen(field); }}>Open ↗</button>
    </div>
  );
}

export default function MapView({ onFieldSelect }) {
  const [droughtDismissed, setDroughtDismissed] = useState(false);
  const [layers, setLayers] = useState({ ndvi: true, soil: true, meters: false, waterBodies: true, knnLines: true });
  const [ndviAge, setNdviAge] = useState(15);
  const [soilAge, setSoilAge] = useState(8);

  // Water bodies fetched from backend
  const [waterBodies, setWaterBodies] = useState([]);
  // KNN matches: { field_id: [{ name, lat, lon, flood_score, drought_score, distance_km }] }
  const [knnMatches, setKnnMatches] = useState({});

  const totalCount = useCounterAnimation(SUMMARY.total, 1200, 200);
  const savedCount = useCounterAnimation(SUMMARY.waterSavedToday, 1400, 400);
  const s2Countdown = useSatelliteCountdown(22980);
  const s1Countdown = useSatelliteCountdown(6360);

  useEffect(() => {
    const iv = setInterval(() => { setNdviAge(a => a + 1); setSoilAge(a => a + 1); }, 60000);
    return () => clearInterval(iv);
  }, []);

  // ── Fetch water bodies from backend ──────────────────────────────────────────
  useEffect(() => {
    fetch('/api/water-bodies/', { signal: AbortSignal.timeout(5000) })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.water_bodies) setWaterBodies(data.water_bodies); })
      .catch(() => {});
  }, []);

  // ── Fetch KNN matches for all fields ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const matches = {};
      await Promise.all(FIELDS.map(async f => {
        try {
          const r = await fetch(`/api/fields/${f.id}/water-risk`, { signal: AbortSignal.timeout(6000) });
          if (r.ok) {
            const d = await r.json();
            if (d.nearestWaterBodies?.length) {
              matches[f.id] = d.nearestWaterBodies;
            }
          }
        } catch {}
      }));
      setKnnMatches(matches);
    };
    load();
  }, []);

  const anomalyFields = FIELDS.filter(f => f.status === 'anomaly');

  const Toggle = ({ on, onToggle }) => (
    <button onClick={onToggle} style={{
      width: 38, height: 20, borderRadius: 10,
      background: on ? 'var(--teal)' : '#CBD5E1',
      border: 'none', cursor: 'pointer', position: 'relative',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 20 : 3,
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* ── Left panel ── */}
      <div style={{
        width: 340, flexShrink: 0, height: '100%',
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        {/* Drought banner */}
        {!droughtDismissed && (
          <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderLeft: '3px solid var(--amber)', margin: '12px 14px 0', borderRadius: 7, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>⚠ Active Drought Alert</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Homokhátság district · Level II · 14 days continuous</div>
                <a href="https://vizhiany.vizugy.hu" target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>
                  vizhiany.vizugy.hu ↗
                </a>
              </div>
              <button onClick={() => setDroughtDismissed(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 0 0 8px' }}>×</button>
            </div>
          </div>
        )}

        {/* County overview */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>PEST COUNTY OVERVIEW</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 42, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>{totalCount.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 14 }}>fields monitored · MePAR registry</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            <div className="pill pill-ok"><span className="dot-ok" />{SUMMARY.efficient} Efficient</div>
            <div className="pill pill-warning"><span className="dot-warning" />{SUMMARY.warning} Warning</div>
            <div className="pill pill-anomaly"><span className="dot-anomaly" />{SUMMARY.anomaly} Anomaly</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--teal)', fontWeight: 500 }}>{savedCount.toLocaleString()} L</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>water saved today vs baseline</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 16 }} />
        </div>

        {/* Layers */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>MAP LAYERS</div>
          {[
            { key: 'ndvi',        icon: Satellite, label: 'NDVI · Sentinel-2',       age: `${ndviAge}m ago` },
            { key: 'soil',        icon: Droplets,  label: 'Soil Moisture · S-1 SAR', age: `${soilAge}m ago` },
            { key: 'waterBodies', icon: Droplets,  label: 'Water bodies (KNN)',       age: waterBodies.length ? `${waterBodies.length} loaded` : 'offline' },
            { key: 'knnLines',    icon: MapPin,    label: 'Farm→Water KNN lines',     age: Object.keys(knnMatches).length ? `${Object.keys(knnMatches).length} fields` : 'loading…' },
          ].map(({ key, icon: Icon, label, age }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={14} style={{ color: layers[key] ? 'var(--teal)' : 'var(--text-muted)' }} />
                <span style={{ fontSize: 12, color: layers[key] ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{age}</span>
                <Toggle on={layers[key]} onToggle={() => setLayers(l => ({ ...l, [key]: !l[key] }))} />
              </div>
            </div>
          ))}

          {/* Satellite countdown */}
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 7, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Next Sentinel-2 pass</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)', fontWeight: 500 }}>{s2Countdown}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Next Sentinel-1 pass</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue)', fontWeight: 500 }}>{s1Countdown}</span>
            </div>
          </div>
        </div>

        {/* Active anomalies */}
        <div style={{ padding: '0 16px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <span className="dot-anomaly" />
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--red)', letterSpacing: '0.08em' }}>
              ACTIVE ANOMALIES — {anomalyFields.length} FIELDS
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {anomalyFields.map((f, i) => <AnomalyCard key={f.id} field={f} onOpen={onFieldSelect} delay={i * 80} />)}
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>LEGEND</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            {[{ color: '#16A34A', label: 'Farm: Efficient' }, { color: '#D97706', label: 'Farm: Warning' }, { color: '#DC2626', label: 'Farm: Anomaly' }].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, background: color, borderRadius: 2, opacity: 0.75 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { color: '#3B82F6', label: 'Water: Flood risk' },
              { color: '#F97316', label: 'Water: Drought' },
              { color: '#EF4444', label: 'Water: Both' },
              { color: '#22C55E', label: 'Water: OK' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, background: color, borderRadius: '50%' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[47.35, 19.2]} zoom={9} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='© OpenStreetMap contributors © CARTO'
            subdomains="abcd"
            maxZoom={20}
          />

          {/* KNN lines: farm centroid → nearest water body */}
          {layers.knnLines && Object.entries(knnMatches).map(([fieldId, wbs]) => {
            const field = FIELDS.find(f => f.id === fieldId);
            if (!field || !wbs.length) return null;
            const fc = centroid(field.coordinates);
            const nearest = wbs[0];
            if (!nearest.lat || !nearest.lon) return null;
            return (
              <Polyline
                key={`knn-${fieldId}`}
                positions={[fc, [nearest.lat, nearest.lon]]}
                pathOptions={{ color: '#6B7280', weight: 1.5, dashArray: '6 4', opacity: 0.65 }}
              />
            );
          })}

          {/* Water body markers */}
          {layers.waterBodies && waterBodies.map(wb => {
            const color = wbColor(wb.flood_score ?? 0, wb.drought_score ?? 0);
            const radius = wb.type === 'river' ? 10 : wb.type === 'lake' ? 9 : 7;
            return (
              <CircleMarker
                key={wb.id}
                center={[wb.lat, wb.lon]}
                radius={radius}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.82, weight: 2 }}
              >
                <Tooltip>
                  <div style={{ fontFamily: 'sans-serif', minWidth: 200 }}>
                    <strong style={{ fontSize: 13 }}>{wb.name}</strong><br />
                    <span style={{ color: '#666', fontSize: 11 }}>{wb.type.replace('_', ' ').toUpperCase()}</span>
                    <hr style={{ margin: '5px 0' }} />
                    <div style={{ fontSize: 12 }}>
                      <div>Water level: <b>{wb.water_level_m} m</b></div>
                      <div>Flow rate: <b>{wb.avg_flow_m3s ?? 'N/A'} m³/s</b></div>
                      <div>Flood score: <b style={{ color: (wb.flood_score ?? 0) > 0.4 ? '#3B82F6' : '#333' }}>{(wb.flood_score ?? 0).toFixed(3)}</b></div>
                      <div>Drought score: <b style={{ color: (wb.drought_score ?? 0) > 0.4 ? '#F97316' : '#333' }}>{(wb.drought_score ?? 0).toFixed(3)}</b></div>
                    </div>
                    <hr style={{ margin: '5px 0' }} />
                    <span style={{ fontSize: 11, color: '#555' }}>{wb.notes}</span>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Farm polygons */}
          {FIELDS.map((field) => (
            <Polygon
              key={field.id}
              positions={field.coordinates}
              pathOptions={STATUS_STYLE[field.status]}
              eventHandlers={{
                click: () => onFieldSelect(field),
                mouseover: e => e.target.setStyle({ fillOpacity: 0.6, weight: 3 }),
                mouseout:  e => e.target.setStyle({ fillOpacity: STATUS_STYLE[field.status].fillOpacity, weight: STATUS_STYLE[field.status].weight }),
              }}
            >
              <Tooltip>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6 }}>
                  <strong>Field {field.id} · {field.owner}</strong><br />
                  {field.crop} · {field.area} ha<br />
                  Actual: {field.actualUse.toLocaleString()} L &nbsp;|&nbsp; CWR: {field.cwr.toLocaleString()} L<br />
                  <span style={{ color: field.status === 'anomaly' ? '#DC2626' : field.status === 'warning' ? '#D97706' : '#16A34A', fontWeight: 600 }}>
                    Waste: +{field.wastePercent}% {field.status === 'anomaly' ? '⚠ ANOMALY' : field.status === 'warning' ? '⚠ WARNING' : '✓ EFFICIENT'}
                  </span>
                </div>
              </Tooltip>
            </Polygon>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
