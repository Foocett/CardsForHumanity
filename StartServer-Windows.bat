@echo off
cls

:: Check for Node.js and install if not present
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Installing...
    call :installNode
) else (
    echo Node.js is already installed.
)

:: Run the JavaScript file
node main.js

:: Display the local IP address
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R /C:"IPv4.*"') do (
    set local_ip=%%i
)
echo Your local IP address is:%local_ip%

:: Display the public IP address
for /f "tokens=* USEBACKQ" %%f in (`powershell -Command "(Invoke-WebRequest -uri http://icanhazip.com).Content.trim()"`) do (
    set public_ip=%%f
)
echo Your public IP address is: %public_ip%

:: Wait for user input to close the script
pause
exit

:: Function to install Node.js using nvm-windows
:installNode
    powershell -Command "Invoke-WebRequest -Uri https://github.com/coreybutler/nvm-windows/releases/download/1.1.9/nvm-setup.zip -OutFile nvm-setup.zip"
    powershell -Command "Expand-Archive -Path nvm-setup.zip -DestinationPath .\nvm-setup"
    cd nvm-setup
    start nvm-setup.exe
    echo Please install Node.js using nvm and restart the script.
    exit
