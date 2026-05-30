from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.db_service import db_service
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user
from app.models.domain import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    """Register a new user account."""
    existing_user = await db_service.get_user_by_email(payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_pwd = hash_password(payload.password)
    user = await db_service.create_user(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed_pwd
    )
    return user

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate credentials and return a session token."""
    user = await db_service.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    # Generate token
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve details of the logged-in user."""
    return current_user
