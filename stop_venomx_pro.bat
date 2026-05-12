@echo off
setlocal
echo 🛑 VenomX Pro Streaming Server - Shutdown Utility

:: Check for Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not installed or not running.
    pause
    exit /b
)

echo 🐳 Stopping Docker Containers...
docker-compose down

echo.
echo ═══════════════════════════════════════════════════════════
echo ✅ SERVER STOPPED SUCCESSFULLY!
echo ═══════════════════════════════════════════════════════════
echo.
pause
