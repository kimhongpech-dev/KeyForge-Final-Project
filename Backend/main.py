from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .routers import admin, auth, orders, products

app = FastAPI(title="KeyForge API")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

assets_dir = Path(__file__).resolve().parents[1] / "src" / "assets"
if assets_dir.is_dir():
    app.mount("/src/assets", StaticFiles(directory=assets_dir), name="assets")

app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}
