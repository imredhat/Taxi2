@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"

where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo Node.js and npm must be installed and available on PATH.
    exit /b 1
)

for %%P in (Server UserApp App Web) do (
    if not exist "%ROOT%%%P\package.json" (
        echo Project folder missing: %%P
        exit /b 1
    )
    if not exist "%ROOT%%%P\node_modules\.bin\" (
        echo Dependencies missing in %%P. Run npm install in that folder.
        exit /b 1
    )
)

echo Web:     http://localhost:3000
echo Server:  http://localhost:3001
echo App:     http://localhost:8081
echo UserApp: http://localhost:8082
echo.

powershell.exe -NoProfile -NonInteractive -Command "$ErrorActionPreference='Stop'; $ports=3000,3001,8081,8082; $listeners=[System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners(); $busy=@($listeners | Where-Object { $_.Port -in $ports } | Select-Object -ExpandProperty Port -Unique); if($busy.Count){Write-Host ('Ports already in use: '+($busy -join ', ')); exit 1}; Write-Host 'All four ports are available.'"
if errorlevel 1 (
    echo Launch cancelled. Close the existing services and try again.
    exit /b 1
)
if /i "%~1"=="--check" exit /b 0

start "Taxi2 Server - 3001" /D "%ROOT%Server" cmd.exe /k "set PORT=3001&&npm run dev"
start "Taxi2 Web - 3000" /D "%ROOT%Web" cmd.exe /k "npm run dev"
start "Taxi2 App - 8081" /D "%ROOT%App" cmd.exe /k "npm start -- --web --port 8081"
start "Taxi2 UserApp - 8082" /D "%ROOT%UserApp" cmd.exe /k "npm start -- --web --port 8082"
