@echo off
title BioLens AI Launcher

cd /d "%~dp0"

start "BioLens Backend" cmd /k "cd /d "%~dp0.." && "%~dp0..\venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

start "BioLens Frontend" cmd /k "cd /d "%~dp0ui-integration" && npm run dev"

timeout /t 5 /nobreak >nul

start "" "http://localhost:3000"

exit
