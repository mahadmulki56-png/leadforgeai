# LeadForge AI FastAPI Backend

Dedicated Python FastAPI service implementing Google Places API (New) lead discovery.

## Endpoints

- `GET /healthz` - Liveness check (HTTP 200, no auth required)
- `GET /readyz` - Readiness check (verifies `GOOGLE_MAPS_API_KEY`)
- `GET /openapi.json` - OpenAPI 3.0 specification
- `GET /debug/routes` - Route inspector
- `POST /api/search` - Real business search via Google Places API (New)

## Local Execution

```bash
cd backend
pip install -r requirements.txt
export GOOGLE_MAPS_API_KEY="your-key-here"
python main.py
```

## Deployment Options

### Option A: Railway
1. Connect repo or upload `backend/` directory to Railway.
2. Set Environment Variables:
   - `GOOGLE_MAPS_API_KEY` = `<your_key>`
3. Set Port: `3000`

### Option B: Render
1. Create a Web Service on Render from `backend/Dockerfile`.
2. Environment: `Docker` or `Python 3`.
3. Set Environment Variable: `GOOGLE_MAPS_API_KEY`.

### Option C: Cloud Run
```bash
gcloud run deploy leadforge-fastapi-backend \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_MAPS_API_KEY="<your_key>"
```

## Frontend Configuration (Vercel)

Set the following environment variable in Vercel:

```env
NEXT_PUBLIC_API_URL=https://<your-backend-domain>
```

Then trigger a **New Deployment** in Vercel so Next.js embeds the build-time environment variable.
