@echo off
set BACKEND_DIR=g:\Download Official\New folder (19)\evorise-backend
set FRONTEND_DIR=g:\Download Official\New folder (19)\evorise-frontend

echo Starting EvoRise Solutions...

echo Starting backend...
start "EvoRise Backend" cmd /c "cd /d "%BACKEND_DIR%" && .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting frontend...
start "EvoRise Frontend" cmd /c "cd /d "%FRONTEND_DIR%" && npm run dev"

echo Both servers have been launched in new windows.
pause
