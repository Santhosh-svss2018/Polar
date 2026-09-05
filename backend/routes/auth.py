from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, LoginResponse, UserResponse
from ..auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    clean_username = req.username.strip().lower()
    clean_password = req.password.strip()

    # 1. Search for user by case-insensitive username
    user = db.query(User).filter(func.lower(User.username) == clean_username).first()
    
    # 2. If user does not exist or password does not match
    if not user or not verify_password(clean_password, user.password_hash):
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
    
    # 4. Update last_login & last_seen
    now_utc = datetime.now(timezone.utc)
    user.last_login = now_utc
    user.last_seen = now_utc
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
    
    user_resp = UserResponse.from_orm(user) if hasattr(UserResponse, "from_orm") else UserResponse.model_validate(user)
    user_resp.is_online = True
    
    return LoginResponse(
        token=access_token,
        token_type="Bearer",
        username=user.username,
        name=user.name or user.username,
        station=user.station,
        role=user.role,
        status=user.status,
        user=user_resp
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return current_user

@router.post("/heartbeat")
def heartbeat(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update operator live presence timestamp. Returns account status."""
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your operator account has been disabled by the administrator."
        )
    current_user.last_seen = datetime.now(timezone.utc)
    db.commit()
    return {
        "status": "online",
        "username": current_user.username,
        "role": current_user.role,
        "account_status": current_user.status,
        "last_seen": current_user.last_seen.isoformat()
    }

@router.post("/leave")
def leave(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark operator as offline on window close or navigation away."""
    current_user.last_seen = None
    db.commit()
    return {"status": "offline", "username": current_user.username}

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Acknowledge logout on backend and set offline."""
    current_user.last_seen = None
    db.commit()
    return {"message": "Logged out successfully", "username": current_user.username}
