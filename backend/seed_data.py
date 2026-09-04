import math
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import User, Station, EnergyReading, Alert, UploadedDataset, SystemSetting

def seed_database(db: Session = None):
    if db is None:
        db = SessionLocal()

    Base.metadata.create_all(bind=engine)

    # 1. Seed Default Admin User
    from .auth import hash_password
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if not existing_admin:
        admin = User(
            name="System Administrator",
            username="admin",
            password_hash=hash_password("polar123"),
            station="Bharati Polar Station",
            role="admin",
            status="active"
        )
        db.add(admin)
    else:
        # Ensure correct role & hashed password
        if not existing_admin.password_hash or not existing_admin.password_hash.startswith("$2"):
            existing_admin.password_hash = hash_password("polar123")
        existing_admin.role = "admin"
        existing_admin.status = "active"
        existing_admin.name = "System Administrator"


    # 2. Seed Station
    if not db.query(Station).filter(Station.name == "Bharati Polar Station").first():
        bharati = Station(
            name="Bharati Polar Station",
            location="Larsemann Hills, Princess Elizabeth Land, Antarctica",
            coordinates="69°24'S, 76°11'E",
            is_active=True
        )
        db.add(bharati)

    # 3. Seed System Settings
    if not db.query(SystemSetting).first():
        settings = SystemSetting(
            station_name="Bharati Polar Station",
            location="Antarctica (69°24'S, 76°11'E)",
            battery_min_reserve=30.0,
            critical_load_threshold=55.0,
            diesel_auto_start_threshold=55.0,
            critical_alerts=True,
            warning_alerts=True,
            system_notifications=True,
            forecast_horizon="24h",
            model_algorithm="RandomForestRegressor"
        )
        db.add(settings)

    # 4. Seed Alerts
    if db.query(Alert).count() == 0:
        seed_alerts = [
            Alert(
                alert_code="ALT-101",
                severity="critical",
                title="High Consumption Detected - Heater 03",
                equipment="Heater Subsystem 03 (Living Quarters)",
                desc="Heater 03 is consuming 12.5 kW, which is 140% above normal nominal threshold (4.0 - 6.0 kW). IsolationForest anomaly score: 0.96.",
                value="12.5 kW (Normal: 5.2 kW)",
                timestamp="14 minutes ago",
                status="Active"
            ),
            Alert(
                alert_code="ALT-102",
                severity="warning",
                title="Energy Shortage Predicted",
                equipment="Renewable Power Array (Solar + Wind)",
                desc="Low renewable generation expected in next 6 hours (+6h: 21.5 kW renewable vs 55 kW peak demand). Battery backup dispatch required.",
                value="Deficit: 24 kW Forecast",
                timestamp="38 minutes ago",
                status="Active"
            ),
            Alert(
                alert_code="ALT-103",
                severity="info",
                title="Battery Discharge High",
                equipment="Station Battery Bank B (150 kWh LiFePO4)",
                desc="Battery is discharging at 24.2 kW (faster than nominal 12.0 kW curve). State of Charge remains safe at 74%.",
                value="-24.2 kW Discharge Rate",
                timestamp="1 hour ago",
                status="Active"
            ),
            Alert(
                alert_code="ALT-104",
                severity="warning",
                title="Wind Gust Exceeding 45 km/h",
                equipment="Turbine WT-02 (Perimeter Ridge)",
                desc="High wind velocity triggering auto-yaw pitch correction. Generation sustained at 15 kW.",
                value="48.2 km/h Wind Velocity",
                timestamp="3 hours ago",
                status="Resolved"
            ),
        ]
        db.add_all(seed_alerts)

    # 5. Seed Uploaded Datasets
    if db.query(UploadedDataset).count() == 0:
        seed_datasets = [
            UploadedDataset(
                dataset_code="DS-001",
                filename="bharati_30d_hourly_telemetry.csv",
                upload_date="Auto-seeded (30 Days History)",
                rows_count=720,
                format_type="CSV",
                status="Active Database Primary",
                size_kb="245 KB"
            ),
            UploadedDataset(
                dataset_code="DS-002",
                filename="antarctic_weather_observations_q1.xlsx",
                upload_date="Yesterday, 18:20 UTC",
                rows_count=2160,
                format_type="XLSX",
                status="Archived Training Set",
                size_kb="512 KB"
            ),
        ]
        db.add_all(seed_datasets)

    # 6. Seed 30 Days (720 Hours) of realistic Energy Readings
    if db.query(EnergyReading).count() < 700:
        db.query(EnergyReading).delete() # clear any partial rows

        now = datetime.utcnow()
        readings = []
        base_time = now - timedelta(days=30)

        for hour_idx in range(720):
            ts = base_time + timedelta(hours=hour_idx)
            hour_of_day = ts.hour

            # Diurnal Solar Pattern (Antarctic summer/spring transition)
            if 6 <= hour_of_day <= 18:
                solar_norm = math.sin((hour_of_day - 6) / 12 * math.pi)
                solar_kw = max(0.0, round(solar_norm * 30.0 + random.uniform(-2.0, 2.0), 1))
            else:
                solar_kw = 0.0

            # Antarctic Wind (Continuous with squalls)
            wind_speed = round(14.0 + random.uniform(-4.0, 10.0) + math.sin(hour_idx / 12) * 5.0, 1)
            wind_kw = max(0.0, min(25.0, round(wind_speed * 0.85 + random.uniform(-1.5, 1.5), 1)))

            # Temperature (-28 to -18 C)
            temp_c = round(-24.0 + math.sin(hour_of_day / 24 * math.pi) * 3.0 + random.uniform(-1.0, 1.0), 1)
            humidity = round(65.0 + random.uniform(-5.0, 5.0), 1)

            # Station load demand
            base_load = 38.0
            if 8 <= hour_of_day <= 20:
                load_kw = round(base_load + random.uniform(0.0, 12.0), 1)
            else:
                load_kw = round(base_load - random.uniform(0.0, 4.0), 1)

            # Heater 03 normal vs anomaly in the last hour
            if hour_idx == 719: # Last reading strictly matches approved specs
                solar_kw = 28.0
                wind_kw = 15.0
                diesel_kw = 0.0
                battery_pct = 74.0
                battery_power = 4.0
                load_kw = 39.0
                temp_c = -24.3
                wind_speed = 18.0
                humidity = 65.0
                heater03 = 12.5 # Anomaly
            else:
                diesel_kw = 0.0
                battery_pct = round(68.0 + random.uniform(0.0, 15.0), 1)
                battery_power = round((solar_kw + wind_kw) - load_kw, 1)
                heater03 = round(4.5 + random.uniform(-0.5, 1.0), 1)

            reading = EnergyReading(
                timestamp=ts,
                solar_generation_kw=solar_kw,
                wind_generation_kw=wind_kw,
                diesel_generation_kw=diesel_kw,
                battery_level_percent=battery_pct,
                battery_power_kw=battery_power,
                load_consumption_kw=load_kw,
                renewable_generation_kw=round(solar_kw + wind_kw, 1),
                temperature_c=temp_c,
                wind_speed_kmh=wind_speed,
                humidity_percent=humidity,
                heater03_kw=heater03,
                station_id="Bharati Polar Station"
            )
            readings.append(reading)

        db.add_all(readings)

    db.commit()
    print("Database successfully initialized & seeded with 720 historical hourly records.")

if __name__ == "__main__":
    seed_database()
