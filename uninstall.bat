@echo off
title Minifra Sentinel Customer Portal — Uninstall
echo.
echo  Minifra Sentinel Customer Portal — Uninstall
echo  ─────────────────────────────────────────────
echo.
set /p CONFIRM="  Are you sure you want to uninstall? (y/N): "
if /i "%CONFIRM%" neq "y" (echo  Cancelled. & pause & exit /b 0)

echo  Stopping scheduled task...
schtasks /end /tn "MinifraCustomerPortal" >nul 2>&1
schtasks /delete /tn "MinifraCustomerPortal" /f >nul 2>&1

echo  Removing build artefacts...
if exist "portal\dist" rmdir /s /q "portal\dist"
if exist "portal\node_modules" rmdir /s /q "portal\node_modules"

echo  Clearing config...
set /p DELCFG="  Also delete config/sentinel.config? (y/N): "
if /i "%DELCFG%"=="y" (
    if exist "config\sentinel.config" del /f "config\sentinel.config"
    echo  Config deleted.
)

echo.
echo  Uninstall complete. Source files retained in portal\src\
pause
