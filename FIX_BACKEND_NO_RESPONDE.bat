@echo off
chcp 65001 >nul
cls

echo ================================================================
echo     SOLUCION: Backend no responde en puerto 8000
echo ================================================================
echo.

echo Paso 1: Reiniciando el backend...
docker-compose restart backend
echo Esperando 10 segundos...
timeout /t 10 /nobreak
echo.

echo Paso 2: Verificando logs del backend...
docker logs --tail 30 bvs_framework-backend-1
echo.

echo Paso 3: Probando conexión al puerto 8000...
powershell -Command "Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet"
if %errorlevel% equ 0 (
    echo [OK] Puerto 8000 respondiendo!
) else (
    echo [ERROR] Puerto 8000 sigue sin responder.
    echo.
    echo Intentando solución más profunda...
    echo.

    echo Paso 4: Deteniendo y recreando el backend...
    docker-compose up -d --force-recreate backend
    echo Esperando 15 segundos...
    timeout /t 15 /nobreak
    echo.

    echo Paso 5: Verificando nuevamente...
    docker logs --tail 20 bvs_framework-backend-1
    echo.

    powershell -Command "Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet"
    if %errorlevel% equ 0 (
        echo [OK] Puerto 8000 respondiendo ahora!
    ) else (
        echo [ERROR] El problema persiste.
        echo.
        echo EJECUTA: DIAGNOSTICO_BACKEND_AHORA.bat
        echo Y pega la salida completa para identificar el error específico.
    )
)

echo.
echo ================================================================
echo Prueba acceder a: http://localhost:8000/admin/
echo ================================================================
pause
