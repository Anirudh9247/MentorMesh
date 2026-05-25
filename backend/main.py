from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
# Import models to ensure they are registered with Base metadata before table creation
from . import models
from .routers import auth

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MentorMesh API",
    description="Locality-first AI mentor matching platform backend",
    version="1.0.0"
)

# Configure CORS Middleware
# Allows our React frontend (running locally on port 5173 or deployed on Vercel)
# to communicate with the FastAPI backend.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Wildcard allowed for hackathon/deployment ease, can be locked down in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)


@app.get("/")
def read_root():
    """
    Base health-check endpoint for Render / developer health verification.
    """
    return {
        "status": "healthy",
        "message": "Welcome to the MentorMesh API! Everything is running smoothly."
    }
