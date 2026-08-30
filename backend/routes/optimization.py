from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import SystemSetting
from ..ml.optimizer import optimizer

router = APIRouter(prefix="/optimization", tags=["optimization"])

@router.api_route("/run", methods=["GET", "POST"])
def run_optimization(params: dict = None, db: Session = Depends(get_db)):
    settings = db.query(SystemSetting).first()
    min_reserve = settings.battery_min_reserve if settings else 30.0
    return optimizer.solve(min_reserve=min_reserve)
