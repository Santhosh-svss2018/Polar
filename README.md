# POLAR-ENERGY AI
### POLAR SMART ENERGY MANAGEMENT SYSTEM
**Station: Bharati Polar Station, Antarctica**  
*Tagline: AI-Powered. Resilient. Sustainable.*

---

## Overview

**POLAR-ENERGY AI** is a complete, working prototype of a smart energy management system designed for extreme polar conditions (Bharati Station, 69°24'S, 76°11'E). It monitors multi-source generation (Solar PV, Wind Turbines, Diesel Backup, Battery Storage), provides predictive demand and generation forecasting, executes intelligent priority-based load dispatch, detects subzero thermal anomalies, and provides what-if digital twin simulations under severe Antarctic blizzard conditions.

---

## Key Capabilities

1. **Station Dashboard**:
   - Live generation telemetry: Solar (28 kW), Wind (15 kW), Diesel (0 kW Inactive), Battery Bank (74% Charging).
   - Real-time Load Demand (39 kW), Available Power (43 kW), Energy Resilience Index (84/100), Diesel Fuel Reserve (61%).
   - Interactive 24-hour generation vs load curve with diurnal solar profiles.
   - Equipment load breakdown by priority (Critical Life Support: 18 kW, Heating: 12 kW, Research: 10 kW, Water: 6 kW, Lighting: 4 kW, Non-critical: 8 kW).
   - Real-time AI recommendations and live alert notifications.

2. **ML Prediction Engine**:
   - `RandomForestRegressor` / `GradientBoostingRegressor` models trained on 720 historical hourly readings.
   - Forecasting horizons: Now (39 kW), +1h (42 kW), +3h (48 kW), +6h (55 kW peak), +12h (53 kW), +24h (51 kW).
   - High model confidence (92.4%), R² score of 0.941, and low error (MAE: ±1.18 kW).
   - Strict non-negative physical constraints for Solar and Wind generation.

3. **Smart Priority Optimization**:
   - Priority 1: Critical Life Support (18 kW) & Heating Essential (12 kW) -> 100% Protected.
   - Priority 2: Research Equipment (10 kW) & Water System (6 kW shifted to solar window).
   - Priority 3: Lighting (4 kW dimming).
   - Priority 4: Non-critical Loads (8 kW shedded during surge).
   - Curtails peak demand from 58 kW down to 47 kW (Net Saving: 11 kW, 4.8 hrs diesel runtime avoided).

4. **Alerts & Anomaly Detection**:
   - `IsolationForest` + Statistical Z-Score (3-Sigma) surveillance.
   - Real-time anomaly detection: **Heater 03 Overload** (12.5 kW vs normal 4-6 kW, +140% deviation, score 0.96).
   - Interactive anomaly timeline scatter visualization and one-click alert resolution.

5. **Digital Twin What-If Simulation**:
   - Tests severe weather shocks: Solar changes (-100% to +100%), Wind changes, Temperature drops (-30°C to +30°C), and Load surges.
   - Side-by-side comparison: **Without Optimization** (24 kWh deficit, 18% battery SOC, 92% critical load) vs **With POLAR-ENERGY AI** (0 kWh deficit, 32% protected SOC, 100% critical load).

6. **Data Management & Reporting**:
   - Ingests CSV & Excel XLSX telemetry files with schema validation.
   - 30-day hourly historical dataset (720 rows) auto-seeded in SQLite (`polar_energy.db`).
   - Daily, weekly, monthly aggregated audit analytics and functional CSV report exporter.

7. **System Settings**:
   - Configurable battery reserve safety floor (>30%), critical overload trigger (55 kW), notification channels, and ML model architectures with SQLite persistence.

---

## Demo Credentials

- **Username**: `admin`
- **Password**: `polar123`
- **Station**: `Bharati Polar Station`

---

## Technology Stack

- **Frontend**: React 18, Vite, Recharts, Lucide-React, Tailwind CSS, Axios, React Router 6.
- **Backend**: Python 3.13, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2.
- **Machine Learning & Data**: Scikit-Learn, Pandas, NumPy, OpenPyXL.
- **Database**: SQLite 3 (`backend/polar_energy.db`).

---

## 1-Click Startup (Windows)

Simply double-click:
```bat
start_project.bat
```
Or start services individually:

### Backend:
```bat
start_backend.bat
```
*Runs on `http://localhost:8000` (API documentation at `http://localhost:8000/docs`)*

### Frontend:
```bat
start_frontend.bat
```
*Runs on `http://localhost:5173`*
