@echo off
setlocal enabledelayedexpansion

echo ====================================
echo TEST YEAR PICKER - Suite de Pruebas
echo ====================================
echo.

echo Este script te guiara a traves de las pruebas funcionales
echo del componente Year Picker.
echo.
echo IMPORTANTE: Ten el navegador abierto en Admin ^> Libros
echo.
pause

:MENU
cls
echo ====================================
echo MENU DE PRUEBAS - YEAR PICKER
echo ====================================
echo.
echo [1] Test Suite 1 - Creacion de Libros
echo [2] Test Suite 2 - Edicion y Persistencia (CRITICO)
echo [3] Test Suite 3 - Navegacion del Selector
echo [4] Test Suite 4 - Interfaz y UX
echo [5] Test Suite 5 - Validaciones y Errores
echo [6] Test Suite 6 - Casos Edge
echo.
echo [7] Ejecutar TODAS las pruebas (Completo)
echo [8] Ver documentacion completa (TEST_YEAR_PICKER.md)
echo [9] Reiniciar Frontend
echo [0] Salir
echo.
set /p choice="Selecciona una opcion: "

if "%choice%"=="1" goto TEST_SUITE_1
if "%choice%"=="2" goto TEST_SUITE_2
if "%choice%"=="3" goto TEST_SUITE_3
if "%choice%"=="4" goto TEST_SUITE_4
if "%choice%"=="5" goto TEST_SUITE_5
if "%choice%"=="6" goto TEST_SUITE_6
if "%choice%"=="7" goto ALL_TESTS
if "%choice%"=="8" goto VIEW_DOCS
if "%choice%"=="9" goto RESTART_FRONTEND
if "%choice%"=="0" goto END

echo Opcion invalida
timeout /t 2 >nul
goto MENU

:TEST_SUITE_1
cls
echo ====================================
echo TEST SUITE 1: CREACION DE LIBROS
echo ====================================
echo.

echo [TEST 1.1] Crear Libro con Año
echo --------------------------------
echo.
echo PASOS:
echo 1. Ve a Admin ^> Libros
echo 2. Haz clic en "Crear Libro"
echo 3. Llena campos obligatorios (Titulo, Autor, Categoria, Descripcion)
echo 4. En "Año de Publicacion":
echo    - Haz clic en "Seleccionar año"
echo    - El popover debe abrirse
echo    - Debe mostrar la decada actual (2012-2023)
echo 5. Haz clic en "2024"
echo 6. Verifica que el boton muestra "2024"
echo 7. Haz clic en "Crear"
echo.
echo RESULTADO ESPERADO:
echo [+] Libro creado exitosamente
echo [+] Mensaje de confirmacion
echo [+] Libro aparece en la tabla con año 2024
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 1.1 PASADO
) else (
    echo [FAIL] Test 1.1 FALLIDO
)
echo.
pause

echo.
echo [TEST 1.2] Crear Libro Sin Año
echo --------------------------------
echo.
echo PASOS:
echo 1. Haz clic en "Crear Libro"
echo 2. Llena solo los campos obligatorios
echo 3. NO selecciones ningun año
echo 4. Haz clic en "Crear"
echo.
echo RESULTADO ESPERADO:
echo [+] Libro creado sin errores
echo [+] En la columna "Año" muestra "N/A"
echo [+] No hay errores NaN en consola
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 1.2 PASADO
) else (
    echo [FAIL] Test 1.2 FALLIDO
)
echo.
pause

echo.
echo [TEST 1.3] Crear Libro con Año Antiguo
echo ----------------------------------------
echo.
echo PASOS:
echo 1. Haz clic en "Crear Libro"
echo 2. Llena los campos obligatorios
echo 3. Abre el selector de año
echo 4. En busqueda, escribe "1850"
echo 5. El selector debe navegar a 1848-1859
echo 6. Haz clic en "1850"
echo 7. Crea el libro
echo.
echo RESULTADO ESPERADO:
echo [+] Popover navega a la decada correcta
echo [+] 1850 disponible para seleccion
echo [+] Libro creado con año 1850
echo [+] Aparece "1850" en la tabla
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 1.3 PASADO
) else (
    echo [FAIL] Test 1.3 FALLIDO
)
echo.
pause

