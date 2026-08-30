from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # Check user or demo credentials
    user = db.query(User).filter(User.username == req.username).first()
    if user and user.password == req.password:
        return LoginResponse(
            token=f"polar-token-{user.username}-2026",
            username=user.username,
            station=req.station or user.station,
            role=user.role
        )
    elif req.username == "admin" and req.password == "polar123":
        return LoginResponse(
            token="polar-token-admin-2026",
            username="admin",
            station=req.station or "Bharati Polar Station",
            role="System Administrator"
        )
    raise HTTPException(status_code=401, detail="Invalid station credentials. Please use admin / polar123.")
