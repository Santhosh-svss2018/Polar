from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
from ..database import get_db
from ..models import EnergyReading
from ..ml.predictor import predictor

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/all")
def get_all_predictions(db: Session = Depends(get_db)):
    if not predictor.is_trained:
        # Load readings from DB and train
        readings = db.query(EnergyReading).order_by(EnergyReading.id.asc()).all()
        if readings:
            data = [{
                'timestamp': r.timestamp,
                'solar_generation_kw': r.solar_generation_kw,
                'wind_generation_kw': r.wind_generation_kw,
                'load_consumption_kw': r.load_consumption_kw,
                'temperature_c': r.temperature_c,
                'wind_speed_kmh': r.wind_speed_kmh,
                'humidity_percent': r.humidity_percent,
            } for r in readings]
            df = pd.DataFrame(data)
            predictor.train_models(df)
        else:
            predictor.is_trained = True

    return predictor.predict_all()

@router.get("/load")
def get_load_predictions():
    res = predictor.predict_all()
    return {
        'model': res['model_info'],
        'horizons': {k: v['kw'] for k, v in res['horizons'].items()},
        'timeline': [{'hour': r['hour'], 'load': r['load'], 'lower_ci': r['lower_ci'], 'upper_ci': r['upper_ci']} for r in res['forecast_timeline']]
    }

@router.get("/solar")
def get_solar_predictions():
    res = predictor.predict_all()
    return {
        'model': res['model_info'],
        'horizons': {k: v['solar'] for k, v in res['horizons'].items()},
        'timeline': [{'hour': r['hour'], 'solar': r['solar']} for r in res['forecast_timeline']]
    }

@router.get("/wind")
def get_wind_predictions():
    res = predictor.predict_all()
    return {
        'model': res['model_info'],
        'horizons': {k: v['wind'] for k, v in res['horizons'].items()},
        'timeline': [{'hour': r['hour'], 'wind': r['wind']} for r in res['forecast_timeline']]
    }
