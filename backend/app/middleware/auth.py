from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.security import decode_access_token
from app.services.db_service import db_service

# Allow token in bearer format. Since we also use standard requests from browser, 
# auto_error is False so we can check/raise manually or support alternative token passing.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        # Check if it was passed via header directly in a custom way
        # (e.g. event stream requests sometimes pass query params, but standard header is best)
        raise credentials_exception
        
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = await db_service.get_user_by_email(email)
    if user is None:
        raise credentials_exception
        
    return user
