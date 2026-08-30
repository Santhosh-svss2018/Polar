from fastapi import APIRouter, Query, Response
from fastapi.responses import PlainTextResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("")
def get_reports(period: str = Query("weekly", enum=["daily", "weekly", "monthly"])):
    if period == "daily":
        daily_records = [
            {'date': '00:00', 'solar_kwh': 0, 'wind_kwh': 18, 'diesel_kwh': 0, 'load_kwh': 38, 'resilience': 88},
            {'date': '04:00', 'solar': 0, 'wind_kwh': 16, 'diesel_kwh': 0, 'load_kwh': 36, 'resilience': 89},
            {'date': '08:00', 'solar_kwh': 18, 'wind_kwh': 14, 'diesel_kwh': 0, 'load_kwh': 40, 'resilience': 87},
            {'date': '12:00', 'solar_kwh': 28, 'wind_kwh': 15, 'diesel_kwh': 0, 'load_kwh': 39, 'resilience': 89},
            {'date': '16:00', 'solar_kwh': 22, 'wind_kwh': 16, 'diesel_kwh': 0, 'load_kwh': 44, 'resilience': 86},
            {'date': '20:00', 'solar_kwh': 2, 'wind_kwh': 17, 'diesel_kwh': 0, 'load_kwh': 47, 'resilience': 84},
        ]
        summary = {
            'total_consumption_kwh': 936,
            'total_renewable_kwh': 1032,
            'renewable_fraction_pct': 94.2,
            'diesel_consumed_liters': 0,
            'diesel_conserved_liters': 85,
            'avg_resilience_score': 87.1,
            'anomalies_detected': 1,
            'anomalies_resolved': 1,
        }
    elif period == "monthly":
        daily_records = [
            {'date': 'Week 1', 'solar_kwh': 3450, 'wind_kwh': 2520, 'diesel_kwh': 0, 'load_kwh': 5700, 'resilience': 89},
            {'date': 'Week 2', 'solar_kwh': 3380, 'wind_kwh': 2610, 'diesel_kwh': 90, 'load_kwh': 5850, 'resilience': 85},
            {'date': 'Week 3', 'solar_kwh': 3620, 'wind_kwh': 2450, 'diesel_kwh': 0, 'load_kwh': 5650, 'resilience': 91},
            {'date': 'Week 4', 'solar_kwh': 3510, 'wind_kwh': 2590, 'diesel_kwh': 0, 'load_kwh': 5720, 'resilience': 90},
        ]
        summary = {
            'total_consumption_kwh': 22920,
            'total_renewable_kwh': 24130,
            'renewable_fraction_pct': 93.6,
            'diesel_consumed_liters': 280,
            'diesel_conserved_liters': 2340,
            'avg_resilience_score': 88.7,
            'anomalies_detected': 7,
            'anomalies_resolved': 7,
        }
    else: # weekly default
        daily_records = [
            {'date': 'Mon', 'solar_kwh': 480, 'wind_kwh': 360, 'diesel_kwh': 0, 'load_kwh': 810, 'resilience': 88},
            {'date': 'Tue', 'solar_kwh': 510, 'wind_kwh': 340, 'diesel_kwh': 0, 'load_kwh': 825, 'resilience': 89},
            {'date': 'Wed', 'solar_kwh': 460, 'wind_kwh': 380, 'diesel_kwh': 0, 'load_kwh': 840, 'resilience': 87},
            {'date': 'Thu', 'solar_kwh': 320, 'wind_kwh': 410, 'diesel_kwh': 45, 'load_kwh': 890, 'resilience': 82},
            {'date': 'Fri', 'solar_kwh': 520, 'wind_kwh': 350, 'diesel_kwh': 0, 'load_kwh': 805, 'resilience': 90},
            {'date': 'Sat', 'solar_kwh': 540, 'wind_kwh': 330, 'diesel_kwh': 0, 'load_kwh': 790, 'resilience': 91},
            {'date': 'Sun', 'solar_kwh': 490, 'wind_kwh': 370, 'diesel_kwh': 0, 'load_kwh': 815, 'resilience': 88},
        ]
        summary = {
            'total_consumption_kwh': 6552,
            'total_renewable_kwh': 7224,
            'renewable_fraction_pct': 92.4,
            'diesel_consumed_liters': 142,
            'diesel_conserved_liters': 580,
            'avg_resilience_score': 86.2,
            'anomalies_detected': 4,
            'anomalies_resolved': 4,
        }

    return {
        'period': period,
        'summary': summary,
        'daily_records': daily_records,
    }

@router.get("/export", response_class=PlainTextResponse)
def export_reports_csv(period: str = "weekly"):
    data = get_reports(period)
    csv_rows = [
        "POLAR-ENERGY AI — BHARATI POLAR STATION ENERGY AUDIT REPORT",
        f"Period: {period.upper()}",
        f"Generated Timestamp: {datetime.utcnow().isoformat()}",
        "",
        "Date,Solar (kWh),Wind (kWh),Diesel (kWh),Total Load (kWh),Resilience Score",
    ]
    for r in data["daily_records"]:
        csv_rows.append(f"{r['date']},{r.get('solar_kwh', 0)},{r['wind_kwh']},{r['diesel_kwh']},{r['load_kwh']},{r['resilience']}")

    return "\n".join(csv_rows)
