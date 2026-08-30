@echo off
title POLAR-ENERGY AI Backend Service (Port 8000)
echo ========================================================
echo POLAR-ENERGY AI — POLAR SMART ENERGY MANAGEMENT SYSTEM
echo Starting Python FastAPI Telemetry Backend...
echo ========================================================

python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
