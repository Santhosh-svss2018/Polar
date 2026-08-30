@echo off
title POLAR-ENERGY AI — Launcher
echo ========================================================
echo POLAR-ENERGY AI — POLAR SMART ENERGY MANAGEMENT SYSTEM
echo Launching Backend (FastAPI :8000) and Frontend (Vite :5173)...
echo ========================================================

start "POLAR-ENERGY AI Backend" cmd /k "call start_backend.bat"
timeout /t 3 /nobreak >nul
start "POLAR-ENERGY AI Frontend" cmd /k "call start_frontend.bat"

echo.
echo Both services launched!
echo Access the application at: http://localhost:5173
echo Backend API documentation: http://localhost:8000/docs
echo.
