@echo off
echo ========================================
echo Verificando instalacion de Python...
echo ========================================
echo.

python --version
echo.

echo Verificando pip:
pip --version
echo.

echo Verificando ubicacion de Python:
where python
echo.

echo ========================================
echo Presiona cualquier tecla para cerrar...
pause >nul
