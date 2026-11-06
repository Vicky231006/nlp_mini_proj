@echo off
setlocal
cd /d "%~dp0"
echo ==============================================================
echo   Launching NCERT Adaptive AI Tutor Services...
echo ==============================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0startup.ps1" %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Startup failed or terminated with code %ERRORLEVEL%]
    pause
)

