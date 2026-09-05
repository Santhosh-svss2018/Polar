from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Administrator")
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    station = Column(String(100), default="Bharati Polar Station")
    role = Column(String(50), default="operator")  # "admin" or "operator"
    status = Column(String(50), default="active")  # "active" or "disabled"
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)
    last_seen = Column(DateTime, nullable=True)


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    location = Column(String(100), nullable=False)
    coordinates = Column(String(50), default="69°24'S, 76°11'E")
    is_active = Column(Boolean, default=True)

class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    solar_generation_kw = Column(Float, default=0.0)
    wind_generation_kw = Column(Float, default=0.0)
    diesel_generation_kw = Column(Float, default=0.0)
    battery_level_percent = Column(Float, default=74.0)
    battery_power_kw = Column(Float, default=0.0)
    load_consumption_kw = Column(Float, default=39.0)
    renewable_generation_kw = Column(Float, default=0.0)
    temperature_c = Column(Float, default=-24.3)
    wind_speed_kmh = Column(Float, default=18.0)
    humidity_percent = Column(Float, default=65.0)
    heater03_kw = Column(Float, default=5.2)
    station_id = Column(String(50), default="Bharati Polar Station")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String(20), unique=True, index=True)
    severity = Column(String(20), nullable=False)  # critical, warning, info
    title = Column(String(200), nullable=False)
    equipment = Column(String(200), nullable=False)
    desc = Column(Text, nullable=False)
    value = Column(String(100))
    timestamp = Column(String(100))
    status = Column(String(20), default="Active")  # Active, Resolved

class UploadedDataset(Base):
    __tablename__ = "uploaded_datasets"

    id = Column(Integer, primary_key=True, index=True)
    dataset_code = Column(String(20), unique=True, index=True)
    filename = Column(String(255), nullable=False)
    upload_date = Column(String(100), nullable=False)
    rows_count = Column(Integer, default=0)
    format_type = Column(String(10), default="CSV")
    status = Column(String(50), default="Imported & Ingested")
    size_kb = Column(String(50), default="0 KB")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    station_name = Column(String(100), default="Bharati Polar Station")
    location = Column(String(100), default="Antarctica (69°24'S, 76°11'E)")
    battery_min_reserve = Column(Float, default=30.0)
    critical_load_threshold = Column(Float, default=55.0)
    diesel_auto_start_threshold = Column(Float, default=55.0)
    critical_alerts = Column(Boolean, default=True)
    warning_alerts = Column(Boolean, default=True)
    system_notifications = Column(Boolean, default=True)
    forecast_horizon = Column(String(20), default="24h")
    model_algorithm = Column(String(100), default="RandomForestRegressor")
    language = Column(String(10), default="en")
