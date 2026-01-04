@echo off
color 0A
echo.
echo ============================================================
echo    APLICAR FUNCIONALIDAD DE SIDEBAR COLAPSABLE
echo ============================================================
echo.
echo CAMBIOS REALIZADOS:
echo   ✅ Agregado estado isSidebarCollapsed
echo   ✅ Persistencia en localStorage
echo   ✅ Ancho dinamico: 72px (expandido) / 20px (colapsado)
echo   ✅ Boton toggle con iconos ChevronLeft/ChevronRight
echo   ✅ Tooltips al hacer hover cuando esta colapsado
echo   ✅ Transiciones suaves (300ms)
echo   ✅ Solo en desktop (prefijo md:)
echo.
echo ARCHIVO MODIFICADO:
echo   📄 frontend/src/app/(dashboard)/layout.tsx
echo.
echo ============================================================
echo.
pause

echo.
echo [1/3] Reiniciando FRONTEND para aplicar cambios...
echo.
docker compose restart frontend
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo reiniciar el frontend
    pause
    exit /b 1
)
echo ✅ Frontend reiniciado
echo.

echo [2/3] Esperando 15 segundos a que el frontend inicie...
echo.
timeout /t 15 /nobreak
echo.

echo [3/3] Verificando que el frontend responde...
echo.
curl -s "http://localhost:3000" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend respondiendo correctamente
) else (
    echo ⚠️  Frontend aun no responde, espera unos segundos mas
)
echo.

echo ============================================================
echo    CAMBIOS APLICADOS!
echo ============================================================
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir: http://localhost:3000/dashboard
echo.
echo   2. Iniciar sesion si es necesario
echo.
echo   3. VERIFICAR LA FUNCIONALIDAD:
echo.
echo      ✅ Ver boton de colapsar en la parte inferior del sidebar
echo      ✅ Click en el boton para colapsar
echo      ✅ Sidebar se reduce a solo iconos (20px ancho)
echo      ✅ Hover sobre iconos muestra tooltips
echo      ✅ Click nuevamente para expandir
echo      ✅ Estado persiste al recargar pagina (localStorage)
echo.
echo ============================================================
echo.
echo Como funciona:
echo.
echo   Estado Expandido (por defecto):
echo     - Ancho: 288px (72 * 4px = w-72)
echo     - Muestra logo + texto "Biblioteca Virtual"
echo     - Items del menu con icono + texto
echo     - Boton muestra ChevronLeft + "Contraer"
echo.
echo   Estado Colapsado:
echo     - Ancho: 80px (20 * 4px = w-20)
echo     - Solo muestra logo icono
echo     - Items del menu solo iconos (centrados)
echo     - Tooltips aparecen al hacer hover
echo     - Boton muestra solo ChevronRight
echo.
echo   Persistencia:
echo     - Estado guardado en localStorage
echo     - Clave: 'sidebarCollapsed'
echo     - Se mantiene entre sesiones
echo.
echo ============================================================
echo.
echo Prueba rapida:
echo.
echo   1. Abre http://localhost:3000/dashboard
echo   2. Busca el boton al final del sidebar (icono flecha)
echo   3. Click en el boton
echo   4. El sidebar debe animarse a solo iconos
echo   5. Pasa el mouse sobre los iconos
echo   6. Deben aparecer tooltips con los nombres
echo   7. Recarga la pagina (F5)
echo   8. El sidebar debe mantener el estado colapsado
echo.
echo ============================================================
echo.
pause
