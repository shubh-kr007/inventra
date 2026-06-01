from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import engine, Base
from .routers import auth, products, customers, orders, dashboard
from .config import settings

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    import sys
    from sqlalchemy import create_engine
    from . import database
    print(f"\n[!] WARNING: PostgreSQL connection failed: {e}", file=sys.stderr)
    print("[!] Falling back to local SQLite database: sqlite:///./inventra.db\n", file=sys.stderr)
    
    database.engine = create_engine(
        "sqlite:///./inventra.db", 
        connect_args={"check_same_thread": False}
    )
    database.SessionLocal.configure(bind=database.engine)
    Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Inventra API",
    description="Futuristic Backend API for Inventra SaaS Inventory & Order Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down to specific domains (e.g. Vercel)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
    )

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Inventra SaaS API",
        "documentation": "/docs",
        "version": "1.0.0"
    }
