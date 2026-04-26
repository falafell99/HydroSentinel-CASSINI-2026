// ══════════════════════════════════════════
// js/map.js — Leaflet map with satellite layer toggles
// ══════════════════════════════════════════

import { FIELDS } from './data.js';

let mapInstance   = null;
let mapInitialized = false;
let layerGroups   = { ok: null, warning: null, anomaly: null };
let fieldPolygons = []; // [{field, polygon}]
let meterLayer    = null;
let filterStates  = { ok: true, warning: true, anomaly: true };
let displayMode   = 'status'; // 'status' | 'ndvi' | 'soil'

const STATUS_STYLES = {
  anomaly: { fillColor: '#E24B4A', fillOpacity: 0.45, color: '#A32D2D', weight: 2 },
  warning: { fillColor: '#EF9F27', fillOpacity: 0.40, color: '#BA7517', weight: 1.5 },
  ok:      { fillColor: '#639922', fillOpacity: 0.40, color: '#3B6D11', weight: 1 }
};

// ── Colour helpers ──────────────────────────────────────
function ndviColor(ndvi) {
  // 0.3 → red, 0.75 → green
  const t = Math.max(0, Math.min(1, (ndvi - 0.3) / 0.45));
  const r = Math.round(220 * (1 - t) + 34  * t);
  const g = Math.round( 60 * (1 - t) + 160 * t);
  const b = Math.round( 50 * (1 - t) + 34  * t);
  return `rgb(${r},${g},${b})`;
}

function soilColor(moisture) {
  return moisture === 'Saturated' ? '#1a5cb5'
       : moisture === 'High'      ? '#4a8fd4'
       :                            '#9ecae1';
}

function applyDisplayMode() {
  fieldPolygons.forEach(({ field, polygon }) => {
    if (displayMode === 'ndvi') {
      polygon.setStyle({ fillColor: ndviColor(field.ndvi), fillOpacity: 0.75, color: '#555', weight: 1 });
    } else if (displayMode === 'soil') {
      polygon.setStyle({ fillColor: soilColor(field.soilMoisture), fillOpacity: 0.75, color: '#1a4a8a', weight: 1 });
    } else {
      polygon.setStyle({ ...STATUS_STYLES[field.status] });
    }
  });
}

// ── Map init ────────────────────────────────────────────
export function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  mapInstance = L.map('map', { center: [47.5, 19.0], zoom: 9, zoomControl: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 18
  }).addTo(mapInstance);

  meterLayer = L.layerGroup(); // not added until checkbox ticked

  addFieldPolygons();
  wireCheckboxes();
  updateSidebarCounts();
}

// ── Map Refresh (on settings change) ────────────────────
export function refreshMap() {
  if (!mapInstance) return;
  layerGroups.ok.clearLayers();
  layerGroups.warning.clearLayers();
  layerGroups.anomaly.clearLayers();
  meterLayer.clearLayers();
  fieldPolygons = [];
  addFieldPolygons();
  applyDisplayMode();
  updateSidebarCounts();
}

function updateSidebarCounts() {
  const ok = FIELDS.filter(f => f.status === 'ok').length;
  const warn = FIELDS.filter(f => f.status === 'warning').length;
  const anom = FIELDS.filter(f => f.status === 'anomaly').length;
  
  const elOk = document.querySelector('#filter-ok .filter-count');
  const elWarn = document.querySelector('#filter-warning .filter-count');
  const elAnom = document.querySelector('#filter-anomaly .filter-count');
  
  if (elOk) elOk.textContent = ok;
  if (elWarn) elWarn.textContent = warn;
  if (elAnom) elAnom.textContent = anom;
}

