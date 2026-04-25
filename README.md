# cassini-zakaz-somsa

## Links to data sources



## Problem

Hungary has both drought and flood pressure at the same time. The MVP should help water inspectors and farm owners spot where water is being wasted, where fields are under stress, and where drainage or leakage problems should be checked first.

## Product goal

Build a geospatial decision system that combines satellite imagery, weather, registry data, and meter readings to rank farms by water-risk and water-waste suspicion.

## Pilot region

Primary rollout focus is the Homokhatsag region (Danube-Tisza Interfluve), where drought pressure and groundwater decline are severe.

## MVP scope

### In scope

- Sentinel-2 crop monitoring with NDVI and vegetation stress signals.
- Sentinel-1 soil wetness and flood-override detection.
- Farm boundary matching against the Hungarian registry.
- Waste score per field and per farm.
- Map view with colored risk layers.
- Automatic alerts for inspectors when thresholds are crossed.
- Meter attestation with Galileo OSNMA and GPS timestamp.

### Out of scope for MVP

- Fully automated enforcement.
- Nationwide real-time coverage for every field every minute.
- Deep crop-specific agronomy recommendations.
- Manual image annotation pipelines for model training at scale.

## System design

### Core idea

Treat every farm as a geospatial entity with a boundary, a history of observations, and a score. The platform compares what satellites say the field likely needed with what the meter says was actually used.

### High-level flow

1. Ingest satellite imagery, weather, registry data, drainage maps, and meter readings.
2. Normalize everything into field-level geospatial records.
3. Run feature extraction on each field.
4. Compute crop need, soil wetness, flood risk, and waste score.
5. Store results in a geospatial database.
6. Trigger alerts and expose the results in a map UI.

### Data sources

<!-- - Sentinel-2: vegetation health, crop stress, canopy change. -->
- Sentinel-1: surface wetness, flood detection, rain aftermath.
- Hungarian farmers' registry: farm identity, parcel boundaries, owner metadata.
- Weather: rain, wind, solar days, temperature, evaporation proxies.
- Drainage maps: infrastructure overlaps and suspected leak zones.
- Meter telemetry: irrigation volume, GPS proof, time, OSNMA signature.

### Processing pipeline

- Ingestion service downloads new source data on a schedule and stores raw files.
- Geospatial normalization service clips imagery to farm polygons and aligns timestamps.
- Feature service calculates NDVI, wetness index, rainfall deltas, and anomaly signals.
- Scoring service combines features into a waste score and a risk score.
- Alert service sends email or dashboard notifications when thresholds are crossed.

### Scoring model

The MVP can start with transparent rules before moving to ML.

- Water need estimate = crop type + growth stage + weather + recent soil moisture.
- Actual use = meter reading for the same time window.
- Waste score = actual use - estimated need.
- Risk score = waste score + flood exposure + drainage mismatch + repeated anomalies.

Use a simple 0-100 normalized score at first so inspectors can rank fields quickly.

### Meter trust model

Meter readings should be signed with Galileo OSNMA metadata and a GPS timestamp. The platform should reject or downgrade readings that fail one of these checks:

- No valid OSNMA proof.
- Location outside the registered farm boundary.
- Timestamp outside the allowed reporting window.
- Sudden volume jump inconsistent with weather and crop need.

### Suggested architecture

- Frontend: map-based inspector dashboard and farmer portal.
- API layer: farm lookup, scoring, alerts, audit log, and exports.
- Geospatial store: PostGIS for parcels, boundaries, and score overlays.
- Object storage: raw Sentinel scenes, derived raster tiles, and audit artifacts.
- Stream or job queue: scheduled ingestion and async scoring jobs.
- Analytics store: time-series history of scores and meter events.


### Data and storage

- PostGIS for parcel geometry, field history, and score lookups.
- S3-compatible object storage for raw satellite scenes and derived rasters.
- Redis for short-lived cache, throttling, and job coordination.
- TimescaleDB or plain Postgres tables for meter and score history.

### Geospatial and ML

- Rasterio and GDAL for raster clipping and alignment.
- xarray and rioxarray for multi-band satellite processing.
- scikit-learn for the first rule-based plus statistical anomaly models.
- PyTorch later if we need a more advanced crop-stress model.

### Infrastructure

- GitHub Actions for CI.
- OpenTelemetry for tracing ingestion and scoring jobs.
- Terraform later if we want repeatable cloud infrastructure.

### Why this stack

This stack is strong for geospatial work, has a clear path from MVP to production, and keeps the first version explainable instead of over-engineered.

## User stories

### Inspector

- As an inspector, I want to see the worst fields first so I can visit the highest-risk farms today.
- As an inspector, I want to click a red field and see the evidence behind the score.
- As an inspector, I want to receive an alert when a farm keeps pumping water while the soil is already wet.

### Farmer

- As a farmer, I want to see my own efficiency score so I can avoid penalties.
- As a farmer, I want to know when a field looks stressed so I can act earlier.

### Government user

- As a regional authority user, I want a heatmap of water stress and water waste across the county.
- As a regional authority user, I want exports for planning quotas and subsidy decisions.

## Core features

### 1. Waste score

Actual use minus satellite estimate. Large positive gap means likely waste or fraud.

### 2. Field map

Each registered farm appears on a map with a color-coded risk state.

### 3. Auto alert

Send an email or notification when a field crosses a configurable threshold.

### 4. Meter auth

Verify meter readings with OSNMA and GPS proof to reduce spoofing.

## Success metrics

- Percent of risky fields found before manual inspection.
- Mean time from anomaly detection to inspector alert.
- Alert precision measured by confirmed field visits.
- Reduction in repeated false-positive alerts.
- Coverage of registered parcels with valid scores.

## Risks and dependencies

- Satellite revisit timing may miss fast-changing local events.
- Registry parcel boundaries may be outdated or inconsistent.
- Cloud cover affects Sentinel-2 quality, so Sentinel-1 fallback is required.
- OSNMA availability and device support may constrain meter rollout.
- Ground-truth labels will be limited at first, so rule-based scoring should remain explainable.

## MVP delivery plan

1. Build the geospatial data model and registry import.
2. Add Sentinel-2 and Sentinel-1 ingestion for Homokhatsag as the pilot region.
3. Implement the first waste score and risk score rules.
4. Ship the inspector map and alert workflow.
5. Add OSNMA-based meter validation.
6. Compare predictions with field visits and refine thresholds.

## Open questions

- Which sub-area inside Homokhatsag should be phase 1 (for example, 2-3 microregions)?
- What registry format is available for parcel boundaries?
- Which meter hardware can already emit signed GPS-aware readings?
- What alert threshold should count as high risk for the first rollout?

## Design files

- [Architecture diagram](design/architecture.puml)
- [Domain class diagram](design/domain-class.puml)
- [Selected-day prediction sequence](design/selected-day-sequence.puml)
- [Inspector dashboard UI](design/ui-dashboard.puml)
- [Forecast comparison flow](design/forecast-comparison.puml)

## useful links:
 - https://www.vizugy.hu/
 - https://data.vizugy.hu/
 - https://www.ksh.hu/agriculture
 - https://www.ncdc.noaa.gov/cdo-web/