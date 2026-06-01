from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import engine, Base, SessionLocal
from .routers import auth, products, customers, orders, dashboard
from .config import settings

def seed_database(session_factory):
    from . import models
    db = session_factory()
    try:
        # Check if products already exist
        if db.query(models.Product).count() > 0:
            print("[*] Database already populated. Skipping seeding.")
            return

        print("[*] Seeding database with futuristic mock data...")

        # Add products
        p1 = models.Product(name="Neural Processor V9", sku="PRD-NEURAL-V9", price=85000.00, quantity=45)
        p2 = models.Product(name="Quantum Core Shield", sku="PRD-QSHIELD-X", price=120000.00, quantity=8)
        p3 = models.Product(name="Holographic Projector Array", sku="PRD-HOLO-ARR", price=42500.00, quantity=15)
        p4 = models.Product(name="Cybernetic Limb Interface", sku="PRD-CYBER-LMB", price=250000.00, quantity=5)
        p5 = models.Product(name="Sub-Thermal Cooling Fluid (L)", sku="PRD-COOL-FL1", price=7500.00, quantity=120)
        db.add_all([p1, p2, p3, p4, p5])
        db.commit()

        # Add customers
        c1 = models.Customer(full_name="Neo Anderson", email="neo@matrix.io", phone="+91-9988776655")
        c2 = models.Customer(full_name="Sarah Connor", email="s.connor@cyberdyne.net", phone="+91-8877665544")
        c3 = models.Customer(full_name="Bruce Wayne", email="bruce@waynecorp.com", phone="+91-7766554433")
        c4 = models.Customer(full_name="Tony Stark", email="tony@starkindustries.com", phone="+91-6655443322")
        db.add_all([c1, c2, c3, c4])
        db.commit()

        # Add some orders
        # Order 1 for Bruce Wayne
        o1 = models.Order(customer_id=c3.id, total_amount=290000.00)
        db.add(o1)
        db.flush()
        item1_1 = models.OrderItem(order_id=o1.id, product_id=p1.id, product_name=p1.name, product_sku=p1.sku, quantity=2, unit_price=p1.price)
        item1_2 = models.OrderItem(order_id=o1.id, product_id=p2.id, product_name=p2.name, product_sku=p2.sku, quantity=1, unit_price=p2.price)
        db.add_all([item1_1, item1_2])

        # Order 2 for Sarah Connor
        o2 = models.Order(customer_id=c2.id, total_amount=80000.00)
        db.add(o2)
        db.flush()
        item2_1 = models.OrderItem(order_id=o2.id, product_id=p3.id, product_name=p3.name, product_sku=p3.sku, quantity=1, unit_price=p3.price)
        item2_2 = models.OrderItem(order_id=o2.id, product_id=p5.id, product_name=p5.name, product_sku=p5.sku, quantity=5, unit_price=p5.price)
        db.add_all([item2_1, item2_2])

        db.commit()
        print("[*] Database seeding completed successfully!")
    except Exception as err:
        db.rollback()
        print(f"[!] Database seeding failed: {err}")
    finally:
        db.close()

try:
    Base.metadata.create_all(bind=engine)
    seed_database(SessionLocal)
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
    seed_database(database.SessionLocal)

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
