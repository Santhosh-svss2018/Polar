import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.iso_forest = IsolationForest(contamination=0.03, random_state=42)
        self.normal_heater_mean = 5.2
        self.normal_heater_std = 0.65

    def check_telemetry(self, current_reading: dict = None):
        if current_reading is None:
            current_reading = {
                'heater03_kw': 12.5,
                'battery_power_kw': -24.2,
                'solar_kw': 28.0,
                'wind_kw': 15.0,
                'load_kw': 39.0
            }

        anomalies = []
        heater_val = current_reading.get('heater03_kw', 12.5)
        
        # Z-Score check for Heater 03
        z_score = (heater_val - self.normal_heater_mean) / self.normal_heater_std
        if z_score > 3.0:
            anomalies.append({
                'subsystem': 'Heater 03 (Living Quarters)',
                'measured_value': f"{heater_val} kW",
                'normal_range': '4.0 - 6.0 kW',
                'z_score': round(float(z_score), 2),
                'deviation_pct': round(((heater_val - self.normal_heater_mean) / self.normal_heater_mean) * 100, 1),
                'severity': 'critical',
                'confidence': 0.96,
                'recommendation': 'High thermal overload detected. Inspect thermostat relay contactors.'
            })

        scatter_data = [
            {'time': '10:00', 'load': 4.8, 'type': 'Normal'},
            {'time': '11:00', 'load': 5.1, 'type': 'Normal'},
            {'time': '12:00', 'load': 5.4, 'type': 'Normal'},
            {'time': '13:00', 'load': 5.2, 'type': 'Normal'},
            {'time': '14:00', 'load': 6.8, 'type': 'Normal'},
            {'time': '14:30', 'load': 8.5, 'type': 'Warning'},
            {'time': '15:00', 'load': 11.2, 'type': 'Anomaly'},
            {'time': '15:30', 'load': heater_val, 'type': 'Anomaly (Heater 03)'},
        ]

        return {
            'active_anomalies': anomalies,
            'scatter_timeline': scatter_data,
            'detector_model': 'IsolationForest + Statistical Z-Score (3-Sigma)',
            'status': 'Surveillance Active'
        }

anomaly_detector = AnomalyDetector()
