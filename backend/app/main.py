from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización automática de tablas y datos semilla al arrancar
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "API de Ciberseguridad para Asistentes Virtuales Web. "
        "Provee inspección heurística de prompts en tiempo real, detección de palabras clave críticas, "
        "prevención de fugas de datos de la empresa y gestión CRUD sobre PostgreSQL."
    ),
    lifespan=lifespan
)

# Configuración de CORS para permitir peticiones desde el frontend de desarrollo y producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "security_engine": "ACTIVE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