echo.
echo [TEST 1.4] Entrada Directa de Año
echo ----------------------------------
echo.
echo PASOS:
echo 1. Haz clic en "Crear Libro"
echo 2. Llena los campos obligatorios
echo 3. En lugar del selector, escribe "1999" directamente
echo 4. Crea el libro
echo.
echo RESULTADO ESPERADO:
echo [+] El año se acepta
echo [+] Libro creado con año 1999
echo [+] Aparece "1999" en la tabla
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 1.4 PASADO
) else (
    echo [FAIL] Test 1.4 FALLIDO
)
echo.
pause

echo.
echo ====================================
echo TEST SUITE 1 COMPLETADO
echo ====================================
echo.
pause
goto MENU

:TEST_SUITE_2
cls
echo ====================================
echo TEST SUITE 2: PERSISTENCIA (CRITICO)
echo ====================================
echo.
echo ESTE ES EL TEST MAS IMPORTANTE
echo.

echo [TEST 2.1] Verificar Persistencia del Año
echo -------------------------------------------
echo.
echo PASOS:
echo 1. En la tabla, encuentra un libro con año (ej: "Test Book 2024")
echo 2. Haz clic en menu (3 puntos) ^> "Editar"
echo 3. Verifica el campo de año:
echo    - El boton debe mostrar "2024"
echo    - El campo de texto debe mostrar "2024"
echo 4. Haz clic en "Seleccionar año"
echo 5. Verifica el popover:
echo    - Debe mostrar la decada 2012-2023
echo    - El año "2024" debe tener fondo azul (seleccionado)
echo 6. Cierra el popover
echo 7. Cancela la edicion
echo.
echo RESULTADO ESPERADO:
echo [+] El año "2024" aparece en el boton
echo [+] El año "2024" aparece en el campo de texto
echo [+] El popover navega a la decada correcta
echo [+] El año esta visualmente marcado como seleccionado
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 2.1 PASADO - PERSISTENCIA FUNCIONA!
) else (
    echo [FAIL] Test 2.1 FALLIDO - PROBLEMA DE PERSISTENCIA!
    echo.
    echo TROUBLESHOOTING:
    echo 1. Ejecuta APLICAR_FIX_YEAR_PICKER.bat
    echo 2. Haz hard reload (Ctrl+Shift+R)
    echo 3. Revisa la consola del navegador (F12)
    echo 4. Lee YEAR_PICKER_FIX_PERSISTENCE.md
)
echo.
pause

echo.
echo [TEST 2.2] Cambiar Año de Libro Existente
echo ------------------------------------------
echo.
echo PASOS:
echo 1. Edita un libro con año 2024
echo 2. Verifica que muestra "2024"
echo 3. Abre el selector
echo 4. Cambia a "2025"
echo 5. Guarda
echo 6. Vuelve a editar el mismo libro
echo 7. Verifica que muestra "2025"
echo.
echo RESULTADO ESPERADO:
echo [+] El cambio se guarda
echo [+] La tabla muestra "2025"
echo [+] Al re-editar, muestra "2025"
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 2.2 PASADO
) else (
    echo [FAIL] Test 2.2 FALLIDO
)
echo.
pause

echo.
echo [TEST 2.3] Quitar Año de Libro
echo -------------------------------
echo.
echo PASOS:
echo 1. Edita un libro que tiene año
echo 2. Borra el contenido del campo de texto
echo 3. Guarda
echo 4. Verifica tabla - debe mostrar "N/A"
echo 5. Vuelve a editar
echo 6. Verifica que el campo esta vacio
echo.
echo RESULTADO ESPERADO:
echo [+] Se puede dejar el campo vacio
echo [+] Se guarda sin año
echo [+] La tabla muestra "N/A"
echo [+] Al re-editar, campo vacio
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 2.3 PASADO
) else (
    echo [FAIL] Test 2.3 FALLIDO
)
echo.
pause

