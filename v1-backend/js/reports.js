// ══════════════════════════════════════════
// js/reports.js — Analytics & reports view
// ══════════════════════════════════════════

import { FIELDS, SORTED_FIELDS } from './data.js';

let reportCharts = {};

const LABELS_7D = ['19 Apr', '20 Apr', '21 Apr', '22 Apr', '23 Apr', '24 Apr', '25 Apr'];

// ── Destroy existing charts before re-render ──
function destroyReportCharts() {
  Object.values(reportCharts).forEach(c => { if (c) c.destroy(); });
  reportCharts = {};
}

// ── Summary cards ──────────────────────────────────────
function renderSummary() {
  const anomalyCount  = FIELDS.filter(f => f.status === 'anomaly').length;
  const warningCount  = FIELDS.filter(f => f.status === 'warning').length;
  const totalWaste    = FIELDS.reduce((s, f) => s + Math.max(0, f.wasteDelta), 0);
  const totalActual   = FIELDS.reduce((s, f) => s + f.actual, 0);
  const totalCWR      = FIELDS.reduce((s, f) => s + f.cwr, 0);
  const overallWaste  = Math.round((totalActual - totalCWR) / totalCWR * 100);
  const compliant     = FIELDS.filter(f => f.status === 'ok').length;
  const compliance    = Math.round(compliant / FIELDS.length * 100);

  document.getElementById('rpt-anomalies').textContent   = anomalyCount;
  document.getElementById('rpt-warnings').textContent    = warningCount;
  document.getElementById('rpt-waste-l').textContent     = totalWaste.toLocaleString() + ' L';
  document.getElementById('rpt-waste-pct').textContent   = '+' + overallWaste + '%';
  document.getElementById('rpt-compliance').textContent  = compliance + '%';
  document.getElementById('rpt-fields').textContent      = FIELDS.length;
}

// ── Weather data via Open-Meteo ───────────────────────
async function fetchWeather() {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude',  '47.5');
    url.searchParams.set('longitude', '19.0');
    url.searchParams.set('daily',     'et0_fao_evapotranspiration,precipitation_sum,temperature_2m_max,temperature_2m_min');
    url.searchParams.set('timezone',  'Europe/Budapest');
    url.searchParams.set('forecast_days', '1');
    const res  = await fetch(url);
    const data = await res.json();
    const d    = data.daily;
    document.getElementById('rpt-et0').textContent   = d.et0_fao_evapotranspiration[0].toFixed(2) + ' mm/day';
    document.getElementById('rpt-temp').textContent  = d.temperature_2m_max[0] + ' / ' + d.temperature_2m_min[0] + ' °C';
    document.getElementById('rpt-rain').textContent  = d.precipitation_sum[0] + ' mm';
    document.getElementById('rpt-weather-src').textContent = '✓ Live · Open-Meteo API · Pest County';
    document.getElementById('rpt-weather-src').style.color = '#27500A';
  } catch (e) {
    document.getElementById('rpt-et0').textContent  = '3.5 mm/day';
    document.getElementById('rpt-temp').textContent = '—';
    document.getElementById('rpt-rain').textContent = '—';
    document.getElementById('rpt-weather-src').textContent = 'Open-Meteo unavailable — using April average';
  }
}

// ── Chart: Horizontal bar — waste by field ─────────────
function renderBarChart() {
  const ctx = document.getElementById('rpt-bar-chart').getContext('2d');
  reportCharts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SORTED_FIELDS.map(f => `${f.id} · ${f.cropShort}`),
      datasets: [{
        label: 'Waste score (%)',
        data: SORTED_FIELDS.map(f => f.wastePercent),
        backgroundColor: SORTED_FIELDS.map(f =>
          f.status === 'anomaly' ? 'rgba(226,75,74,0.85)' :
          f.status === 'warning' ? 'rgba(239,159,39,0.85)' :
                                   'rgba(99,153,34,0.85)'
        ),
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: '#f0f0f0' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          min: 0, max: 100
        },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

// ── Chart: Doughnut — status distribution ──────────────
function renderDoughnut() {
  const anomaly = FIELDS.filter(f => f.status === 'anomaly').length;
  const warning = FIELDS.filter(f => f.status === 'warning').length;
  const ok      = FIELDS.filter(f => f.status === 'ok').length;
  const ctx = document.getElementById('rpt-doughnut').getContext('2d');
  reportCharts.doughnut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Anomaly', 'Warning', 'Efficient'],
      datasets: [{
        data: [anomaly, warning, ok],
        backgroundColor: ['#E24B4A', '#EF9F27', '#639922'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 16 } }
      }
    }
  });
}

