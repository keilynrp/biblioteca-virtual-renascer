@echo off
echo ====================================
echo Aplicando Fix de Persistencia
echo Year Picker Component
echo ====================================
echo.

echo Reiniciando contenedor frontend...
docker compose restart frontend

echo.
echo Esperando a que el frontend inicie...
timeout /t 10 /nobreak >nul

echo.
echo ====================================
echo Fix Aplicado!
echo ====================================
echo.
echo IMPORTANTE:
echo 1. Abre el navegador
echo 2. Presiona Ctrl+Shift+R para hard reload
echo 3. Ve a Admin ^> Libros
echo 4. Edita un libro existente con año
echo 5. Verifica que el año se muestra correctamente
echo.
echo Si el problema persiste:
echo - Revisa la consola del navegador (F12)
echo - Lee YEAR_PICKER_FIX_PERSISTENCE.md para debugging
echo.
pause
