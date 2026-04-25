// ══════════════════════════════════════════
// js/settings.js — Settings & configuration
// ══════════════════════════════════════════

const STORAGE_KEY = 'aquaguard_settings';
import { applySettings } from './app.js';

const DEFAULTS = {
  inspectorName:   'Inspector Kovács',
  inspectorId:     'HU-PEST-0042',
  county:          'Pest County',
  role:            'Senior Water Inspector',
  anomalyThreshold: 40,
  warningThreshold: 15,
  sentinelHubKey:   '',
  refreshInterval:  '3600',
  emailAlerts:      true,
  digestEmail:      '',
};

let settings = { ...DEFAULTS };

// ── Load / Save ────────────────────────────────────────
function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    settings = { ...DEFAULTS, ...stored };
  } catch { settings = { ...DEFAULTS }; }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// ── API connection checks ──────────────────────────────
async function checkOpenMeteo() {
  const el = document.getElementById('api-openmeteo-status');
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=47.5&longitude=19.0&daily=et0_fao_evapotranspiration&timezone=Europe%2FBudapest&forecast_days=1',
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) { el.textContent = '✓ Connected'; el.className = 'api-status connected'; }
    else throw new Error();
  } catch { el.textContent = '✗ Unreachable'; el.className = 'api-status disconnected'; }
}

async function checkBackend() {
  const el = document.getElementById('api-backend-status');
  try {
    const res = await fetch('http://localhost:8000/api/stats/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) { el.textContent = '✓ Connected'; el.className = 'api-status connected'; }
    else throw new Error();
  } catch { el.textContent = '✗ Offline'; el.className = 'api-status disconnected'; }
}

function checkSentinelHub() {
  const key = settings.sentinelHubKey.trim();
  const el  = document.getElementById('api-sentinel-status');
  if (!key) { el.textContent = '⚠ No key configured'; el.className = 'api-status warning'; }
  else       { el.textContent = 'Key saved — unverified'; el.className = 'api-status warning'; }
}

// ── Populate form ──────────────────────────────────────
function populateForm() {
  document.getElementById('set-name').value          = settings.inspectorName;
  document.getElementById('set-id').value            = settings.inspectorId;
  document.getElementById('set-county').value        = settings.county;
  document.getElementById('set-role').value          = settings.role;
  document.getElementById('set-anomaly-thresh').value= settings.anomalyThreshold;
  document.getElementById('set-warning-thresh').value= settings.warningThreshold;
  document.getElementById('set-sentinel-key').value  = settings.sentinelHubKey;
  document.getElementById('set-refresh').value       = settings.refreshInterval;
  document.getElementById('set-email-alerts').checked= settings.emailAlerts;
  document.getElementById('set-digest').value        = settings.digestEmail;

  updateThresholdDisplay();
}

function updateThresholdDisplay() {
  document.getElementById('thresh-anomaly-val').textContent = settings.anomalyThreshold + '%';
  document.getElementById('thresh-warning-val').textContent = settings.warningThreshold + '%';
}

// ── Save button ────────────────────────────────────────
function collect() {
  settings.inspectorName    = document.getElementById('set-name').value.trim();
  settings.inspectorId      = document.getElementById('set-id').value.trim();
  settings.county           = document.getElementById('set-county').value.trim();
  settings.role             = document.getElementById('set-role').value.trim();
  settings.anomalyThreshold = parseInt(document.getElementById('set-anomaly-thresh').value) || 40;
  settings.warningThreshold = parseInt(document.getElementById('set-warning-thresh').value) || 15;
  settings.sentinelHubKey   = document.getElementById('set-sentinel-key').value.trim();
  settings.refreshInterval  = document.getElementById('set-refresh').value;
  settings.emailAlerts      = document.getElementById('set-email-alerts').checked;
  settings.digestEmail      = document.getElementById('set-digest').value.trim();
}

export function saveSettingsForm() {
  collect();
  saveSettings();
  // Update nav inspector label
  document.querySelector('.nav-inspector').textContent =
    `${settings.county} · ${settings.inspectorName}`;
  // Flash save confirmation
  const btn = document.getElementById('btn-save-settings');
  btn.textContent = 'Saved ✓';
  btn.style.background = '#EEFAD5';
  btn.style.color = '#27500A';

  applySettings();

  setTimeout(() => {
    btn.textContent = 'Save settings';
    btn.style.background = '';
    btn.style.color = '';
  }, 2000);
}

export function renderSettings() {
  loadSettings();
  populateForm();
  // Run async API checks
  checkOpenMeteo();
  checkBackend();
  checkSentinelHub();
}

// Expose save to window for the HTML button
window.saveSettingsForm = saveSettingsForm;

// Live threshold preview
document.addEventListener('DOMContentLoaded', () => {
  ['set-anomaly-thresh', 'set-warning-thresh'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      if (id === 'set-anomaly-thresh') document.getElementById('thresh-anomaly-val').textContent = el.value + '%';
      else document.getElementById('thresh-warning-val').textContent = el.value + '%';
    });
  });
});

export { settings };
