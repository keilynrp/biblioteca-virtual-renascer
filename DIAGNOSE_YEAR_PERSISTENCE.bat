@echo off
echo ====================================
echo DIAGNOSTICO: Year Persistence Issue
echo ====================================
echo.

echo Este script te ayudara a diagnosticar por que el año aparece como N/A
echo despues de guardarlo.
echo.
pause

:MENU
cls
echo ====================================
echo MENU DE DIAGNOSTICO
echo ====================================
echo.
echo [1] Verificar datos en la base de datos
echo [2] Ver logs del backend
echo [3] Ver logs del frontend
echo [4] Probar endpoint de actualizacion
echo [5] Ver estado de un libro especifico
echo [0] Salir
echo.
set /p choice="Selecciona una opcion: "

if "%choice%"=="1" goto CHECK_DB
if "%choice%"=="2" goto CHECK_BACKEND_LOGS
if "%choice%"=="3" goto CHECK_FRONTEND_LOGS
if "%choice%"=="4" goto TEST_UPDATE
if "%choice%"=="5" goto CHECK_BOOK
if "%choice%"=="0" goto END

echo Opcion invalida
timeout /t 2 >nul
goto MENU

:CHECK_DB
cls
echo ====================================
echo VERIFICACION DE BASE DE DATOS
echo ====================================
echo.
echo Conectando a PostgreSQL...
echo.

docker exec -it bvs_framework-db-1 psql -U bvsuser -d bvsdb -c "SELECT id, title, publication_date, isbn, created_at FROM content_book ORDER BY id DESC LIMIT 10;"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo conectar a la base de datos
    echo.
    echo Intentando con nombre alternativo del contenedor...
    docker ps | findstr postgres
    echo.
    echo Copia el nombre del contenedor de postgres y ejecuta:
    echo docker exec -it [NOMBRE_CONTENEDOR] psql -U bvsuser -d bvsdb -c "SELECT id, title, publication_date FROM content_book LIMIT 10;"
) else (
    echo.
    echo [OK] Datos recuperados exitosamente
    echo.
    echo ANALISIS:
    echo ---------
    echo Si ves NULL en publication_date = El dato NO se esta guardando
    echo Si ves una fecha (ej: 2024-01-01) = El dato SI se guardo
    echo.
    echo Si el dato se guardo pero aparece N/A en la tabla:
    echo - El problema esta en el FRONTEND
    echo - El componente no esta leyendo el dato correctamente
    echo.
    echo Si el dato NO se guardo:
    echo - El problema esta en el BACKEND o en el envio
    echo - Revisa los logs del backend (opcion 2)
)

echo.
pause
goto MENU

:CHECK_BACKEND_LOGS
cls
echo ====================================
echo LOGS DEL BACKEND
echo ====================================
echo.
echo Mostrando ultimos 50 logs...
echo Busca errores relacionados con "publication_date"
echo.
pause

docker logs bvs_framework-backend-1 --tail 50

echo.
echo ====================================
echo.
echo BUSCA:
echo - "publication_date"
echo - "ValidationError"
echo - "KeyError"
echo - Errores 400 o 500
echo.
pause
goto MENU

:CHECK_FRONTEND_LOGS
cls
echo ====================================
echo LOGS DEL FRONTEND
echo ====================================
echo.
echo Mostrando ultimos 50 logs...
echo Busca errores de compilacion o warnings
echo.
pause

docker logs bvs_framework-frontend-1 --tail 50

echo.
echo ====================================
echo.
echo BUSCA:
echo - Errores de TypeScript
echo - "publication_year"
echo - "YearPicker"
echo - Compilation errors
echo.
pause
goto MENU

:TEST_UPDATE
cls
echo ====================================
echo TEST DE ACTUALIZACION MANUAL
echo ====================================
echo.

set /p book_id="Ingresa el ID del libro a probar: "
set /p year="Ingresa el año a setear (ej: 2024): "

echo.
echo Preparando datos...
echo.

REM Crear archivo temporal con los datos
echo { > temp_book_data.json
echo   "publication_date": "%year%-01-01" >> temp_book_data.json
echo } >> temp_book_data.json

echo Datos a enviar:
type temp_book_data.json
echo.
echo.

set /p confirm="Enviar actualizacion? (S/N): "
if /i not "%confirm%"=="S" (
    del temp_book_data.json
    goto MENU
)

echo.
echo Obteniendo slug del libro...

REM Necesitamos el token y el slug - esto es complicado en batch
echo.
echo [INFO] Para hacer un test completo, necesitas:
echo.
echo 1. Token de autenticacion
echo 2. Slug del libro
echo.
echo Ejecuta esto en tu terminal:
echo.
echo curl -X PATCH http://localhost:8000/api/content/books/[SLUG]/ \
echo   -H "Authorization: Bearer [TU_TOKEN]" \
echo   -H "Content-Type: application/json" \
echo   -d "{\"publication_date\": \"%year%-01-01\"}"
echo.
echo Para obtener el token:
echo 1. Abre DevTools (F12)
echo 2. Ve a Application ^> Local Storage
echo 3. Busca "accessToken"
echo.
echo Para obtener el slug:
echo 1. Ve a la tabla de libros
echo 2. El slug suele ser el titulo en minusculas con guiones
echo.

del temp_book_data.json 2>nul

pause
goto MENU

:CHECK_BOOK
cls
echo ====================================
echo VERIFICAR LIBRO ESPECIFICO
echo ====================================
echo.

set /p book_id="Ingresa el ID del libro: "

echo.
echo Verificando libro ID %book_id%...
echo.
echo En la base de datos:
docker exec -it bvs_framework-db-1 psql -U bvsuser -d bvsdb -c "SELECT id, title, slug, publication_date, isbn FROM content_book WHERE id=%book_id%;"

echo.
echo ====================================
echo.
echo INTERPRETACION:
echo.
echo Si publication_date es NULL:
echo   - El dato NO esta en la BD
echo   - El problema esta en el guardado
echo   - Opcion 2 para ver logs del backend
echo.
echo Si publication_date tiene valor (ej: 2024-01-01):
echo   - El dato SI esta en la BD
echo   - El problema esta en el frontend
echo   - El componente no lo muestra correctamente
echo.
echo SIGUIENTE PASO:
echo Si el dato esta en BD pero no se muestra:
echo   1. Verifica que el YearPicker este usando publication_date
echo   2. Verifica handleOpenDialog en admin/books/page.tsx
echo   3. Ejecuta: FIX_YEAR_PICKER_SUPER.bat
echo.

pause
goto MENU

:END
cls
echo ====================================
echo DIAGNOSTICO FINALIZADO
echo ====================================
echo.
echo Para resolver el problema:
echo.
echo 1. Si el dato NO se guarda en BD:
echo    - Revisa backend/apps/content/views.py
echo    - Verifica que el serializer acepta publication_date
echo    - Ejecuta: docker logs bvs_framework-backend-1 --tail 100
echo.
echo 2. Si el dato SI se guarda pero no se muestra:
echo    - Ejecuta: FIX_YEAR_PICKER_SUPER.bat
echo    - Verifica admin/books/page.tsx handleOpenDialog
echo    - Haz hard reload (Ctrl+Shift+R)
echo.
echo 3. Si aun no funciona:
echo    - Lee: YEAR_PICKER_FIX_PERSISTENCE.md
echo    - Ejecuta: TEST_YEAR_PICKER.bat
echo.
pause
exit /b

endlocal