// ── Satellite layer checkbox wiring ────────────────────
function wireCheckboxes() {
  const ndviCb  = document.getElementById('layer-ndvi');
  const soilCb  = document.getElementById('layer-soil');
  const meterCb = document.getElementById('layer-meters');

  function refresh() {
    if (ndviCb && ndviCb.checked)       displayMode = 'ndvi';
    else if (soilCb && soilCb.checked)  displayMode = 'soil';
    else                                 displayMode = 'status';
    applyDisplayMode();
  }

  ndviCb  && ndviCb .addEventListener('change', refresh);
  soilCb  && soilCb .addEventListener('change', refresh);

  meterCb && meterCb.addEventListener('change', () => {
    if (meterCb.checked) meterLayer.addTo(mapInstance);
    else mapInstance.removeLayer(meterLayer);
  });
}

// ── Field polygons ──────────────────────────────────────
function addFieldPolygons() {
  layerGroups.ok      = L.layerGroup().addTo(mapInstance);
  layerGroups.warning = L.layerGroup().addTo(mapInstance);
  layerGroups.anomaly = L.layerGroup().addTo(mapInstance);
  fieldPolygons = [];

  FIELDS.forEach(f => {
    const latlngs = f.coordinates.slice(0, -1).map(([lng, lat]) => [lat, lng]);
    const polygon = L.polygon(latlngs, { ...STATUS_STYLES[f.status] });

    polygon.on('mouseover', function () {
      this.setStyle({ fillOpacity: Math.min(0.9, (this.options.fillOpacity || 0.45) + 0.25) });
    });
    polygon.on('mouseout', function () {
      const base = displayMode === 'status' ? STATUS_STYLES[f.status].fillOpacity : 0.75;
      this.setStyle({ fillOpacity: base });
    });
    polygon.on('click', function (e) {
      showFieldPopup(f, e.latlng);
      mapInstance.flyTo(e.latlng, 12, { duration: 1.2 });
    });

    layerGroups[f.status].addLayer(polygon);
    fieldPolygons.push({ field: f, polygon });

    // Meter marker (centroid)
    const coords  = f.coordinates.slice(0, -1);
    const avgLat  = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    const avgLng  = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const markerColor = f.status === 'anomaly' ? '#E24B4A' : f.status === 'warning' ? '#EF9F27' : '#639922';
    const marker = L.circleMarker([avgLat, avgLng], {
      radius: 7, fillColor: markerColor, fillOpacity: 1, color: '#fff', weight: 2
    }).bindTooltip(`Meter ${f.id} · ${f.owner}`);
    meterLayer.addLayer(marker);
  });
}

function showFieldPopup(f, latlng) {
  const wc = f.status === 'anomaly' ? '#A32D2D' : f.status === 'warning' ? '#BA7517' : '#27500A';
  L.popup({ maxWidth: 250 })
    .setLatLng(latlng)
    .setContent(`
      <div style="font-weight:600;font-size:13px;margin-bottom:6px">Field ${f.id}</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;margin-top:3px"><span>Owner</span><strong style="color:#111">${f.fullOwner}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;margin-top:3px"><span>Crop</span><strong style="color:#111">${f.cropShort}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;margin-top:3px"><span>Actual use</span><strong style="color:#111">${f.actual.toLocaleString()} L</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;margin-top:3px"><span>NDVI</span><strong style="color:#27500A">${f.ndvi}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;margin-top:3px"><span>Soil</span><strong style="color:#27500A">${f.soilMoisture}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;margin-top:3px"><span>Waste score</span><strong style="color:${wc}">+${f.wastePercent}%</strong></div>
      <button onclick="window.openDetail('${f.id}')" style="margin-top:8px;width:100%;padding:6px 0;font-size:11px;border:1px solid #e5e5e5;border-radius:6px;background:#fff;cursor:pointer;font-family:inherit;">Open field detail ↗</button>
    `)
    .openOn(mapInstance);
}

// ── Zoom & filter ───────────────────────────────────────
export function mapZoom(dir) {
  if (!mapInstance) return;
  mapInstance.setZoom(mapInstance.getZoom() + dir);
}

export function toggleFilter(status) {
  filterStates[status] = !filterStates[status];
  document.getElementById('filter-' + status).classList.toggle('inactive', !filterStates[status]);
  if (filterStates[status]) mapInstance.addLayer(layerGroups[status]);
  else mapInstance.removeLayer(layerGroups[status]);
}
