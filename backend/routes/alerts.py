from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Alert
from ..ml.anomaly_detector import anomaly_detector

router = APIRouter(tags=["alerts"])

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    return {
        'alerts': [
            {
                'id': a.alert_code or f"ALT-{a.id}",
                'severity': a.severity,
                'title': a.title,
                'equipment': a.equipment,
                'desc': a.desc,
                'value': a.value,
                'timestamp': a.timestamp,
                'status': a.status,
            }
            for a in alerts
        ]
    }

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter((Alert.alert_code == alert_id) | (Alert.id == (int(alert_id) if alert_id.isdigit() else -1))).first()
    if not alert:
        return {'status': 'success', 'message': f'Alert {alert_id} resolved'}
    alert.status = "Resolved"
    db.commit()
    return {'status': 'success', 'alert_id': alert_id, 'new_status': 'Resolved'}

@router.get("/anomalies")
def get_anomalies():
    return anomaly_detector.check_telemetry()
