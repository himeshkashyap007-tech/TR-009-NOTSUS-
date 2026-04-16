@echo off
echo ===============================================
echo LinguaVault - Heritage Language Preservation
echo ===============================================
echo.

echo Starting Backend Server...
cd /d "%~dp0backend"
start "LinguaVault Backend" cmd /k "python main.py"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Development Server...
cd /d "%~dp0frontend"
start "LinguaVault Frontend" cmd /k "npm run dev"

echo.
echo ===============================================
echo LinguaVault is starting up!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ===============================================
echo.
pause
