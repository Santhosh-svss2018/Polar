from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ..database import get_db
from ..models import Alert, EnergyReading
from ..schemas import SimulationRequest
from ..ml.simulator import simulator

router = APIRouter(prefix="/simulation", tags=["simulation"])

# In-memory latest digital twin telemetry cache
_latest_telemetry = {
    "scenarioMode": "clear",
    "irradiance": 82,
    "windSpeed": 24,
    "gridLoad": 621,
    "weather": "Clear",
    "batteryStrategy": "Balanced",
    "emergencyDiesel": False,
    "solarOutput": 284,
    "solarEfficiency": 91,
    "solarRisk": False,
    "windOutput": 412,
    "windRisk": False,
    "batterySOC": 78,
    "batteryPower": 146,
    "batteryRisk": False,
    "dieselOutput": 0,
    "dieselFuelPercent": 84,
    "dieselFuelLiters": 37800,
    "dieselBurnRateLph": 0.0,
    "dieselRemainingHours": 440,
    "dieselStatus": "STANDBY",
    "gridStatus": "NORMAL",
    "aiStatus": "OPTIMAL",
    "resilienceScore": 92,
    "lastUpdated": datetime.utcnow().isoformat(),
}

class DangerAlertRequest(BaseModel):
    equipment: str
    title: str
    desc: str
    value: str
    severity: str = "critical"

@router.post("/run")
def run_simulation(req: SimulationRequest):
    return simulator.run_simulation(
        solar_delta_pct=req.solar_delta_pct,
        wind_delta_pct=req.wind_delta_pct,
        temp_delta_c=req.temp_delta_c,
        load_delta_pct=req.load_delta_pct,
    )

@router.get("/telemetry")
def get_live_telemetry():
    return _latest_telemetry

@router.post("/telemetry")
def update_live_telemetry(payload: Dict[str, Any], db: Session = Depends(get_db)):
    global _latest_telemetry
    _latest_telemetry.update(payload)
    _latest_telemetry["lastUpdated"] = datetime.utcnow().isoformat()
    return {"status": "success", "telemetry": _latest_telemetry}

@router.post("/danger-alert")
def record_danger_alert(req: DangerAlertRequest, db: Session = Depends(get_db)):
    alert_code = f"ALT-DANGER-{int(datetime.utcnow().timestamp())}"
    new_alert = Alert(
        alert_code=alert_code,
        severity=req.severity,
        title=req.title,
        equipment=req.equipment,
        desc=req.desc,
        value=req.value,
        timestamp=datetime.utcnow().strftime("%H:%M UTC (Live Digital Twin)"),
        status="Active",
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return {
        "status": "success",
        "alert": {
            "id": new_alert.alert_code,
            "title": new_alert.title,
            "equipment": new_alert.equipment,
            "severity": new_alert.severity,
            "desc": new_alert.desc,
            "value": new_alert.value,
            "timestamp": new_alert.timestamp,
            "status": new_alert.status,
        },
    }
