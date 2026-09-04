from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, LoginResponse, UserResponse
from ..auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. Search for user by username
    user = db.query(User).filter(User.username == req.username.strip()).first()
    
    # 2. If user does not exist or password does not match
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    
    # 3. Check account status
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This operator account is currently disabled. Contact the administrator."
        )
    
    # 4. Update last_login
    user.last_login = datetime.now(timezone.utc)
    if req.station:
        user.station = req.station
    db.commit()
    db.refresh(user)
    
    # 5. Create access token
    token_payload = {
        "sub": user.username,
        "role": user.role,
        "id": user.id,
        "station": user.station
    }
    access_token = create_access_token(token_payload)
    
    return LoginResponse(
        token=access_token,
        token_type="Bearer",
        username=user.username,
        name=user.name or user.username,
        station=user.station,
        role=user.role,
        status=user.status,
        user=UserResponse.from_orm(user) if hasattr(UserResponse, "from_orm") else UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Acknowledge logout on backend."""
    return {"message": "Logged out successfully", "username": current_user.username}
