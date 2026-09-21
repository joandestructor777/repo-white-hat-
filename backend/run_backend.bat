@echo off
title Backend - AI Assistant Security Guardrail (FastAPI)
echo ========================================================
echo   AI Assistant Security Guardrail - FastAPI + PostgreSQL
echo ========================================================
echo Iniciando servidor backend en http://localhost:8000 ...
cd /d "%~dp0"
if not exist "venv" (
    echo Creando entorno virtual Python...
    python -m venv venv
    call .\venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .\venv\Scripts\activate
)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
