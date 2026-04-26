// ══════════════════════════════════════════
// js/data.js — AquaGuard field data
// Exports mutable bindings so app.js can
// hydrate them from the API at runtime.
// ══════════════════════════════════════════

export let FIELDS = [
  {
    id: "A-47",
    owner: "Tóth I.",
    fullOwner: "István Tóth",
    location: "Tóth Farm, Érd district",
    crop: "Winter wheat",
    cropShort: "Wheat",
    area: "4.2 ha",
    actual: 8740,
    cwr: 4950,
    ndvi: 0.61,
    ndviStage: "mid growth stage",
    soilMoisture: "Saturated",
    soilMoistureLevel: 88,
    daysFlagged: 4,
    status: "anomaly",
    wastePercent: 74,
    wasteDelta: 3790,
    quota: 120000,
    usedThisMonth: 98400,
    coordinates: [[19.05,47.48],[19.08,47.48],[19.08,47.46],[19.05,47.46],[19.05,47.48]],
    chartActual: [4200, 4800, 5500, 6100, 7200, 8100, 8740],
    chartCWR: [4800, 4850, 4900, 4920, 4940, 4945, 4950],
    alertDescription: "Wheat · Soil saturated · 8,740 L used",
    verdictText: "Consumption is <strong>74% above</strong> satellite crop water requirement. Soil is saturated per Sentinel-1. Farmer continues pumping. Possible causes: broken pipe, illegal diversion, or meter malfunction.",
    galileoTime: "25 Apr 07:58"
  },
  {
    id: "C-12",
    owner: "Nagy Bt.",
    fullOwner: "Nagy Bt.",
    location: "Nagy Farm, Gödöllő district",
    crop: "Sunflower",
    cropShort: "Sunflower",
    area: "6.1 ha",
    actual: 11200,
    cwr: 5850,
    ndvi: 0.55,
    ndviStage: "early growth stage",
    soilMoisture: "Saturated",
    soilMoistureLevel: 95,
    daysFlagged: 6,
    status: "anomaly",
    wastePercent: 91,
    wasteDelta: 5350,
    quota: 150000,
    usedThisMonth: 134400,
    coordinates: [[19.12,47.52],[19.16,47.52],[19.16,47.49],[19.12,47.49],[19.12,47.52]],
    chartActual: [5200, 6800, 7900, 8900, 9800, 10500, 11200],
    chartCWR: [5700, 5750, 5800, 5820, 5830, 5840, 5850],
    alertDescription: "Sunflower · Meter location flag",
    verdictText: "Consumption is <strong>91% above</strong> satellite crop water requirement. Soil fully saturated per Sentinel-1. Meter location discrepancy detected. Possible illegal diversion or meter tampering.",
    galileoTime: "25 Apr 07:42"
  },
  {
    id: "A-22",
    owner: "Varga Á.",
    fullOwner: "Ágnes Varga",
    location: "Varga Fields, Monor district",
    crop: "Corn",
    cropShort: "Corn",
    area: "5.5 ha",
    actual: 9900,
    cwr: 6300,
    ndvi: 0.72,
    ndviStage: "mid growth stage",
    soilMoisture: "High",
    soilMoistureLevel: 74,
    daysFlagged: 3,
    status: "anomaly",
    wastePercent: 58,
    wasteDelta: 3600,
    quota: 180000,
    usedThisMonth: 118800,
    coordinates: [[19.18,47.45],[19.22,47.45],[19.22,47.43],[19.18,47.43],[19.18,47.45]],
    chartActual: [5800, 6500, 7200, 7900, 8600, 9300, 9900],
    chartCWR: [6100, 6150, 6200, 6230, 6250, 6270, 6300],
    alertDescription: "Corn · High consumption 3 days",
    verdictText: "Consumption is <strong>58% above</strong> satellite crop water requirement. Soil moisture elevated per Sentinel-1. Inefficient irrigation schedule suspected. Three consecutive days above threshold.",
    galileoTime: "25 Apr 08:02"
  },
  {
    id: "B-33",
    owner: "Fekete Kft.",
    fullOwner: "Fekete Kft.",
    location: "Fekete Holdings, Vác district",
    crop: "Barley",
    cropShort: "Barley",
    area: "3.8 ha",
    actual: 7100,
    cwr: 4330,
    ndvi: 0.48,
    ndviStage: "late growth stage",
    soilMoisture: "High",
    soilMoistureLevel: 78,
    daysFlagged: 4,
    status: "anomaly",
    wastePercent: 63,
    wasteDelta: 2770,
    quota: 100000,
    usedThisMonth: 85200,
    coordinates: [[19.25,47.50],[19.29,47.50],[19.29,47.48],[19.25,47.48],[19.25,47.50]],
    chartActual: [3100, 4200, 5000, 5600, 6200, 6700, 7100],
    chartCWR: [4100, 4150, 4200, 4250, 4280, 4310, 4330],
    alertDescription: "Barley · Possible pipe leak",
    verdictText: "Consumption is <strong>63% above</strong> satellite crop water requirement. Soil moisture high per Sentinel-1. Pipe leak suspected based on irregular flow pattern. Field has been flagged for 4 consecutive days.",
    galileoTime: "25 Apr 07:51"
  },
  {
    id: "C-03",
    owner: "Kiss M.",
    fullOwner: "Márton Kiss",
    location: "Kiss Farm, Aszód district",
    crop: "Wheat",
    cropShort: "Wheat",
    area: "2.9 ha",
    actual: 5600,
    cwr: 4380,
    ndvi: 0.58,
    ndviStage: "mid growth stage",
    soilMoisture: "Normal",
    soilMoistureLevel: 52,
    daysFlagged: 1,
    status: "warning",
    wastePercent: 28,
    wasteDelta: 1220,
    quota: 90000,
    usedThisMonth: 67200,
    coordinates: [[18.98,47.53],[19.02,47.53],[19.02,47.51],[18.98,47.51],[18.98,47.53]],
    chartActual: [4000, 4300, 4700, 5000, 5200, 5400, 5600],
    chartCWR: [4200, 4250, 4290, 4320, 4340, 4360, 4380],
    alertDescription: "Wheat · Elevated usage 1 day",
    verdictText: "Consumption is <strong>28% above</strong> satellite crop water requirement. Soil moisture within normal range per Sentinel-1. Usage is elevated but not critical. Monitoring recommended.",
    galileoTime: "25 Apr 08:10"
  },
  {
    id: "F-07",
    owner: "Molnár R.",
    fullOwner: "Róbert Molnár",
    location: "Molnár Estate, Dabas district",
    crop: "Sunflower",
    cropShort: "Sunflower",
    area: "7.0 ha",
    actual: 8100,
    cwr: 6810,
    ndvi: 0.66,
    ndviStage: "mid growth stage",
    soilMoisture: "Normal",
    soilMoistureLevel: 55,
    daysFlagged: 0,
    status: "warning",
    wastePercent: 19,
    wasteDelta: 1290,
    quota: 200000,
    usedThisMonth: 97200,
    coordinates: [[19.08,47.55],[19.13,47.55],[19.13,47.53],[19.08,47.53],[19.08,47.55]],
    chartActual: [6500, 6900, 7100, 7400, 7700, 7900, 8100],
    chartCWR: [6600, 6650, 6700, 6730, 6760, 6790, 6810],
    alertDescription: "Sunflower · Slight overconsumption",
    verdictText: "Consumption is <strong>19% above</strong> satellite crop water requirement. Soil moisture normal per Sentinel-1. Minor inefficiency detected. No immediate action required but continued monitoring advised.",
    galileoTime: "25 Apr 08:06"
  },
  {
    id: "B-04",
    owner: "Szabó J.",
    fullOwner: "János Szabó",
    location: "Szabó Fields, Cegléd district",
    crop: "Wheat",
    cropShort: "Wheat",
    area: "3.1 ha",
    actual: 4200,
    cwr: 4000,
    ndvi: 0.64,
    ndviStage: "mid growth stage",
    soilMoisture: "Normal",
    soilMoistureLevel: 48,
    daysFlagged: 0,
    status: "ok",
    wastePercent: 5,
    wasteDelta: 200,
    quota: 100000,
    usedThisMonth: 50400,
    coordinates: [[18.92,47.47],[18.96,47.47],[18.96,47.45],[18.92,47.45],[18.92,47.47]],
    chartActual: [3800, 3900, 4000, 4050, 4100, 4150, 4200],
    chartCWR: [3850, 3900, 3930, 3950, 3970, 3990, 4000],
    alertDescription: "Wheat · Efficient usage",
    verdictText: "Consumption is <strong>5% above</strong> satellite crop water requirement. Soil moisture normal per Sentinel-1. Field is operating efficiently. No action required.",
    galileoTime: "25 Apr 08:00"
  },
  {
    id: "D-09",
    owner: "Horváth P.",
    fullOwner: "Péter Horváth",
    location: "Horváth Farm, Nagykőrös district",
    crop: "Corn",
    cropShort: "Corn",
    area: "5.8 ha",
    actual: 6480,
    cwr: 6000,
    ndvi: 0.70,
    ndviStage: "mid growth stage",
    soilMoisture: "Normal",
    soilMoistureLevel: 50,
    daysFlagged: 0,
    status: "ok",
    wastePercent: 8,
    wasteDelta: 480,
    quota: 170000,
    usedThisMonth: 77760,
    coordinates: [[19.30,47.46],[19.34,47.46],[19.34,47.44],[19.30,47.44],[19.30,47.46]],
    chartActual: [5700, 5900, 6050, 6150, 6250, 6380, 6480],
    chartCWR: [5800, 5850, 5900, 5930, 5960, 5985, 6000],
    alertDescription: "Corn · Efficient usage",
    verdictText: "Consumption is <strong>8% above</strong> satellite crop water requirement. Soil moisture normal per Sentinel-1. Field is operating within acceptable limits.",
    galileoTime: "25 Apr 07:55"
  }
];

