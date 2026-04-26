import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { FIELDS } from '../data/fields.js';

function WasteBar({ pct, status }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(Math.min(pct, 100)), 80); return () => clearTimeout(t); }, [pct]);
  const color = pct > 40 ? '#DC2626' : pct > 15 ? '#D97706' : '#16A34A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 80, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease-out' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, minWidth: 36 }}>+{pct}%</span>
    </div>
  );
}

function SoilPill({ moisture }) {
  const map = { Saturated: 'pill-anomaly', High: 'pill-warning', Normal: 'pill-ok', Low: 'pill-info' };
  return <span className={`pill ${map[moisture] || 'pill-info'}`}>{moisture}</span>;
}

const COLS = [
  { key: 'id',           label: 'Field ID' },
  { key: 'owner',        label: 'Owner' },
  { key: 'crop',         label: 'Crop' },
  { key: 'area',         label: 'Area' },
  { key: 'actualUse',    label: 'Actual Use' },
  { key: 'cwr',          label: 'CWR Est.' },
  { key: 'wastePercent', label: 'Waste Score' },
  { key: 'soilMoisture', label: 'Soil' },
  { key: 'status',       label: 'Status' },
];

const STATUS_ORDER = { anomaly: 0, warning: 1, ok: 2 };

export default function FieldsTable({ onFieldSelect }) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortCol, setSortCol]         = useState('wastePercent');
  const [sortDir, setSortDir]         = useState('desc');
  const [page, setPage]               = useState(0);
  const PER_PAGE = 10;

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const headers = ['Field ID','Owner','Crop','Area (ha)','Actual Use (L)','CWR Est. (L)','Waste %','Soil Moisture','Status','Quota Used %','Recommended Action'];
    const rows = filtered.map(f => [
      f.id, f.owner, f.crop, f.area,
      f.actualUse, f.cwr, f.wastePercent,
      f.soilMoisture, f.status, f.quotaUsed,
      `"${f.recommendedAction || ''}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `aquaguard-fields-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = FIELDS
    .filter(f => {
      const q = search.toLowerCase();
      const match = !q || f.id.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q) || f.crop.toLowerCase().includes(q);
      const st = statusFilter === 'all' || f.status === statusFilter;
      return match && st;
    })
    .sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === 'status') { va = STATUS_ORDER[va]; vb = STATUS_ORDER[vb]; }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const anomalyCount = FIELDS.filter(f => f.status === 'anomaly').length;
  const warningCount = FIELDS.filter(f => f.status === 'warning').length;

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronUp size={11} style={{ opacity: 0.2 }} />;
    return sortDir === 'asc' ? <ChevronUp size={11} style={{ color: 'var(--teal)' }} /> : <ChevronDown size={11} style={{ color: 'var(--teal)' }} />;
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 20px', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Toolbar */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search field ID, owner, crop…"
            style={{
              width: 240, padding: '8px 10px 8px 32px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 7, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontSize: 13,
              outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.outline = '2px solid rgba(0,152,166,0.2)'; e.target.style.outlineOffset = '0px'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.outline = 'none'; }}
          />
        </div>

        {[
          { val: 'all',     label: `All (${FIELDS.length})` },
          { val: 'anomaly', label: `Anomalies (${anomalyCount})` },
          { val: 'warning', label: `Warnings (${warningCount})` },
          { val: 'ok',      label: 'Efficient' },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val); setPage(0); }}
            style={{
              padding: '7px 13px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontWeight: 500,
              background: statusFilter === val ? 'var(--teal)' : 'var(--bg-surface)',
              color: statusFilter === val ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${statusFilter === val ? 'var(--teal)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >{label}</button>
        ))}

        <div style={{ flex: 1 }} />
        <button className="btn-teal-outline" onClick={exportCSV} style={{ padding: '7px 13px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              {COLS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  style={{
                    padding: '10px 14px',
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: sortCol === key ? 'var(--teal)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'left', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }} />
            </tr>
          </thead>
          <tbody>
            {paged.map((field, i) => {
              const isEven = i % 2 === 0;
              const rowBg = isEven ? 'var(--bg-surface)' : '#FAFBFD';
              const actColor = field.status === 'anomaly' ? 'var(--red)' : field.status === 'warning' ? 'var(--amber)' : 'var(--text-secondary)';
              return (
                <tr
                  key={field.id}
                  onClick={() => onFieldSelect(field)}
                  style={{
                    background: rowBg, cursor: 'pointer',
                    animation: `rowEntrance 0.3s ease-out ${i * 30}ms both`,
                    transition: 'background 0.1s',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
                >
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{field.id}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{field.owner}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)' }}>{field.crop}</td>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{field.area} ha</td>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: actColor, fontWeight: 500 }}>{field.actualUse.toLocaleString()} L</td>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{field.cwr.toLocaleString()} L</td>
                  <td style={{ padding: '11px 14px', minWidth: 150 }}><WasteBar pct={field.wastePercent} status={field.status} /></td>
                  <td style={{ padding: '11px 14px' }}><SoilPill moisture={field.soilMoisture} /></td>
                  <td style={{ padding: '11px 14px' }}>
                    <span className={`pill pill-${field.status === 'ok' ? 'ok' : field.status === 'anomaly' ? 'anomaly' : 'warning'}`}>
                      <span className={`dot-${field.status === 'ok' ? 'ok' : field.status === 'anomaly' ? 'anomaly' : 'warning'}`} />
                      {field.status === 'ok' ? 'Efficient' : field.status === 'anomaly' ? 'Anomaly' : 'Warning'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 13, cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-ui)' }}
                      onClick={e => { e.stopPropagation(); onFieldSelect(field); }}
                    >Open ↗</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, paddingBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Showing {paged.length} of {filtered.length} fields{statusFilter !== 'all' ? ` · filtered: ${statusFilter}` : ''}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-outline" style={{ width: 'auto', padding: '5px 14px', fontSize: 12 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <button className="btn-outline" style={{ width: 'auto', padding: '5px 14px', fontSize: 12 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}
