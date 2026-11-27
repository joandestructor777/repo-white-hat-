import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.core.config import settings
from app.core.database import init_db
from app.core.metrics import REQUESTS_TOTAL, REQUEST_DURATION, ACTIVE_CONNECTIONS
from app.api.v1 import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API de Ciberseguridad para Asistentes Virtuales Web con Observabilidad Prometheus y Motor de IA.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware de Observabilidad Prometheus
@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    ACTIVE_CONNECTIONS.inc()
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        REQUESTS_TOTAL.labels(
            method=request.method,
            endpoint=request.url.path,
            status_code=response.status_code
        ).inc()
        REQUEST_DURATION.labels(endpoint=request.url.path).observe(duration)
        return response
    finally:
        ACTIVE_CONNECTIONS.dec()

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health & Kubernetes"])
def health_check():
    """Endpoint de comprobación de salud para livenessProbe y readinessProbe en Kubernetes."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "security_engine": "ACTIVE",
        "kubernetes_ready": True
    }

@app.get("/metrics", tags=["Observability & Prometheus"])
def metrics():
    """Endpoint de scraping consumido por Prometheus periódicamente."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.SERVER_HOST, port=settings.SERVER_PORT, reload=True)
