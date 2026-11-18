@echo off
title Backend - JoanVector FastAPI Engine
echo Iniciando servidor backend en http://localhost:8000 ...
cd /d "%~dp0"
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
