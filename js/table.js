// ══════════════════════════════════════════
// js/table.js — Fields table view logic
// ══════════════════════════════════════════

import { SORTED_FIELDS } from './data.js';

let anomalyFilterActive = false;
let tableSearchQuery = '';

export function renderTable() {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  const query = tableSearchQuery.toLowerCase();
  const rows = SORTED_FIELDS.filter(f => {
    if (
      query &&
      !f.id.toLowerCase().includes(query) &&
      !f.owner.toLowerCase().includes(query) &&
      !f.fullOwner.toLowerCase().includes(query)
    ) return false;
    if (anomalyFilterActive && f.status !== 'anomaly') return false;
    return true;
  });

  rows.forEach(f => {
    const rowClass =
      f.status === 'anomaly' ? 'row-anomaly' :
      f.status === 'warning' ? 'row-warning' : 'row-ok';
    const actualClass =
      f.status === 'anomaly' ? 'td-red' :
      f.status === 'warning' ? 'td-amber-text' : '';
    const soilClass =
      f.soilMoisture === 'Saturated' ? 'td-soil-sat' :
      f.soilMoisture === 'High' ? 'td-soil-high' : 'td-soil-normal';
    const statusPillClass =
      f.status === 'anomaly' ? 'anomaly' :
      f.status === 'warning' ? 'warning' : 'ok';
    const statusLabel =
      f.status === 'anomaly' ? 'Anomaly' :
      f.status === 'warning' ? 'Warning' : 'OK';
    const wastePct = Math.min(f.wastePercent, 100);

    const tr = document.createElement('tr');
    tr.className = rowClass;
    tr.innerHTML = `
      <td class="td-bold">${f.id}</td>
      <td>${f.owner}</td>
      <td>${f.cropShort}</td>
      <td>${f.area}</td>
      <td class="${actualClass}">${f.actual.toLocaleString()} L</td>
      <td class="td-gray">${f.cwr.toLocaleString()} L</td>
      <td>
        <div class="waste-bar-wrap">
          <div class="waste-bar-track">
            <div class="waste-bar-fill" style="width:${wastePct}%"></div>
          </div>
          <span style="color:var(--color-anomaly);font-weight:500">+${f.wastePercent}%</span>
        </div>
      </td>
      <td class="${soilClass}">${f.soilMoisture}</td>
      <td><span class="status-pill ${statusPillClass}">${statusLabel}</span></td>
      <td><button class="btn-view" onclick="window.openDetail('${f.id}')">View</button></td>
    `;
    tbody.appendChild(tr);
  });
}

export function filterTable() {
  tableSearchQuery = document.getElementById('search-input').value;
  renderTable();
}

export function toggleAnomalyFilter() {
  anomalyFilterActive = !anomalyFilterActive;
  document.getElementById('btn-anomaly-filter')
    .classList.toggle('inactive', !anomalyFilterActive);
  renderTable();
}

export function showAllRows() {
  anomalyFilterActive = false;
  document.getElementById('btn-anomaly-filter').classList.add('inactive');
  renderTable();
}

export function sortByWaste() {
  // Already sorted desc — re-sort and re-render
  SORTED_FIELDS.sort((a, b) => b.wastePercent - a.wastePercent);
  renderTable();
}

export function exportCSV() {
  const headers = ['Field ID', 'Owner', 'Crop', 'Area', 'Actual use (L)', 'CWR (L)', 'Waste %', 'Soil moisture', 'Status'];
  const rows = SORTED_FIELDS.map(f =>
    [f.id, f.owner, f.cropShort, f.area, f.actual, f.cwr, '+' + f.wastePercent + '%', f.soilMoisture, f.status].join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aquaguard_fields.csv';
  a.click();
  URL.revokeObjectURL(url);
}
