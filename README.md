# AquaGuard

Water-use inspection dashboard for Hungarian farms.

## Project outline

- `frontend/` - React + Vite dashboard. Main UI lives in `frontend/src/components/`.
- `backend/` - FastAPI app with field risk, water-body, insight, and stats endpoints.
- `api/` - Vercel entrypoint that exposes `backend.main.app`.
- `v1-backend/` - legacy prototype and reference data.

## Core signals

- Sentinel-2: NDVI-based crop demand estimate.
- Sentinel-1: soil-moisture check.
- Galileo OSNMA: meter location and timestamp proof.

## Local run

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## API

- `GET /api/fields/`
- `GET /api/fields/{field_id}`
- `GET /api/fields/{field_id}/water-risk`
- `GET /api/fields/{field_id}/insight`
- `GET /api/water-bodies/`
- `GET /api/stats/`

## Notes

- The current backend uses mocked field data and local water-body data.
- `api/index.py` is the deployment shim for Vercel.
