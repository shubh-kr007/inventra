import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, crud, auth, models
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    # Check if email exists
    db_email = crud.get_user_by_email(db, email=user.email)
    if db_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Authenticate user
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not user.hashed_password or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=schemas.Token)
async def google_login(payload: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    token = payload.credential
    
    # 1. Verify Google token via Google OAuth2 TokenInfo API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": token},
                timeout=5.0
            )
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google credential token."
            )
            
        token_info = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to reach Google verification server: {str(e)}"
        )
        
    # Optional: Verify Client ID if configured
    if settings.GOOGLE_CLIENT_ID and token_info.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google Token client ID audience mismatch."
        )
        
    email = token_info.get("email")
    name = token_info.get("name")
    sub = token_info.get("sub") # Google unique ID
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not return an email address."
        )
        
    # Check if user already exists
    user = crud.get_user_by_email(db, email=email)
    
    if not user:
        # Create username based on name or email prefix
        base_username = email.split("@")[0].replace(".", "_")
        username = base_username
        
        # Ensure username uniqueness
        counter = 1
        while crud.get_user_by_username(db, username=username):
            username = f"{base_username}_{counter}"
            counter += 1
            
        # Create Google account
        user = crud.create_google_user(db=db, username=username, email=email)
    else:
        # If user exists but registered local, we can allow logging in, 
        # but let's make sure it's linked
        if user.auth_provider == "local":
            # Upgrade provider or just let it pass
            user.auth_provider = "google"
            db.commit()
            db.refresh(user)

    # Generate internal access token
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
