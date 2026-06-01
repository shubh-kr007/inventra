from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, crud, auth, models

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check for SKU uniqueness
    db_product = crud.get_product_by_sku(db, sku=product.sku)
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product SKU/code '{product.sku}' must be unique. A product with this SKU already exists."
        )
    return crud.create_product(db=db, product=product)

@router.get("", response_model=List[schemas.ProductResponse])
def read_products(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_products(db)

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def read_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_product = crud.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int, 
    product: schemas.ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Validate SKU uniqueness if SKU is being updated
    if product.sku:
        db_product_by_sku = crud.get_product_by_sku(db, sku=product.sku)
        if db_product_by_sku and db_product_by_sku.id != product_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product SKU/code '{product.sku}' must be unique. Another product with this SKU already exists."
            )
            
    updated_product = crud.update_product(db=db, product_id=product_id, product=product)
    if not updated_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    return updated_product

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    success = crud.delete_product(db=db, product_id=product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    return {"message": f"Product with ID {product_id} successfully deleted."}
