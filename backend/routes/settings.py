from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import SystemSetting
from ..schemas import SettingsSchema

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSetting).first()
    if not settings:
        return {
            "station_name": "Bharati Polar Station",
            "location": "Antarctica (69°24'S, 76°11'E)",
            "battery_min_reserve": 30.0,
            "critical_load_threshold": 55.0,
            "diesel_auto_start_threshold": 55.0,
            "critical_alerts": True,
            "warning_alerts": True,
            "system_notifications": True,
            "forecast_horizon": "24h",
            "model_algorithm": "RandomForestRegressor"
        }
    return {
        "station_name": settings.station_name,
        "location": settings.location,
        "battery_min_reserve": settings.battery_min_reserve,
        "critical_load_threshold": settings.critical_load_threshold,
        "diesel_auto_start_threshold": settings.diesel_auto_start_threshold,
        "critical_alerts": settings.critical_alerts,
        "warning_alerts": settings.warning_alerts,
        "system_notifications": settings.system_notifications,
        "forecast_horizon": settings.forecast_horizon,
        "model_algorithm": settings.model_algorithm
    }

@router.put("")
def update_settings(payload: SettingsSchema, db: Session = Depends(get_db)):
    settings = db.query(SystemSetting).first()
    if not settings:
        settings = SystemSetting()
        db.add(settings)

    if payload.station_name is not None: settings.station_name = payload.station_name
    if payload.location is not None: settings.location = payload.location
    if payload.battery_min_reserve is not None: settings.battery_min_reserve = payload.battery_min_reserve
    if payload.critical_load_threshold is not None: settings.critical_load_threshold = payload.critical_load_threshold
    if payload.diesel_auto_start_threshold is not None: settings.diesel_auto_start_threshold = payload.diesel_auto_start_threshold
    if payload.critical_alerts is not None: settings.critical_alerts = payload.critical_alerts
    if payload.warning_alerts is not None: settings.warning_alerts = payload.warning_alerts
    if payload.system_notifications is not None: settings.system_notifications = payload.system_notifications
    if payload.forecast_horizon is not None: settings.forecast_horizon = payload.forecast_horizon
    if payload.model_algorithm is not None: settings.model_algorithm = payload.model_algorithm

    db.commit()
    return {"status": "success", "message": "Settings persisted to SQLite"}
