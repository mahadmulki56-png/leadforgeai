import os
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="LeadForge AI FastAPI Backend",
    version="2.0.0",
    description="Dedicated LeadForge API service with Google Places API (New) integration."
)

# CORS Configuration
allowed_origins = [
    "https://leadforgeai-one.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Schemas
class SearchRequest(BaseModel):
    industry: str
    city: str
    state: str
    radiusKm: Optional[float] = 25.0
    noWebsiteOnly: Optional[bool] = False

class BusinessLead(BaseModel):
    id: str
    name: str
    industry: str
    city: str
    state: str
    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    googlePlaceId: Optional[str] = None
    googleMapsUri: Optional[str] = None
    rating: Optional[float] = None
    reviewCount: Optional[int] = None
    verified: bool = True
    leadScore: int = 85

class SearchResponse(BaseModel):
    searchId: str
    query: Dict[str, Any]
    total: int
    results: List[BusinessLead]
    provider: str
    generatedAt: str

@app.get("/healthz", status_code=status.HTTP_200_OK)
def healthz():
    """Liveness probe: Return HTTP 200 without authentication or DB dependency."""
    return {
        "status": "ok",
        "service": "leadforge-fastapi-backend",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.get("/readyz")
def readyz(response: Response):
    """Readiness probe: Verify Google Places configuration."""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "google_places": "missing_api_key",
            "message": "GOOGLE_MAPS_API_KEY environment variable is missing"
        }
    
    return {
        "status": "ready",
        "google_places": "configured",
        "service": "leadforge-fastapi-backend",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.get("/openapi.json")
def openapi_spec():
    return app.openapi()

@app.get("/debug/routes")
@app.get("/api/debug/routes")
def debug_routes():
    """Inspect all active backend routes without exposing sensitive environment keys."""
    routes_info = []
    for route in app.routes:
        if hasattr(route, "path") and hasattr(route, "methods"):
            routes_info.append({
                "path": route.path,
                "methods": list(route.methods)
            })
    return {
        "service": "leadforge-fastapi-backend",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "totalRoutes": len(routes_info),
        "routes": routes_info
    }

@app.post("/api/search", response_model=SearchResponse)
async def search_leads(req: SearchRequest):
    """Real business lead search using Google Places API (New)."""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_PLACES_API_KEY")
    query_text = f"{req.industry} in {req.city}, {req.state}"
    
    if not api_key:
        # Honest error when API key is unconfigured on backend
        raise HTTPException(
            status_code=503,
            detail="Google Places API key is missing on backend server. Set GOOGLE_MAPS_API_KEY in backend environment variables."
        )

    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount"
    }
    payload = {
        "textQuery": query_text
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            res = await client.post(url, json=payload, headers=headers)
            if res.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Google Places API request failed with HTTP {res.status_code}: {res.text}"
                )
            
            data = res.json()
            raw_places = data.get("places", [])
            results: List[BusinessLead] = []

            for index, p in enumerate(raw_places):
                place_id = p.get("id", f"place_{index}")
                name = p.get("displayName", {}).get("text", "Business")
                address = p.get("formattedAddress", f"{req.city}, {req.state}")
                phone = p.get("nationalPhoneNumber")
                website = p.get("websiteUri")
                maps_uri = p.get("googleMapsUri") or f"https://www.google.com/maps/place/?q=place_id:{place_id}"
                rating = p.get("rating")
                user_rating_count = p.get("userRatingCount")

                if req.noWebsiteOnly and website:
                    continue

                results.append(BusinessLead(
                    id=f"lead_gp_{place_id}",
                    name=name,
                    industry=req.industry,
                    city=req.city,
                    state=req.state,
                    address=address,
                    phone=phone,
                    website=website,
                    googlePlaceId=place_id,
                    googleMapsUri=maps_uri,
                    rating=rating,
                    reviewCount=user_rating_count,
                    verified=True,
                    leadScore=85 if not website else 70
                ))

            return SearchResponse(
                searchId=f"srch_fastapi_{int(time.time())}",
                query=req.dict(),
                total=len(results),
                results=results,
                provider="Google Places API (New)",
                generatedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            )

        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Network error querying Google Places API: {str(exc)}"
            )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
