@echo off
setlocal
echo 🚀 VenomX Pro Streaming Server - Startup Utility

:: Check for Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not installed or not running.
    echo Please install Docker Desktop and try again.
    pause
    exit /b
)

echo 🐳 Starting Docker Containers...
docker-compose up -d

echo 📊 Checking Server Status...
timeout /t 5 /nobreak >nul

:: Robust IP detection for Windows
set "SERVER_IP=127.0.0.1"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" ^| findstr /r "192.168. 10. 172."') do (
    set "SERVER_IP=%%a"
    goto :IP_FOUND
)
:IP_FOUND
set "SERVER_IP=%SERVER_IP: =%"

echo window.SERVER_CONFIG = { ip: "%SERVER_IP%" }; > .\dashboard\config.js

echo ═══════════════════════════════════════════════════════════
echo ✅ SERVER READY!
echo.
echo 🌐 DASHBOARD:      http://%SERVER_IP%:8080
echo 🔌 OBS ENDPOINT:    rtmp://%SERVER_IP%:1935/live
echo 📺 STREAM KEY:      stream
echo ═══════════════════════════════════════════════════════════
echo.
echo Keep this window open or close it (containers run in background).
echo.
pause
