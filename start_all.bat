@echo off
title JoanVector - AI Security Guardrail Lanzador
echo ======================================================================
echo       JOANVECTOR - AI ASSISTANT CYBERSECURITY GUARDRAIL
echo ======================================================================
echo.
echo Iniciando el ecosistema completo (FastAPI Backend + Vite Frontend)...
echo.

cd /d "%~dp0"

echo [1/2] Levantando Backend (FastAPI + SQLite/PostgreSQL)...
start "Backend - FastAPI SOC Engine" cmd /k "cd /d %~dp0backend && call run_backend.bat"

timeout /t 3 /nobreak >nul

echo [2/2] Levantando Frontend (React + Vite + Feature Architecture)...
start "Frontend - SOC & Assistant UI" cmd /k "cd /d %~dp0frontend && call run_frontend.bat"

echo.
echo ======================================================================
echo   Todo en marcha:
echo   - Backend API Docs (Swagger): http://localhost:8000/docs
echo   - Frontend Web Application:   http://localhost:5173
echo ======================================================================
echo Puedes minimizar esta ventana. Para detener el sistema, cierra las dos consolas abiertas.
pause
