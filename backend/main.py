from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .seed_data import seed_database
from .routes import (
    auth,
    operators,
    dashboard,
    predictions,
    optimization,
    alerts,
    simulation,
    data,
    reports,
    settings,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed Data on startup
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title="POLAR-ENERGY AI API",
    description="Backend API for POLAR SMART ENERGY MANAGEMENT SYSTEM (Bharati Polar Station, Antarctica)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(operators.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(optimization.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/")
def root():
    return {
        "system": "POLAR-ENERGY AI",
        "station": "Bharati Polar Station",
        "tagline": "AI-Powered. Resilient. Sustainable.",
        "status": "Online & Monitoring",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
