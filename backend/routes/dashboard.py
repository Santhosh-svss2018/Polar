from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import EnergyReading, Alert, SystemSetting

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    # Fetch latest reading or return approved demo state
    latest = db.query(EnergyReading).order_by(EnergyReading.id.desc()).first()
    settings = db.query(SystemSetting).first()

    solar_kw = latest.solar_generation_kw if latest else 28.0
    wind_kw = latest.wind_generation_kw if latest else 15.0
    diesel_kw = latest.diesel_generation_kw if latest else 0.0
    battery_pct = latest.battery_level_percent if latest else 74.0
    battery_pwr = latest.battery_power_kw if latest else 4.0
    load_kw = latest.load_consumption_kw if latest else 39.0
    temp_c = latest.temperature_c if latest else -24.3
    wind_spd = latest.wind_speed_kmh if latest else 18.0
    hum_pct = latest.humidity_percent if latest else 65.0
    min_reserve = settings.battery_min_reserve if settings else 30.0

    total_renewable = round(solar_kw + wind_kw, 1)

    # Active alerts
    alerts_query = db.query(Alert).filter(Alert.status == "Active").all()
    active_alerts = [
        {
            'id': a.alert_code or f"ALT-{a.id}",
            'severity': a.severity,
            'title': a.title,
            'desc': a.desc,
            'value': a.value,
        }
        for a in alerts_query
    ] if alerts_query else [
        {
            'id': 'ALT-101',
            'severity': 'critical',
            'title': 'High Consumption Detected - Heater 03',
            'desc': 'Heater 03 is consuming 12.5 kW (140% above normal).',
        },
        {
            'id': 'ALT-102',
            'severity': 'warning',
            'title': 'Energy Shortage Predicted',
            'desc': 'Low renewable generation expected in next 6 hours.',
        },
    ]

    equipment_loads = [
        {'name': 'Critical Systems', 'kw': 18, 'priority': 'P1', 'color': '#00E5FF'},
        {'name': 'Heating (Essential)', 'kw': 12, 'priority': 'P1', 'color': '#FF3D71'},
        {'name': 'Research Equipment', 'kw': 10, 'priority': 'P2', 'color': '#48CAE4'},
        {'name': 'Water System', 'kw': 6, 'priority': 'P2', 'color': '#00C9A7'},
        {'name': 'Lighting', 'kw': 4, 'priority': 'P3', 'color': '#FFB300'},
        {'name': 'Non-critical Loads', 'kw': 8, 'priority': 'P4', 'color': '#8892B0'},
    ]

    recommendations = [
        {
            'title': 'Reduce Non-critical Loads',
            'reason': 'Predicted demand surge (+6h: 55 kW) will exceed renewable capacity.',
            'saving': 'Save 8 kW',
            'priority': 'High',
        },
        {
            'title': 'Shift Water Heating to 14:00 - 16:00',
            'reason': 'Peak solar generation window occurs between 13:00 and 16:00.',
            'saving': 'Save 3 kW',
            'priority': 'Medium',
        },
        {
            'title': 'Maintain Battery Reserve above 30%',
            'reason': 'Safety buffer required for polar subzero nocturnal operations.',
            'saving': 'Safety Buffer',
            'priority': 'Critical',
        },
    ]

    timeline_24h = [
        {'time': '00:00', 'solar': 0, 'wind': 18, 'load': 38, 'battery': 76, 'diesel': 0},
        {'time': '03:00', 'solar': 0, 'wind': 16, 'load': 36, 'battery': 73, 'diesel': 0},
        {'time': '06:00', 'solar': 8, 'wind': 14, 'load': 37, 'battery': 72, 'diesel': 0},
        {'time': '09:00', 'solar': 22, 'wind': 15, 'load': 40, 'battery': 73, 'diesel': 0},
        {'time': '12:00', 'solar': 28, 'wind': 15, 'load': 39, 'battery': 74, 'diesel': 0},
        {'time': '15:00', 'solar': 25, 'wind': 14, 'load': 42, 'battery': 74, 'diesel': 0},
        {'time': '18:00', 'solar': 10, 'wind': 16, 'load': 48, 'battery': 70, 'diesel': 0},
        {'time': '21:00', 'solar': 0, 'wind': 17, 'load': 45, 'battery': 67, 'diesel': 0},
        {'time': '24:00', 'solar': 0, 'wind': 15, 'load': 41, 'battery': 65, 'diesel': 0},
    ]

    return {
        'generation': {
            'solar_kw': solar_kw,
            'wind_kw': wind_kw,
            'diesel_kw': diesel_kw,
            'total_renewable_kw': total_renewable,
            'available_total_kw': total_renewable,
        },
        'consumption': {
            'current_load_kw': load_kw,
            'net_balance_kw': round(total_renewable - load_kw, 1),
        },
        'battery': {
            'level_percent': battery_pct,
            'power_kw': battery_pwr,
            'status': 'Charging (Surplus 4 kW)',
            'min_reserve_percent': min_reserve,
        },
        'resilience': {
            'score': 84,
            'max_score': 100,
            'status': 'Optimal & Stable',
        },
        'fuel': {
            'reserve_percent': 61,
            'status': 'Standby / Ample',
        },
        'environment': {
            'temperature_c': temp_c,
            'wind_speed_kmh': wind_spd,
            'humidity_percent': hum_pct,
        },
        'prediction_summary': {
            'now_kw': 39,
            'plus_1h_kw': 42,
            'plus_3h_kw': 48,
            'plus_6h_kw': 55,
            'plus_12h_kw': 53,
            'plus_24h_kw': 51,
            'confidence_percent': 92,
        },
        'equipment_loads': equipment_loads,
        'recommendations': recommendations,
        'active_alerts': active_alerts,
        'timeline_24h': timeline_24h,
    }
