// ══════════════════════════════════════════
// js/app.js — AquaGuard main controller
// ══════════════════════════════════════════

import { FIELDS, updateData, recalculateStatuses }         from './data.js';
import { initMap, mapZoom, toggleFilter, refreshMap }    from './map.js';
import { renderTable, filterTable, toggleAnomalyFilter,
         showAllRows, sortByWaste, exportCSV }           from './table.js';
import { openDetail }                                    from './detail.js';
import { renderReports }                                 from './reports.js';
import { renderSettings, saveSettingsForm, settings }    from './settings.js';

// ── State ──
let currentView  = 'map';
let previousView = 'map';

// ── View switching ──────────────────────────────────────
export function showView(view) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  if (view === 'map') {
    show('view-map', 'flex');
    activate('tab-map');
    initMap();
  } else if (view === 'table') {
    show('view-table', 'flex');
    activate('tab-fields');
    renderTable();
  } else if (view === 'detail') {
    show('view-detail', 'flex');
  } else if (view === 'reports') {
    show('view-reports', 'flex');
    activate('tab-reports');
    renderReports();
  } else if (view === 'settings') {
    show('view-settings', 'flex');
    activate('tab-settings');
    renderSettings();
  }

  previousView          = currentView;
  currentView           = view;
  window.__currentView  = currentView;
  window.__previousView = previousView;
}

function show(id, display = 'flex') {
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); el.style.display = display; }
}
function activate(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

export function goBack() {
  showView(previousView === 'table' ? 'table' : 'map');
}

// ── Right sidebar anomaly alerts ────────────────────────
export function renderAnomalyAlerts() {
  const anomalies = FIELDS
    .filter(f => f.status === 'anomaly')
    .sort((a, b) => b.wastePercent - a.wastePercent);

  const container = document.getElementById('anomaly-alerts');
  container.innerHTML = '';

  anomalies.forEach(f => {
    const pct = Math.min(f.wastePercent, 100);
    const div = document.createElement('div');
    div.className = 'anomaly-alert';
    div.onclick   = () => openDetail(f.id);
    div.innerHTML = `
      <div class="anomaly-alert-name">Field ${f.id} &nbsp;<span style="color:var(--color-anomaly);font-size:11px;font-weight:600">+${f.wastePercent}%</span></div>
      <div class="anomaly-alert-desc">${f.alertDescription}</div>
      <div class="anomaly-progress-track">
        <div class="anomaly-progress-fill" style="width:${pct}%"></div>
      </div>
    `;
    container.appendChild(div);
  });

  // Update nav badge
  const badge = document.querySelector('.badge-anomaly');
  if (badge) badge.textContent = anomalies.length + ' anomalies';
}

// ── API hydration ────────────────────────────────────────
const API_URL = 'http://localhost:8000/api/fields/';

async function loadFieldsFromAPI() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    updateData(data.fields);
    recalculateStatuses(settings.anomalyThreshold, settings.warningThreshold);
    console.info(`[AquaGuard] Loaded ${data.fields.length} fields from API`);
  } catch (err) {
    console.warn('[AquaGuard] API unavailable — using static mock data.', err.message);
  }
}

// ── App-wide Settings Re-apply ─────────────────────────
export function applySettings() {
  recalculateStatuses(settings.anomalyThreshold, settings.warningThreshold);
  renderAnomalyAlerts();
  
  // Re-render whatever view is active
  if (currentView === 'map') refreshMap();
  if (currentView === 'table') renderTable();
  if (currentView === 'reports') renderReports();
}

// ── Expose on window (for HTML onclick= handlers) ───────
window.showView            = showView;
window.goBack              = goBack;
window.openDetail          = openDetail;
window.mapZoom             = mapZoom;
window.toggleFilter        = toggleFilter;
window.filterTable         = filterTable;
window.toggleAnomalyFilter = toggleAnomalyFilter;
window.showAllRows         = showAllRows;
window.sortByWaste         = sortByWaste;
window.exportCSV           = exportCSV;
window.saveSettingsForm    = saveSettingsForm;

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadFieldsFromAPI();
  renderAnomalyAlerts();
  showView('map');
});
