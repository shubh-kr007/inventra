from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, auth, models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    
    # Low stock threshold is defined as quantity <= 10
    low_stock_products = db.query(models.Product).filter(models.Product.quantity <= 10).all()
    low_stock_count = len(low_stock_products)
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_count": low_stock_count,
        "low_stock_products": low_stock_products
    }