// Lookup map: field id → field object
export let FIELD_MAP = {};
FIELDS.forEach(f => FIELD_MAP[f.id] = f);

// Pre-sorted by wastePercent descending
export let SORTED_FIELDS = [...FIELDS].sort((a, b) => b.wastePercent - a.wastePercent);

/**
 * Recalculate field statuses using thresholds from Settings.
 */
export function recalculateStatuses(anomalyThresh, warningThresh) {
  FIELDS.forEach(f => {
    f.wastePercent = Math.round(f.wastePercent); // ensure int
    if (f.wastePercent >= anomalyThresh) f.status = 'anomaly';
    else if (f.wastePercent >= warningThresh) f.status = 'warning';
    else f.status = 'ok';
  });
  SORTED_FIELDS = [...FIELDS].sort((a, b) => b.wastePercent - a.wastePercent);
}

/**
 * Replaces all three exports with API data.
 * Called by app.js after a successful fetch.
 * ES module live bindings ensure all importers
 * (map.js, table.js, detail.js) see the new values
 * automatically.
 */
export function updateData(newFields) {
  FIELDS = newFields;
  FIELD_MAP = {};
  FIELDS.forEach(f => FIELD_MAP[f.id] = f);
  SORTED_FIELDS = [...FIELDS].sort((a, b) => b.wastePercent - a.wastePercent);
}
