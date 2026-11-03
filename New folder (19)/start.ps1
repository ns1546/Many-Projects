$backendDir = "g:\Download Official\New folder (19)\evorise-backend"
$frontendDir = "g:\Download Official\New folder (19)\evorise-frontend"

Write-Host "Starting EvoRise Solutions..."

# Start backend using python.exe directly to avoid ExecutionPolicy errors with Activate.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$backendDir`"; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$frontendDir`"; npm run dev"

Write-Host "Both servers have been launched in new windows."
