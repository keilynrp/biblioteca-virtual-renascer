@echo off
REM Script to generate self-signed SSL certificates for local development (Windows)
REM Requires OpenSSL to be installed (can use Git Bash's OpenSSL)

setlocal
set DOMAIN=localhost
set CERT_DIR=%~dp0
set DAYS=365

echo ================================================
echo Generating SSL Certificates for Local Development
echo ================================================
echo.
echo Domain: %DOMAIN%
echo Certificate Directory: %CERT_DIR%
echo Validity: %DAYS% days
echo.

REM Check if OpenSSL is available
where openssl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: OpenSSL not found!
    echo.
    echo Please install OpenSSL or use Git Bash which includes it.
    echo You can run: bash generate-certs.sh
    pause
    exit /b 1
)

REM Generate private key
echo Generating private key...
openssl genrsa -out "%CERT_DIR%localhost.key" 2048

REM Generate certificate signing request
echo Generating certificate signing request...
openssl req -new -key "%CERT_DIR%localhost.key" -out "%CERT_DIR%localhost.csr" -subj "/C=BR/ST=State/L=City/O=Renascer Saber/OU=Development/CN=localhost"

REM Create config file for SAN
echo authorityKeyIdentifier=keyid,issuer > "%CERT_DIR%localhost.ext"
echo basicConstraints=CA:FALSE >> "%CERT_DIR%localhost.ext"
echo keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment >> "%CERT_DIR%localhost.ext"
echo subjectAltName = @alt_names >> "%CERT_DIR%localhost.ext"
echo. >> "%CERT_DIR%localhost.ext"
echo [alt_names] >> "%CERT_DIR%localhost.ext"
echo DNS.1 = localhost >> "%CERT_DIR%localhost.ext"
echo DNS.2 = *.localhost >> "%CERT_DIR%localhost.ext"
echo IP.1 = 127.0.0.1 >> "%CERT_DIR%localhost.ext"
echo IP.2 = ::1 >> "%CERT_DIR%localhost.ext"

REM Generate self-signed certificate
echo Generating self-signed certificate...
openssl x509 -req -in "%CERT_DIR%localhost.csr" -signkey "%CERT_DIR%localhost.key" -out "%CERT_DIR%localhost.crt" -days %DAYS% -extfile "%CERT_DIR%localhost.ext"

REM Clean up
del "%CERT_DIR%localhost.csr"
del "%CERT_DIR%localhost.ext"

echo.
echo ================================================
echo SSL Certificates generated successfully!
echo ================================================
echo.
echo Files created:
echo   - Certificate: %CERT_DIR%localhost.crt
echo   - Private Key: %CERT_DIR%localhost.key
echo.
echo NEXT STEPS:
echo.
echo 1. Trust the certificate in Windows:
echo    - Double-click 'localhost.crt'
echo    - Click 'Install Certificate'
echo    - Select 'Local Machine' (requires admin) or 'Current User'
echo    - Select 'Place all certificates in the following store'
echo    - Click 'Browse' and select 'Trusted Root Certification Authorities'
echo    - Click 'Next' and 'Finish'
echo.
echo 2. Restart Docker containers:
echo    docker compose down
echo    docker compose up -d
echo.
echo 3. Access your application at:
echo    https://localhost
echo.
echo ================================================
pause
