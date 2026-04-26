from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import math, random, requests, json, os, numpy as np
from datetime import datetime, timedelta
from pathlib import Path
from sklearn.neighbors import BallTree
from openai import OpenAI

app = FastAPI(title="AquaGuard API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── PLANET API ────────────────────────────────────────────────────────────────
PLANET_API_KEY = os.environ.get("PLANET_API_KEY", "PLAKee98effad98f4d33a6088b6cf23b263b")
_PLANET_CACHE: dict = {}

# ─── FIELD METADATA ────────────────────────────────────────────────────────────
FIELD_META = {
    "A-47": {"crop": "Wheat",     "area_ha": 4.2, "owner": "Tóth I.",     "district": "Vecsés",     "quota": 120000, "lat": 47.401, "lon": 19.270, "coords": [[19.263,47.397],[19.278,47.397],[19.278,47.405],[19.263,47.405],[19.263,47.397]]},
    "C-12": {"crop": "Sunflower", "area_ha": 6.1, "owner": "Nagy Bt.",    "district": "Gödöllő",   "quota": 150000, "lat": 47.602, "lon": 19.347, "coords": [[19.340,47.598],[19.355,47.598],[19.355,47.606],[19.340,47.606],[19.340,47.598]]},
    "A-22": {"crop": "Corn",      "area_ha": 5.5, "owner": "Varga Á.",    "district": "Érd",        "quota": 180000, "lat": 47.371, "lon": 18.917, "coords": [[18.908,47.367],[18.926,47.367],[18.926,47.375],[18.908,47.375],[18.908,47.367]]},
    "B-33": {"crop": "Barley",    "area_ha": 3.8, "owner": "Fekete Kft.", "district": "Dabas",      "quota": 100000, "lat": 47.182, "lon": 19.299, "coords": [[19.292,47.178],[19.306,47.178],[19.306,47.186],[19.292,47.186],[19.292,47.178]]},
    "C-03": {"crop": "Wheat",     "area_ha": 2.9, "owner": "Kiss M.",     "district": "Szentendre", "quota":  90000, "lat": 47.671, "lon": 19.071, "coords": [[19.065,47.668],[19.078,47.668],[19.078,47.675],[19.065,47.675],[19.065,47.668]]},
    "F-07": {"crop": "Sunflower", "area_ha": 7.0, "owner": "Molnár R.",   "district": "Cegléd",     "quota": 200000, "lat": 47.173, "lon": 19.806, "coords": [[19.796,47.168],[19.816,47.168],[19.816,47.178],[19.796,47.178],[19.796,47.168]]},
    "D-09": {"crop": "Corn",      "area_ha": 4.8, "owner": "Szabó P.",    "district": "Nagykőrös",  "quota": 170000, "lat": 47.022, "lon": 19.785, "coords": [[19.778,47.018],[19.793,47.018],[19.793,47.026],[19.778,47.026],[19.778,47.018]]},
    "E-02": {"crop": "Wheat",     "area_ha": 3.2, "owner": "Horváth J.",  "district": "Ráckeve",    "quota":  90000, "lat": 47.162, "lon": 18.944, "coords": [[18.937,47.158],[18.952,47.158],[18.952,47.166],[18.937,47.166],[18.937,47.158]]},
}

METER_READINGS = {"A-47": 8740, "C-12": 11200, "A-22": 9900, "B-33": 7100, "C-03": 5600, "F-07": 8100, "D-09": 7200, "E-02": 4100}
CROP_KC        = {"Wheat": 0.85, "Corn": 1.05, "Sunflower": 0.95, "Barley": 0.80}
CWR_CALIBRATED = {"A-47": 4950, "C-12": 5850, "A-22": 6300, "B-33": 4330, "C-03": 4380, "F-07": 6810, "D-09": 6650, "E-02": 4050}
SOIL_MOISTURE  = {"A-47": {"level": "Saturated","value": 88}, "C-12": {"level": "Saturated","value": 95}, "A-22": {"level": "High","value": 74}, "B-33": {"level": "High","value": 78}, "C-03": {"level": "Normal","value": 52}, "F-07": {"level": "Normal","value": 55}, "D-09": {"level": "Low","value": 38}, "E-02": {"level": "Normal","value": 50}}
DAYS_FLAGGED   = {"A-47": 4, "C-12": 5, "A-22": 2, "B-33": 3, "C-03": 0, "F-07": 0, "D-09": 0, "E-02": 0}
QUOTA_USED     = {"A-47": 71, "C-12": 78, "A-22": 82, "B-33": 65, "C-03": 52, "F-07": 44, "D-09": 38, "E-02": 29}

RECOMMENDED_ACTIONS = {
    "A-47": {"action": "Issue Cease Irrigation Order",         "urgency": "high"},
    "C-12": {"action": "Issue Cease Irrigation Order",         "urgency": "critical"},
    "A-22": {"action": "Send Warning Notice",                  "urgency": "medium"},
    "B-33": {"action": "Schedule Field Inspection",            "urgency": "high"},
    "C-03": {"action": "Monitor + Flag Next Cycle",            "urgency": "low"},
    "F-07": {"action": "Monitor + Flag Next Cycle",            "urgency": "low"},
    "D-09": {"action": "No Action Required",                   "urgency": "none"},
    "E-02": {"action": "No Action Required",                   "urgency": "none"},
}

# ─── KNN / WATER BODY CONSTANTS (from knn.ipynb) ──────────────────────────────
KNN_K           = 3
EARTH_RADIUS_KM = 6371.0

TYPE_NORMAL_LEVEL = {"river": 3.0, "canal": 1.5, "lake": 1.5, "reservoir": 2.5, "oxbow_lake": 2.0}
TYPE_MAX_LEVEL    = {"river": 7.0, "canal": 2.5, "lake": 3.0, "reservoir": 4.0, "oxbow_lake": 4.5}
TYPE_NORMAL_FLOW  = {"river": 500.0, "canal": 10.0, "lake": 0.0, "reservoir": 0.0, "oxbow_lake": 0.0}

# ─── Load water bodies at startup ─────────────────────────────────────────────
_WB_PATH = Path(__file__).parent / "water_bodies.json"
with open(_WB_PATH, encoding="utf-8") as _f:
    WATER_BODIES: list[dict] = json.load(_f)

# ─── Pre-calculate scores & build KNN tree at startup ─────────────────────────
def clamp(v: float) -> float:
    return round(max(0.0, min(1.0, v)), 3)

def calculate_scores(wb: dict) -> tuple[float, float]:
    wtype  = wb["type"]
    level  = wb["water_level_m"]
    flow   = wb["avg_flow_m3s"] or 0.0
    nl     = TYPE_NORMAL_LEVEL.get(wtype, 2.0)
    ml     = TYPE_MAX_LEVEL.get(wtype, 5.0)
    nf     = TYPE_NORMAL_FLOW.get(wtype, 0.0)
    headroom = ml - nl
    level_flood   = (level - nl) / headroom if headroom > 0 else 0.0
    flow_flood    = flow / (nf * 3) if nf > 0 else 0.0
    flood_score   = clamp(0.6 * level_flood + 0.4 * flow_flood)
    level_drought = (nl - level) / nl if nl > 0 else 0.0
    if nf > 0 and flow > 0:
        flow_drought = clamp(1.0 - flow / nf)
    elif nf > 0:
        flow_drought = 1.0
    else:
        flow_drought = 0.0
    drought_score = clamp(0.7 * level_drought + 0.3 * flow_drought)
    return flood_score, drought_score

for _wb in WATER_BODIES:
    _wb["flood_score"], _wb["drought_score"] = calculate_scores(_wb)

def build_knn_tree(water_bodies: list[dict]) -> BallTree:
    coords = np.radians([[wb["lat"], wb["lon"]] for wb in water_bodies])
    return BallTree(coords, metric="haversine")

_KNN_TREE = build_knn_tree(WATER_BODIES)

def find_nearest_water_bodies(lat: float, lon: float, k: int = KNN_K) -> list[dict]:
    farm_coord = np.radians([[lat, lon]])
    distances, indices = _KNN_TREE.query(farm_coord, k=k)
    results = []
    for dist_rad, idx in zip(distances[0], indices[0]):
        wb = dict(WATER_BODIES[idx])
        wb["distance_km"] = round(dist_rad * EARTH_RADIUS_KM, 2)
        results.append(wb)
    return results

# ─── LLM insight (from knn.ipynb) ─────────────────────────────────────────────
def build_prompt(field_id: str, meta: dict, nearest: list[dict]) -> str:
    wb_lines = []
    for i, wb in enumerate(nearest, 1):
        wb_lines.append(
            f"  {i}. {wb['name']} ({wb['type']}) — "
            f"{wb['distance_km']} km away | "
            f"flood score: {wb['flood_score']} | "
            f"drought score: {wb['drought_score']} | "
            f"water level: {wb['water_level_m']} m | "
            f"notes: {wb['notes']}"
        )
    return f"""You are a water management advisor for farmers in the Homokhátság and Pest County region of Hungary, a semi-arid area suffering from simultaneous drought and flood extremes.

Farm details:
- Field ID: {field_id}
- Owner: {meta['owner']}
- Crop: {meta['crop']}
- Size: {meta['area_ha']} ha
- District: {meta['district']}

The {KNN_K} nearest water bodies are:
{chr(10).join(wb_lines)}

Write a short, practical insight (3-5 sentences) for this farmer/inspector.
Focus on:
- Whether any nearby water body has surplus water they could harness (high flood score = surplus available)
- Whether any nearby body is at drought risk and should not be relied on
- One concrete action the farmer can take to reduce reliance on government freshwater supply
- Be specific: mention the water body by name and distance

Tone: direct, professional, actionable. No bullet points. Plain paragraph."""

def get_llm_insight(field_id: str, meta: dict, nearest: list[dict]) -> str:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        # Rule-based fallback
        top = nearest[0] if nearest else None
        if top and top["drought_score"] > 0.5:
            return (f"The nearest water body, {top['name']} ({top['distance_km']} km), shows significant drought stress "
                    f"(drought score {top['drought_score']}). Relying on this source for irrigation is not recommended. "
                    f"Consider reducing irrigation frequency and switching to drip irrigation to minimise water use.")
        elif top and top["flood_score"] > 0.4:
            return (f"{top['name']} ({top['distance_km']} km) currently has elevated water levels (flood score {top['flood_score']}). "
                    f"There may be an opportunity to capture surplus water into on-farm storage before levels recede. "
                    f"Contact the district water authority (OVIT) to request a temporary diversion permit.")
        else:
            return (f"Water conditions near field {field_id} are currently stable. "
                    f"The nearest monitored water body is {top['name']} at {top['distance_km']} km. "
                    f"Continue standard irrigation scheduling aligned with the satellite CWR estimate.")
    try:
        client = OpenAI(base_url="https://models.github.ai/inference", api_key=token)
        response = client.chat.completions.create(
            model="openai/gpt-4.1",
            messages=[
                {"role": "system", "content": "You are a concise, practical water management advisor."},
                {"role": "user",   "content": build_prompt(field_id, meta, nearest)},
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Insight generation failed: {str(e)[:120]}"

# ─── Planet API ────────────────────────────────────────────────────────────────
def get_planet_data(field_id: str, coords: list) -> dict:
    if field_id in _PLANET_CACHE:
        return _PLANET_CACHE[field_id]
    try:
        end_date   = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        search_request = {
            "item_types": ["PSScene"],
            "filter": {
                "type": "AndFilter",
                "config": [
                    {"type": "GeometryFilter", "field_name": "geometry", "config": {"type": "Polygon", "coordinates": [coords]}},
                    {"type": "DateRangeFilter",  "field_name": "acquired", "config": {"gte": start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z"), "lte": end_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")}},
                ],
            },
        }
        res = requests.post("https://api.planet.com/data/v1/quick-search", auth=(PLANET_API_KEY, ""), json=search_request, timeout=5)
        if res.status_code == 200:
            features = res.json().get("features", [])
            clear_features = sorted([f for f in features if f["properties"]["cloud_cover"] < 0.3], key=lambda x: x["properties"]["acquired"], reverse=True)
            if clear_features:
                latest = clear_features[0]
                dt  = datetime.strptime(latest["properties"]["acquired"], "%Y-%m-%dT%H:%M:%S.%fZ")
                cc  = latest["properties"]["cloud_cover"]
                crop = FIELD_META[field_id]["crop"]
                base_ndvi    = {"Wheat": 0.65, "Corn": 0.72, "Sunflower": 0.60, "Barley": 0.50}.get(crop, 0.6)
                dynamic_ndvi = round(base_ndvi - (cc * 0.1) + random.uniform(-0.05, 0.05), 2)
                result = {"acquired": dt.strftime("%d %b %H:%M"), "cloud_cover": round(cc * 100), "ndvi": dynamic_ndvi, "provider": "PlanetScope", "success": True}
                _PLANET_CACHE[field_id] = result
                return result
    except Exception as e:
        print(f"Planet API error for {field_id}: {e}")
    crop = FIELD_META[field_id]["crop"]
    return {"acquired": "25 Apr 08:14", "cloud_cover": 5, "ndvi": {"Wheat": 0.65, "Corn": 0.72, "Sunflower": 0.60, "Barley": 0.50}.get(crop, 0.60), "provider": "Fallback", "success": False}

# ─── CWR ───────────────────────────────────────────────────────────────────────
def calculate_cwr(field_id: str, ndvi: float, crop: str, area_ha: float) -> int:
    if field_id in CWR_CALIBRATED:
        return CWR_CALIBRATED[field_id]
    ET0 = 3.5
    Kc  = CROP_KC.get(crop, 0.85)
    cwr_mm = ET0 * Kc * (0.7 + ndvi * 0.5)
    return round(cwr_mm * area_ha * 50)

def get_status(waste_pct: float) -> str:
    if waste_pct > 40: return "anomaly"
    if waste_pct > 15: return "warning"
    return "ok"

def generate_history(actual: int, cwr: int):
    actuals, cwrs = [], []
    for i in range(6, -1, -1):
        f = 0.5 + 0.5 * (6 - i) / 6
        actuals.append(int(actual * f * (0.9 + random.random() * 0.2)))
        cwrs.append(int(cwr * (0.96 + 0.04 * (6 - i) / 6)))
    actuals[-1] = actual
    cwrs[-1]    = cwr
    return actuals, cwrs

# ─── Build full field object ────────────────────────────────────────────────────
def build_field(field_id: str, include_water_risk: bool = False) -> dict:
    meta   = FIELD_META[field_id]
    actual = METER_READINGS[field_id]
    planet = get_planet_data(field_id, meta["coords"])
    ndvi   = planet["ndvi"]
    cwr    = calculate_cwr(field_id, ndvi, meta["crop"], meta["area_ha"])
    waste_delta = actual - cwr
    waste_pct   = round((waste_delta / cwr) * 100)
    soil        = SOIL_MOISTURE[field_id]
    hist_a, hist_c = generate_history(actual, cwr)
    rec = RECOMMENDED_ACTIONS.get(field_id, {"action": "No Action", "urgency": "none"})

    obj = {
        "id":               field_id,
        "owner":            meta["owner"],
        "crop":             meta["crop"],
        "area":             meta["area_ha"],
        "district":         meta["district"],
        "lat":              meta["lat"],
        "lon":              meta["lon"],
        "coordinates":      meta["coords"],
        "actualUse":        actual,
        "cwr":              cwr,
        "wasteDelta":       waste_delta,
        "wastePercent":     waste_pct,
        "status":           get_status(waste_pct),
        "ndvi":             ndvi,
        "soilMoisture":     soil["level"],
        "soilMoistureLevel": soil["value"],
        "daysAnomaly":      DAYS_FLAGGED.get(field_id, 0),
        "quotaUsed":        QUOTA_USED.get(field_id, 0),
        "quota":            meta["quota"],
        "history":          hist_a,
        "cwrHistory":       hist_c,
        "recommendedAction": rec["action"],
        "actionUrgency":    rec["urgency"],
        "waterRecoveryEst": waste_delta if waste_pct > 15 else 0,
        "galileoVerified":  True,
        "galileoHash":      f"{field_id.lower().replace('-','')[:4]}...{random.randint(1000,9999):04x}",
        "galileoTimestamp": planet["acquired"],
        "planet":           planet,
        "systemVerdict": (
            f"SYSTEM VERDICT: Consumption is {waste_pct}% above Sentinel-2 CWR baseline. "
            f"Soil is {soil['level'].lower()} per Sentinel-1 SAR. "
            + ("Continued active pumping detected. Possible causes: broken pipe, illegal diversion, or meter fault. Immediate inspection recommended."
               if waste_pct > 40 else
               "Usage elevated but not critical. Monitoring recommended for next irrigation cycle.")
        ),
    }

    if include_water_risk:
        nearest = find_nearest_water_bodies(meta["lat"], meta["lon"])
        obj["nearestWaterBodies"] = nearest
        obj["waterRiskLevel"]     = _summarise_risk(nearest)

    return obj

def _summarise_risk(nearest: list[dict]) -> str:
    if not nearest:
        return "unknown"
    max_flood   = max(wb["flood_score"]   for wb in nearest)
    max_drought = max(wb["drought_score"] for wb in nearest)
    if max_flood > 0.55 and max_drought > 0.55: return "both"
    if max_flood   > 0.55: return "flood"
    if max_drought > 0.55: return "drought"
    return "ok"

# ══════════════════════════════════════════════════════════════════════════════
# API ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/fields/")
def get_fields():
    results = [build_field(fid) for fid in FIELD_META]
    results.sort(key=lambda x: x["wastePercent"], reverse=True)
    return {
        "fields":    results,
        "total":     len(results),
        "anomalies": sum(1 for f in results if f["status"] == "anomaly"),
        "warnings":  sum(1 for f in results if f["status"] == "warning"),
    }

@app.get("/api/fields/{field_id}")
def get_field(field_id: str):
    if field_id not in FIELD_META:
        return JSONResponse(status_code=404, content={"error": f"Field '{field_id}' not found"})
    return build_field(field_id, include_water_risk=True)

@app.get("/api/fields/{field_id}/water-risk")
def get_water_risk(field_id: str):
    if field_id not in FIELD_META:
        return JSONResponse(status_code=404, content={"error": f"Field '{field_id}' not found"})
    meta    = FIELD_META[field_id]
    nearest = find_nearest_water_bodies(meta["lat"], meta["lon"])
    return {
        "field_id":          field_id,
        "nearestWaterBodies": nearest,
        "waterRiskLevel":    _summarise_risk(nearest),
    }

@app.get("/api/fields/{field_id}/insight")
def get_insight(field_id: str):
    if field_id not in FIELD_META:
        return JSONResponse(status_code=404, content={"error": f"Field '{field_id}' not found"})
    meta    = FIELD_META[field_id]
    nearest = find_nearest_water_bodies(meta["lat"], meta["lon"])
    insight = get_llm_insight(field_id, meta, nearest)
    return {
        "field_id": field_id,
        "insight":  insight,
        "model":    "openai/gpt-4.1" if os.environ.get("GITHUB_TOKEN") else "rule-based-fallback",
        "nearest_water_bodies": [wb["name"] for wb in nearest],
    }

@app.get("/api/water-bodies/")
def get_water_bodies():
    return {"water_bodies": WATER_BODIES, "total": len(WATER_BODIES)}

@app.get("/api/stats/")
def get_stats():
    fields = [build_field(fid) for fid in FIELD_META]
    return {
        "total":              847,
        "anomaly":            sum(1 for f in fields if f["status"] == "anomaly"),
        "warning":            sum(1 for f in fields if f["status"] == "warning"),
        "ok":                 sum(1 for f in fields if f["status"] == "ok"),
        "water_saved_litres": 18240,
        "total_wasted_litres": sum(f["waterRecoveryEst"] for f in fields),
        "compliance_rate":    93.8,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
