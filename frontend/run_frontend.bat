@echo off
title Frontend - AI Assistant Security Guardrail (React + Vite)
echo ========================================================
echo   AI Assistant Security Guardrail - Frontend UI (SOC)
echo ========================================================
echo Iniciando servidor de desarrollo Vite en http://localhost:5173 ...
cd /d "%~dp0"
if not exist "node_modules" (
    echo Instalando dependencias de Node...
    npm install
)
npm run dev
pause
