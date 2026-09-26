@echo off
title Frontend - JoanVector (React + Vite)
echo ========================================================
echo   JoanVector - SOC Console & Assistant Portal
echo ========================================================
echo Iniciando servidor de desarrollo Vite en http://localhost:5173 ...
cd /d "%~dp0"
if not exist "node_modules" (
    echo Instalando dependencias de Node...
    npm install
)
npm run dev
pause
