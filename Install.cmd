@echo off
setlocal
title SpaceTheme - Automatic Installer
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install.ps1" %*
set "result=%errorlevel%"
echo.
if not "%result%"=="0" echo Installation did not complete. Read the message above.
pause
exit /b %result%