echo.
echo [TEST 2.4] Agregar Año a Libro Sin Año
echo ---------------------------------------
echo.
echo PASOS:
echo 1. Edita un libro que NO tiene año (muestra "N/A")
echo 2. Verifica que el campo esta vacio
echo 3. Selecciona un año (ej: 2023)
echo 4. Guarda
echo 5. Verifica tabla - debe mostrar "2023"
echo 6. Vuelve a editar
echo 7. Verifica que muestra "2023"
echo.
echo RESULTADO ESPERADO:
echo [+] Se puede agregar año
echo [+] Los cambios persisten
echo [+] Todo funciona correctamente
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 2.4 PASADO
) else (
    echo [FAIL] Test 2.4 FALLIDO
)
echo.
pause

echo.
echo ====================================
echo TEST SUITE 2 COMPLETADO
echo ====================================
echo.
pause
goto MENU

:TEST_SUITE_3
cls
echo ====================================
echo TEST SUITE 3: NAVEGACION DEL SELECTOR
echo ====================================
echo.

echo [TEST 3.1] Navegacion por Decadas
echo -----------------------------------
echo.
echo PASOS:
echo 1. Abre el selector de año
echo 2. Haz clic en flecha izquierda (◀)
echo 3. Verifica que retrocede 12 años
echo 4. Haz clic en flecha derecha (▶)
echo 5. Verifica que avanza 12 años
echo.
echo RESULTADO ESPERADO:
echo [+] Las flechas funcionan
echo [+] La navegacion es fluida
echo [+] El rango se actualiza correctamente
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 3.1 PASADO
) else (
    echo [FAIL] Test 3.1 FALLIDO
)
echo.
pause

echo.
echo [TEST 3.2] Busqueda de Años
echo ---------------------------
echo.
echo PASOS:
echo 1. Abre el selector
echo 2. En busqueda, escribe "20"
echo 3. Verifica filtrado (2020, 2021, etc.)
echo 4. Escribe "1995"
echo 5. Verifica navegacion a 1992-2003
echo.
echo RESULTADO ESPERADO:
echo [+] El filtro funciona
echo [+] Navegacion automatica con 4 digitos
echo [+] Años filtrados se muestran
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 3.2 PASADO
) else (
    echo [FAIL] Test 3.2 FALLIDO
)
echo.
pause

echo.
echo [TEST 3.3] Limites de Años
echo --------------------------
echo.
echo PASOS:
echo 1. Navega hacia atras hasta año 1000
echo 2. Verifica que flecha izquierda se deshabilita
echo 3. Navega adelante hasta año actual + 10
echo 4. Verifica que flecha derecha se deshabilita
echo.
echo RESULTADO ESPERADO:
echo [+] No navega antes de 1000
echo [+] No navega despues de año actual + 10
echo [+] Botones se deshabilitan apropiadamente
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 3.3 PASADO
) else (
    echo [FAIL] Test 3.3 FALLIDO
)
echo.
pause

echo.
echo ====================================
echo TEST SUITE 3 COMPLETADO
echo ====================================
echo.
pause
goto MENU

:TEST_SUITE_4
cls
echo ====================================
echo TEST SUITE 4: INTERFAZ Y UX
echo ====================================
echo.

echo [TEST 4.1] Indicador de Año Actual
echo ------------------------------------
echo.
echo PASOS:
echo 1. Abre el selector
echo 2. Navega a la decada actual
echo 3. Busca el año actual (2025)
echo.
echo RESULTADO ESPERADO:
echo [+] Año actual tiene borde azul distintivo
echo [+] Facil de identificar visualmente
echo [+] Footer muestra "Año actual: 2025"
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 4.1 PASADO
) else (
    echo [FAIL] Test 4.1 FALLIDO
)
echo.
pause

