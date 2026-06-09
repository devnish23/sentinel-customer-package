@echo off
setlocal EnableDelayedExpansion
title Minifra Sentinel Customer Portal — Windows Setup v3.0.1
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║     MINIFRA SENTINEL — Customer Portal Installer v3.0.1     ║
echo  ║           Windows Setup Script (Run as Administrator)        ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

:: ── Privilege check ──────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] This script must be run as Administrator.
    echo  Right-click setup.bat ^> "Run as administrator"
    pause & exit /b 1
)

:: ── Node.js check ────────────────────────────────────────────────
echo  [1/6] Checking prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Download Node.js 20 LTS from: https://nodejs.org/en/download/
    echo  Then re-run this setup script.
    pause & exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo         Node.js found: !NODE_VER!

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] npm is not installed. Reinstall Node.js.
    pause & exit /b 1
)

:: ── Read configuration ───────────────────────────────────────────
echo.
echo  [2/6] Configuration
echo  ─────────────────────────────────────────────────────────────
echo.

:: Check if config exists already
if exist "config\sentinel.config" (
    echo  Existing config found. Loading values...
    for /f "tokens=1,2 delims==" %%a in (config\sentinel.config) do (
        if "%%a"=="API_BASE_URL"       set EXISTING_API=%%b
        if "%%a"=="PORTAL_PORT"        set EXISTING_PORT=%%b
        if "%%a"=="COMPANY_NAME"       set EXISTING_COMPANY=%%b
        if "%%a"=="INSTALL_AS_SERVICE" set EXISTING_SVC=%%b
    )
    echo  Current API URL  : !EXISTING_API!
    echo  Current Port     : !EXISTING_PORT!
    echo  Company Name     : !EXISTING_COMPANY!
    echo.
    set /p RECONFIG="  Re-configure? (y/N): "
    if /i "!RECONFIG!" neq "y" goto :SKIP_CONFIG
)

echo  Enter your Minifra Sentinel Hub API URL
echo  Example: https://192.168.1.10:8443/api/sentinel
echo  (Leave blank to use http://localhost:3001/api/sentinel for local testing)
echo.
set /p API_BASE_URL="  Hub API URL: "
if "!API_BASE_URL!"=="" set API_BASE_URL=http://localhost:3001/api/sentinel

echo.
echo  Enter the port for the Customer Portal web server (default: 3000)
set /p PORTAL_PORT="  Portal port [3000]: "
if "!PORTAL_PORT!"=="" set PORTAL_PORT=3000

echo.
set /p COMPANY_NAME="  Your company name (shown in portal header): "
if "!COMPANY_NAME!"=="" set COMPANY_NAME=My Organisation

echo.
set /p INSTALL_SVC="  Install as Windows Service (auto-start on boot)? (Y/n): "
if "!INSTALL_SVC!"=="" set INSTALL_SVC=y
if /i "!INSTALL_SVC!"=="n" (set INSTALL_AS_SERVICE=false) else (set INSTALL_AS_SERVICE=true)

:: Save config
if not exist "config" mkdir config
(
    echo API_BASE_URL=!API_BASE_URL!
    echo PORTAL_PORT=!PORTAL_PORT!
    echo COMPANY_NAME=!COMPANY_NAME!
    echo INSTALL_AS_SERVICE=!INSTALL_AS_SERVICE!
    echo INSTALLED_AT=%DATE% %TIME%
    echo VERSION=3.0.1
) > config\sentinel.config

:SKIP_CONFIG
:: Load config into vars
for /f "tokens=1,2 delims==" %%a in (config\sentinel.config) do (
    if "%%a"=="API_BASE_URL"  set API_BASE_URL=%%b
    if "%%a"=="PORTAL_PORT"   set PORTAL_PORT=%%b
    if "%%a"=="COMPANY_NAME"  set COMPANY_NAME=%%b
    if "%%a"=="INSTALL_AS_SERVICE" set INSTALL_AS_SERVICE=%%b
)

:: ── Patch index.html with runtime config ────────────────────────
echo.
echo  [3/6] Writing runtime configuration into portal...
powershell -NoProfile -Command ^
    "(Get-Content 'portal\index.html') -replace 'SENTINEL_API_BASE_URL_PLACEHOLDER', '%API_BASE_URL%' | Set-Content 'portal\index.html'"
echo         API endpoint: !API_BASE_URL!

:: ── Install dependencies ─────────────────────────────────────────
echo.
echo  [4/6] Installing portal dependencies (this may take 1-2 minutes)...
cd portal
call npm install --silent
if %errorlevel% neq 0 (
    echo  [ERROR] npm install failed. Check your internet connection or proxy settings.
    cd ..
    pause & exit /b 1
)

:: ── Build portal ─────────────────────────────────────────────────
echo.
echo  [5/6] Building portal for production...
set VITE_API_BASE_URL=!API_BASE_URL!
call npm run build
if %errorlevel% neq 0 (
    echo  [ERROR] Build failed. See output above for details.
    cd ..
    pause & exit /b 1
)
cd ..
echo         Build complete. Output in portal\dist\

:: ── Service installation ─────────────────────────────────────────
echo.
echo  [6/6] Setting up service...
if /i "!INSTALL_AS_SERVICE!"=="true" (
    echo  Installing as Windows Service using node http-server...
    cd portal
    call npm install -g http-server >nul 2>&1
    cd ..

    :: Create a simple startup batch for the service wrapper
    (
        echo @echo off
        echo cd /d "%~dp0portal"
        echo npx http-server dist -p !PORTAL_PORT! --cors -c-1
    ) > scripts\start-portal.bat

    :: Use sc.exe to register as service via a VBScript wrapper
    set SVC_NAME=MinifraCustomerPortal
    sc query !SVC_NAME! >nul 2>&1
    if %errorlevel% equ 0 (
        sc stop !SVC_NAME! >nul 2>&1
        sc delete !SVC_NAME! >nul 2>&1
        echo  Removed old service.
    )

    :: Register using Windows Task Scheduler (works without NSSM)
    schtasks /create /tn "MinifraCustomerPortal" /tr "\"%~dp0scripts\start-portal.bat\"" /sc onstart /ru SYSTEM /f >nul 2>&1
    if %errorlevel% equ 0 (
        schtasks /run /tn "MinifraCustomerPortal" >nul 2>&1
        echo  Service registered and started.
    ) else (
        echo  [WARN] Could not register as scheduled task. Starting manually instead.
        start "MinifraCustomerPortal" /b cmd /c "%~dp0scripts\start-portal.bat"
    )
) else (
    (
        echo @echo off
        echo cd /d "%~dp0portal"
        echo npx http-server dist -p !PORTAL_PORT! --cors -c-1
        echo pause
    ) > scripts\start-portal.bat
    echo  Manual start script saved to scripts\start-portal.bat
    echo  Run scripts\start-portal.bat to start the portal.
)

:: ── Done ─────────────────────────────────────────────────────────
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                  Installation Complete!                      ║
echo  ╠══════════════════════════════════════════════════════════════╣
echo  ║                                                              ║
echo  ║  Portal URL  : http://localhost:!PORTAL_PORT!                         ║
echo  ║  Hub API     : !API_BASE_URL!
echo  ║  Docs        : file:///%~dp0docs\index.html                  ║
echo  ║  KB Articles : file:///%~dp0docs\kb\index.html               ║
echo  ║                                                              ║
echo  ║  To reconfigure: run setup.bat again                         ║
echo  ║  To uninstall:   run uninstall.bat                           ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
pause
