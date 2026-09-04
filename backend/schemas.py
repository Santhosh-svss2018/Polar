from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    role: str = "operator"
    status: str = "active"
    station: Optional[str] = "Bharati Polar Station"

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    username: str
    role: str
    status: str
    station: Optional[str] = "Bharati Polar Station"
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str
    station: Optional[str] = "Bharati Polar Station"

class LoginResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    username: str
    name: Optional[str] = None
    station: str
    role: str
    status: str
    user: Optional[UserResponse] = None

class OperatorCreateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    confirm_password: Optional[str] = None
    name: Optional[str] = None
    status: Optional[str] = "active"

    @field_validator("username")
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Operator username cannot be empty")
        return v

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class OperatorUpdateRequest(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    station: Optional[str] = None

class OperatorPasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=8)
    confirm_password: Optional[str] = None

class OperatorStatusUpdateRequest(BaseModel):
    status: str  # "active" or "disabled"

class SimulationRequest(BaseModel):
    solar_delta_pct: float = -70.0
    wind_delta_pct: float = -40.0
    temp_delta_c: float = -8.0
    load_delta_pct: float = 20.0

class LiveSimulationState(BaseModel):
    solar_irradiance_pct: float = 82.0
    wind_speed_kmh: float = 24.0
    load_demand_kw: float = 621.0
    weather_condition: str = "Clear"
    battery_strategy: str = "Balanced"
    emergency_diesel: bool = False

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
    language: Optional[str] = "en"