echo.
echo [TEST 4.2] Estados Visuales
echo ---------------------------
echo.
echo PASOS:
echo 1. Abre el selector
echo 2. Observa año no seleccionado - borde gris
echo 3. Haz clic en un año
echo 4. Observa fondo azul
echo 5. Vuelve a abrir
echo 6. Año sigue con fondo azul
echo.
echo RESULTADO ESPERADO:
echo [+] Estados visuales claros
echo [+] Seleccionado = fondo azul
echo [+] Actual = borde azul
echo [+] Normal = outline gris
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 4.2 PASADO
) else (
    echo [FAIL] Test 4.2 FALLIDO
)
echo.
pause

echo.
echo [TEST 4.3] Placeholder y Texto
echo -------------------------------
echo.
echo PASOS:
echo 1. Crea libro nuevo
echo 2. Sin seleccionar año, observa boton
echo 3. Debe decir "Seleccionar año" en gris
echo.
echo RESULTADO ESPERADO:
echo [+] Placeholder visible
echo [+] Texto en gris claro
echo [+] Claro que no hay año seleccionado
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 4.3 PASADO
) else (
    echo [FAIL] Test 4.3 FALLIDO
)
echo.
pause

echo.
echo ====================================
echo TEST SUITE 4 COMPLETADO
echo ====================================
echo.
pause
goto MENU

:TEST_SUITE_5
cls
echo ====================================
echo TEST SUITE 5: VALIDACIONES Y ERRORES
echo ====================================
echo.

echo [TEST 5.1] Sin Errores en Consola
echo -----------------------------------
echo.
echo PASOS:
echo 1. Abre DevTools (F12)
echo 2. Ve a Console
echo 3. Limpia la consola
echo 4. Realiza operaciones basicas
echo 5. Revisa que no haya errores
echo.
echo RESULTADO ESPERADO:
echo [+] No hay errores en rojo
echo [+] No hay warnings sobre NaN
echo [+] No hay errores de React
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 5.1 PASADO
) else (
    echo [FAIL] Test 5.1 FALLIDO
)
echo.
pause

echo.
echo [TEST 5.2] Validacion de Entrada Directa
echo -----------------------------------------
echo.
echo PASOS:
echo 1. En campo de texto, escribe "abcd"
echo 2. Verifica que NO acepta letras
echo 3. Escribe "@#$"
echo 4. Verifica que NO acepta especiales
echo 5. Escribe "2024"
echo 6. Verifica que SI acepta
echo.
echo RESULTADO ESPERADO:
echo [+] Solo acepta numeros
echo [+] Rechaza letras y especiales
echo [+] Validacion inmediata
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 5.2 PASADO
) else (
    echo [FAIL] Test 5.2 FALLIDO
)
echo.
pause

echo.
echo ====================================
echo TEST SUITE 5 COMPLETADO
echo ====================================
echo.
pause
goto MENU

:TEST_SUITE_6
cls
echo ====================================
echo TEST SUITE 6: CASOS EDGE
echo ====================================
echo.

echo [TEST 6.1] Año 1000 (Limite Inferior)
echo ---------------------------------------
echo.
echo PASOS:
echo 1. Entrada directa: escribe "1000"
echo 2. Guarda el libro
echo 3. Edita y verifica persistencia
echo.
echo RESULTADO ESPERADO:
echo [+] Acepta el año 1000
echo [+] Se guarda correctamente
echo [+] Persiste al editar
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 6.1 PASADO
) else (
    echo [FAIL] Test 6.1 FALLIDO
)
echo.
pause

