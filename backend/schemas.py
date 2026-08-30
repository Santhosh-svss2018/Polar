from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str
    station: Optional[str] = "Bharati Polar Station"

class LoginResponse(BaseModel):
    token: str
    username: str
    station: str
    role: str

class SimulationRequest(BaseModel):
    solar_delta_pct: float = -70.0
    wind_delta_pct: float = -40.0
    temp_delta_c: float = -8.0
    load_delta_pct: float = 20.0

class SettingsSchema(BaseModel):
    station_name: Optional[str] = "Bharati Polar Station"
    location: Optional[str] = "Antarctica (69°24'S, 76°11'E)"
    battery_min_reserve: Optional[float] = 30.0
    critical_load_threshold: Optional[float] = 55.0
    diesel_auto_start_threshold: Optional[float] = 55.0
    critical_alerts: Optional[bool] = True
    warning_alerts: Optional[bool] = True
    system_notifications: Optional[bool] = True
    forecast_horizon: Optional[str] = "24h"
    model_algorithm: Optional[str] = "RandomForestRegressor"
