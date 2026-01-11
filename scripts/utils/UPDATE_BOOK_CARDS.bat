@echo off
color 0B
echo.
echo ============================================================
echo    NUEVO DISENO - BOOK CARDS ESTILO OPENLIBRARY
echo ============================================================
echo.
echo Cambios aplicados:
echo   ✅ Aspecto ratio 2:3 (proporciones reales de libro)
echo   ✅ Sombras multicapa tipo libro fisico
echo   ✅ Efecto de lomo de libro
echo   ✅ Sombra de estante
echo   ✅ Badge Premium compacto
echo   ✅ Tipografia minimalista
echo   ✅ Hover con zoom y elevacion
echo.
echo ============================================================
echo.
pause

echo.
echo [1/2] Reiniciando frontend para aplicar cambios...
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

echo [2/2] Esperando a que Next.js compile...
echo.
timeout /t 20 /nobreak
echo.

echo ============================================================
echo    DISENO ACTUALIZADO!
echo ============================================================
echo.
echo Cambios en los archivos:
echo   📄 book-card.tsx - Componente rediseñado
echo   📄 globals.css - Sombras personalizadas agregadas
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir: http://localhost:3000/library
echo.
echo   2. Hacer hard refresh: Ctrl + Shift + R
echo.
echo   3. VERIFICAR:
echo      ✅ Portadas con proporcion 2:3 (mas altas)
echo      ✅ Sombras tipo libro fisico
echo      ✅ Efecto de elevacion al hacer hover
echo      ✅ Diseno limpio y minimalista
echo      ✅ 6 columnas en pantallas grandes
echo.
echo ============================================================
echo.
echo Diferencias vs diseno anterior:
echo.
echo   ANTES:                    AHORA:
echo   - Cards grandes           - Enfoque en portada
echo   - h-48 fixed              - aspect-[2/3] responsive
echo   - Mucha info              - Info minima
echo   - Sombra simple           - Sombras multicapa
echo   - Sin efectos libro       - Lomo + estante
echo.
echo ============================================================
echo.
echo 📖 Ver documentacion completa:
echo    docs\BOOK_CARD_OPENLIBRARY_DESIGN.md
echo.
echo ============================================================
echo.
pause
