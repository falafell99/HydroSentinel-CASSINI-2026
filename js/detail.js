// ══════════════════════════════════════════
// js/detail.js — Field detail view logic
// ══════════════════════════════════════════

import { FIELD_MAP } from './data.js';

let detailChart = null;

export function openDetail(fieldId) {
  const f = FIELD_MAP[fieldId];
  if (!f) return;

  // Breadcrumb — currentView is managed by app.js; read via window
  const prevView = window.__currentView || 'map';
  window.__previousView = prevView;

  document.getElementById('bc-back').textContent =
    prevView === 'table' ? '← Fields' : '← Map';
  document.getElementById('bc-title').textContent =
    `Field ${f.id} — ${f.location}`;
  document.getElementById('detail-badge').textContent =
    `+${f.wastePercent}% over CWR`;

  // ── Metrics ──
  document.getElementById('metric-actual').textContent =
    f.actual.toLocaleString() + ' L';
  const yday = f.chartActual[f.chartActual.length - 2];
  document.getElementById('metric-actual-sub').textContent =
    `vs ${yday.toLocaleString()} L yesterday`;
  document.getElementById('metric-cwr').textContent =
    f.cwr.toLocaleString() + ' L';
  document.getElementById('metric-delta').textContent =
    `+${f.wasteDelta.toLocaleString()} L`;
  document.getElementById('metric-delta-sub').textContent =
    `${f.wastePercent}% over estimate`;
  document.getElementById('metric-days').textContent =
    f.daysFlagged + ' days';

  // ── Satellite — NDVI ──
  document.getElementById('sat-ndvi-value').textContent =
    f.ndvi.toFixed(2);
  document.getElementById('sat-ndvi-sub').textContent =
    `${f.cropShort} · ${f.ndviStage}`;
  document.getElementById('sat-ndvi-bar').style.width =
    Math.round(f.ndvi * 100) + '%';

  // ── Satellite — Soil moisture ──
  document.getElementById('sat-soil-value').textContent =
    f.soilMoisture;
  document.getElementById('sat-soil-value').className =
    'satellite-card-value ' +
    (f.soilMoisture === 'Saturated' || f.soilMoisture === 'High' ? 'red' : 'green');
  document.getElementById('sat-soil-sub').textContent =
    f.soilMoisture === 'Saturated' ? 'Soil already saturated' :
    f.soilMoisture === 'High'      ? 'Soil moisture elevated' :
                                     'Soil moisture normal';
  document.getElementById('sat-soil-bar').style.width =
    f.soilMoistureLevel + '%';
  document.getElementById('sat-soil-bar').className =
    'sat-progress-fill ' + (f.soilMoisture === 'Normal' ? 'green' : 'red');
  document.getElementById('sat-soil-note').textContent =
    f.soilMoisture === 'Normal'
      ? 'Normal irrigation possible'
      : 'No additional irrigation needed';

  // ── Verdict ──
  document.getElementById('verdict-text').innerHTML = f.verdictText;

  // ── Info rows ──
  document.getElementById('info-owner').textContent    = f.fullOwner;
  document.getElementById('info-crop').textContent     = f.crop;
  document.getElementById('info-area').textContent     = f.area;
  document.getElementById('info-quota').textContent    = f.quota.toLocaleString() + ' L/month';
  document.getElementById('info-used').textContent     = f.usedThisMonth.toLocaleString() + ' L';
  const remaining = f.quota - f.usedThisMonth;
  document.getElementById('info-remaining').textContent = remaining.toLocaleString() + ' L';

  // ── Galileo ──
  document.getElementById('galileo-text').textContent =
    `Meter GPS matches registered location. No tampering detected. Reading is authentic. Last signed: ${f.galileoTime}.`;

  // ── Action Panel ──
  document.getElementById('action-detail').textContent = f.recommendedAction || 'No action required';
  
  const urgencyEl = document.getElementById('action-urgency');
  urgencyEl.textContent = f.actionUrgency || 'None';
  urgencyEl.className = 'action-urgency ' + (f.actionUrgency ? f.actionUrgency.toLowerCase() : 'none');

  if (f.waterRecoveryEst > 0) {
    document.getElementById('action-recovery-container').style.display = 'flex';
    document.getElementById('action-recovery').textContent = `Est. potential recovery: ${f.waterRecoveryEst.toLocaleString()} L`;
  } else {
    document.getElementById('action-recovery-container').style.display = 'none';
  }

  // ── Chart ──
  renderDetailChart(f);

  // ── Switch view ──
  window.showView('detail');
}

function renderDetailChart(f) {
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }
  const ctx = document.getElementById('detail-chart').getContext('2d');
  detailChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['19 Apr', '20 Apr', '21 Apr', '22 Apr', '23 Apr', '24 Apr', '25 Apr'],
      datasets: [
        {
          label: 'Actual use',
          data: f.chartActual,
          borderColor: '#E24B4A',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#E24B4A',
          borderWidth: 2
        },
        {
          label: 'CWR estimate',
          data: f.chartCWR,
          borderColor: '#639922',
          backgroundColor: 'transparent',
          borderDash: [4, 3],
          tension: 0.2,
          pointRadius: 2,
          pointBackgroundColor: '#639922',
          borderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            font: { size: 11, family: 'system-ui,-apple-system,sans-serif' },
            boxWidth: 16,
            padding: 10
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f0f0f0', drawBorder: false },
          ticks: { font: { size: 10 }, color: '#888', maxRotation: 0 }
        },
        y: {
          grid: { color: '#f0f0f0', drawBorder: false },
          ticks: {
            font: { size: 10 },
            color: '#888',
            callback: (val) => {
              if (val >= 1000) return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k L';
              return val + ' L';
            }
          }
        }
      }
    }
  });
}
