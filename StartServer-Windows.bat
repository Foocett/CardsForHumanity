@echo off
cls
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