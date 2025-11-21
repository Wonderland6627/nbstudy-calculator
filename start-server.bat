@echo off
setlocal enabledelayedexpansion
echo Starting local server...
echo.

REM 获取本机IP地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "LOCAL_IP=%%a"
    set "LOCAL_IP=!LOCAL_IP: =!"
    goto :found
)
:found

echo ========================================
echo Local server started!
echo ========================================
echo.
echo Computer access:
echo   http://localhost:8000
echo.
echo Mobile access (same WiFi):
if defined LOCAL_IP (
    echo   http://!LOCAL_IP!:8000
) else (
    echo   Please check your IP address manually:
    echo   Run: ipconfig
    echo   Look for IPv4 Address under your WiFi adapter
)
echo.
echo ========================================
echo Press Ctrl+C to stop the server
echo ========================================
echo.
python -m http.server 8000