echo.
echo [TEST 6.2] Año Futuro (Actual + 10)
echo ------------------------------------
echo.
echo PASOS:
echo 1. Calcula año actual + 10 (ej: 2035)
echo 2. Escribe ese año
echo 3. Guarda y verifica
echo.
echo RESULTADO ESPERADO:
echo [+] Acepta años futuros en rango
echo [+] Se guarda correctamente
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 6.2 PASADO
) else (
    echo [FAIL] Test 6.2 FALLIDO
)
echo.
pause

echo.
echo [TEST 6.3] Multiples Ediciones Rapidas
echo ---------------------------------------
echo.
echo PASOS:
echo 1. Edita libro con año 2020
echo 2. Cambia a 2021, guarda
echo 3. Inmediatamente edita de nuevo
echo 4. Cambia a 2022, guarda
echo 5. Edita de nuevo
echo 6. Verifica que muestra 2022
echo.
echo RESULTADO ESPERADO:
echo [+] Cambios sucesivos se guardan
echo [+] No hay errores de estado
echo [+] Ultima edicion persiste
echo.
set /p result="Paso el test? (S/N): "
if /i "%result%"=="S" (
    echo [OK] Test 6.3 PASADO
) else (
    echo [FAIL] Test 6.3 FALLIDO
)
echo.
pause

echo.
echo ====================================
echo TEST SUITE 6 COMPLETADO
echo ====================================
echo.
pause
goto MENU

:ALL_TESTS
cls
echo ====================================
echo EJECUTANDO TODAS LAS PRUEBAS
echo ====================================
echo.
echo Esta opcion ejecutara TODOS los test suites.
echo Esto puede tomar 15-30 minutos.
echo.
echo Asegurate de:
echo [+] Tener el navegador abierto en Admin ^> Libros
echo [+] Tener DevTools (F12) abierto en la pestaña Console
echo [+] Estar listo para seguir instrucciones detalladas
echo.
set /p confirm="Continuar? (S/N): "
if /i not "%confirm%"=="S" goto MENU

call :TEST_SUITE_1
call :TEST_SUITE_2
call :TEST_SUITE_3
call :TEST_SUITE_4
call :TEST_SUITE_5
call :TEST_SUITE_6

echo.
echo ====================================
echo TODAS LAS PRUEBAS COMPLETADAS
echo ====================================
echo.
echo Revisa los resultados arriba.
echo.
echo Si algun test fallo:
echo 1. Lee YEAR_PICKER_FIX_PERSISTENCE.md
echo 2. Ejecuta APLICAR_FIX_YEAR_PICKER.bat
echo 3. Haz hard reload (Ctrl+Shift+R)
echo 4. Repite los tests que fallaron
echo.
pause
goto MENU

:VIEW_DOCS
cls
echo ====================================
echo ABRIENDO DOCUMENTACION
echo ====================================
echo.
start TEST_YEAR_PICKER.md
echo.
echo Documentacion abierta en el editor.
echo.
pause
goto MENU

:RESTART_FRONTEND
cls
echo ====================================
echo REINICIANDO FRONTEND
echo ====================================
echo.
echo Ejecutando: docker compose restart frontend
echo.
docker compose restart frontend
echo.
if %errorlevel% equ 0 (
    echo [OK] Frontend reiniciado exitosamente
    echo.
    echo Esperando 10 segundos para que inicie...
    timeout /t 10 /nobreak
    echo.
    echo RECUERDA: Haz hard reload (Ctrl+Shift+R) en el navegador
) else (
    echo [ERROR] No se pudo reiniciar el frontend
    echo Verifica que Docker este corriendo
)
echo.
pause
goto MENU

:END
cls
echo ====================================
echo GRACIAS POR USAR TEST YEAR PICKER
echo ====================================
echo.
echo Para mas informacion:
echo - TEST_YEAR_PICKER.md (documentacion completa)
echo - YEAR_PICKER_GUIDE.md (guia tecnica)
echo - YEAR_PICKER_FIX_PERSISTENCE.md (fix de persistencia)
echo.
echo Si encontraste bugs, documentalos y reportalos.
echo.
pause
exit /b

endlocal
