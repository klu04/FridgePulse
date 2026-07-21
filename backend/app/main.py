import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.database.models
from app.config import settings
from app.database.db import engine
from app.routers import api_router

# Configure logging BEFORE anything else
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown of resources at app startup and shutdown."""
    yield
    await engine.dispose()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

origins = [
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://localhost:5173",
    "https://localhost",
    "https://localhost:5173",
    "http://0.0.0.0:5173",
    "https://0.0.0.0:5173",
    "http://192.168.50.85:5173",
    "https://192.168.50.85:5173",
    "http://192.168.50.98:5173",
    "http://192.168.50.98:5173",
    "https://dosage-matchless-suspend.ngrok-free.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_URL)
