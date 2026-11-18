@echo off
title JoanVector - AI Cybersecurity Guardrail
echo ======================================================================
echo       JOANVECTOR - AI CYBERSECURITY GUARDRAIL ^& SOC ENGINE
echo ======================================================================
echo.
echo Iniciando Backend (FastAPI) y Frontend (React + Vite)...
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Backend en puerto 8000...
start "JoanVector - Backend Engine" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend en puerto 5173...
start "JoanVector - Frontend Console" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo   Todo en marcha:
echo   - Frontend Web Application:   http://localhost:5173
echo   - Backend Swagger Docs:       http://localhost:8000/docs
echo   - Health Check Endpoint:      http://localhost:8000/health
echo ======================================================================
echo Puedes minimizar esta ventana.
pause