// ── Chart: Line — 7-day county water trend ─────────────
function renderTrendChart() {
  const totalActual = LABELS_7D.map((_, i) =>
    FIELDS.reduce((s, f) => s + (f.chartActual[i] || 0), 0)
  );
  const totalCWR = LABELS_7D.map((_, i) =>
    FIELDS.reduce((s, f) => s + (f.chartCWR[i] || 0), 0)
  );
  const ctx = document.getElementById('rpt-trend-chart').getContext('2d');
  reportCharts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: LABELS_7D,
      datasets: [
        {
          label: 'Total actual use',
          data: totalActual,
          borderColor: '#E24B4A',
          backgroundColor: 'rgba(226,75,74,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: 'Total CWR estimate',
          data: totalCWR,
          borderColor: '#639922',
          backgroundColor: 'transparent',
          borderDash: [5, 3],
          tension: 0.2,
          pointRadius: 2,
          borderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { font: { size: 11 }, boxWidth: 16, padding: 10 } }
      },
      scales: {
        x: { grid: { color: '#f8f8f8' }, ticks: { font: { size: 10 }, color: '#888' } },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { size: 10 }, color: '#888',
            callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k L' : v + ' L'
          }
        }
      }
    }
  });
}

// ── Chart: Bar — quota utilisation ─────────────────────
function renderQuotaChart() {
  const ctx = document.getElementById('rpt-quota-chart').getContext('2d');
  reportCharts.quota = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SORTED_FIELDS.map(f => f.id),
      datasets: [
        {
          label: 'Used this month',
          data: SORTED_FIELDS.map(f => f.usedThisMonth),
          backgroundColor: SORTED_FIELDS.map(f =>
            f.usedThisMonth / f.quota > 0.9 ? '#E24B4A' :
            f.usedThisMonth / f.quota > 0.6 ? '#EF9F27' : '#639922'
          ),
          borderRadius: 4
        },
        {
          label: 'Monthly quota',
          data: SORTED_FIELDS.map(f => f.quota),
          backgroundColor: 'rgba(0,0,0,0.06)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', align: 'end', labels: { font: { size: 11 }, boxWidth: 14, padding: 10 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { size: 10 }, color: '#888',
            callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v
          }
        }
      }
    }
  });
}

// ── Recommendations table ──────────────────────────────
const RECOMMENDATIONS = {
  'C-12': { urgency: 'Immediate', action: 'Dispatch field inspector. Meter location discrepancy and soil saturation suggest possible illegal diversion.' },
  'A-47': { urgency: 'Immediate', action: 'Issue cease-irrigation order. Soil is fully saturated per Sentinel-1. Investigate pipe integrity.' },
  'B-33': { urgency: 'High',      action: 'Inspect pipework. Irregular flow pattern consistent with a slow pipe leak.' },
  'A-22': { urgency: 'High',      action: 'Issue irrigation efficiency notice. Reschedule irrigation to early morning to reduce evaporative loss.' },
  'C-03': { urgency: 'Monitor',   action: 'Low-level monitoring. Usage elevated for one day only. Request meter self-report from farmer.' },
  'F-07': { urgency: 'Monitor',   action: 'Minor inefficiency. Advise soil moisture-based irrigation scheduling.' },
};

function renderRecommendations() {
  const tbody = document.getElementById('rpt-recommendations-body');
  tbody.innerHTML = '';
  SORTED_FIELDS.filter(f => f.status !== 'ok').forEach(f => {
    const rec   = RECOMMENDATIONS[f.id] || { urgency: 'Monitor', action: 'Review irrigation practice.' };
    const uCls  = rec.urgency === 'Immediate' ? 'urgency-immediate' : rec.urgency === 'High' ? 'urgency-high' : 'urgency-monitor';
    const tr    = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-bold">${f.id}</td>
      <td>${f.fullOwner}</td>
      <td>${f.cropShort} · ${f.area}</td>
      <td style="color:var(--color-anomaly)">+${f.wastePercent}%</td>
      <td><span class="urgency-badge ${uCls}">${rec.urgency}</span></td>
      <td style="font-size:11px;color:#555;max-width:260px">${rec.action}</td>
      <td><button class="btn-view" onclick="window.openDetail('${f.id}')">View</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Public entry point ─────────────────────────────────
export function renderReports() {
  destroyReportCharts();
  renderSummary();
  renderBarChart();
  renderDoughnut();
  renderTrendChart();
  renderQuotaChart();
  renderRecommendations();
  fetchWeather(); // async, updates DOM when done
}
