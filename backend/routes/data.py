import os
import io
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
import pandas as pd
from ..database import get_db
from ..models import EnergyReading, UploadedDataset
from ..seed_data import seed_database
from ..ml.predictor import predictor

router = APIRouter(prefix="/data", tags=["data"])

REQUIRED_COLUMNS = [
    "timestamp",
    "solar_generation_kw",
    "wind_generation_kw",
    "diesel_generation_kw",
    "battery_level_percent",
    "load_consumption_kw",
    "temperature_c",
    "wind_speed_kmh",
    "humidity_percent"
]

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename
    content = await file.read()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .csv or .xlsx")

        # Column normalization
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        # Ingest records
        rows_imported = 0
        new_readings = []
        for _, row in df.iterrows():
            ts_val = row.get("timestamp", datetime.utcnow())
            if isinstance(ts_val, str):
                try:
                    ts_val = pd.to_datetime(ts_val).to_pydatetime()
                except Exception:
                    ts_val = datetime.utcnow()

            reading = EnergyReading(
                timestamp=ts_val,
                solar_generation_kw=float(row.get("solar_generation_kw", 0.0)),
                wind_generation_kw=float(row.get("wind_generation_kw", 0.0)),
                diesel_generation_kw=float(row.get("diesel_generation_kw", 0.0)),
                battery_level_percent=float(row.get("battery_level_percent", 74.0)),
                load_consumption_kw=float(row.get("load_consumption_kw", 39.0)),
                temperature_c=float(row.get("temperature_c", -24.3)),
                wind_speed_kmh=float(row.get("wind_speed_kmh", 18.0)),
                humidity_percent=float(row.get("humidity_percent", 65.0)),
                heater03_kw=float(row.get("heater03_kw", 5.2)),
                station_id="Bharati Polar Station"
            )
            new_readings.append(reading)
            rows_imported += 1

        if new_readings:
            db.add_all(new_readings)

        # Record dataset
        ds = UploadedDataset(
            dataset_code=f"DS-{int(datetime.utcnow().timestamp()) % 1000:03d}",
            filename=filename,
            upload_date=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            rows_count=rows_imported,
            format_type="CSV" if filename.endswith(".csv") else "XLSX",
            status="Imported & Ingested",
            size_kb=f"{max(1, round(len(content) / 1024))} KB"
        )
        db.add(ds)
        db.commit()

        # Retrain predictor
        all_readings = db.query(EnergyReading).all()
        df_all = pd.DataFrame([{
            'timestamp': r.timestamp,
            'solar_generation_kw': r.solar_generation_kw,
            'wind_generation_kw': r.wind_generation_kw,
            'load_consumption_kw': r.load_consumption_kw,
            'temperature_c': r.temperature_c,
            'wind_speed_kmh': r.wind_speed_kmh,
            'humidity_percent': r.humidity_percent,
        } for r in all_readings])
        predictor.train_models(df_all)

        return {
            "status": "success",
            "message": f"Successfully ingested {rows_imported} telemetry records from '{filename}' into SQLite.",
            "rows_imported": rows_imported,
            "filename": filename
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File validation/ingestion error: {str(e)}")

@router.get("/datasets")
def get_datasets(db: Session = Depends(get_db)):
    records = db.query(UploadedDataset).order_by(UploadedDataset.id.desc()).all()
    return {
        "datasets": [
            {
                "id": r.dataset_code or f"DS-{r.id:03d}",
                "filename": r.filename,
                "upload_date": r.upload_date,
                "rows": r.rows_count,
                "type": r.format_type,
                "status": r.status,
                "size": r.size_kb,
            }
            for r in records
        ]
    }

@router.get("/stats")
def get_data_stats(db: Session = Depends(get_db)):
    total = db.query(EnergyReading).count()
    return {
        "total_records": total,
        "historical_period": "30 Days (Hourly)",
        "station_name": "Bharati Polar Station",
        "database_type": "SQLite with SQLAlchemy 2.0",
        "last_sync": datetime.utcnow().strftime("%H:%M UTC Today"),
        "storage_size_kb": round(total * 0.45 + 50),
    }

@router.post("/reseed")
def reseed_data(db: Session = Depends(get_db)):
    seed_database(db)
    return {"status": "success", "message": "Demo telemetry reseeded successfully."}

@router.get("/template", response_class=PlainTextResponse)
def get_template():
    header = "timestamp,solar_generation_kw,wind_generation_kw,diesel_generation_kw,battery_level_percent,load_consumption_kw,temperature_c,wind_speed_kmh,humidity_percent\n"
    sample = (
        "2026-08-30T00:00:00Z,0.0,16.5,0.0,76.0,38.5,-25.1,19.2,64.0\n"
        "2026-08-30T06:00:00Z,8.4,14.2,0.0,72.0,37.0,-24.8,17.8,65.0\n"
        "2026-08-30T12:00:00Z,28.0,15.0,0.0,74.0,39.0,-24.3,18.0,65.0\n"
        "2026-08-30T18:00:00Z,10.2,16.0,0.0,70.0,48.0,-24.5,18.5,66.0\n"
    )
    return header + sample
