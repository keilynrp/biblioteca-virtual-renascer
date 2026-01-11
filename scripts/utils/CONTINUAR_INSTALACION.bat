@echo off
echo ================================================
echo Continuando instalacion (Fix aplicado)
echo ================================================
echo.

echo El problema del import ha sido corregido.
echo Ahora vamos a crear y aplicar las migraciones.
echo.

echo Paso 1: Verificando python-magic...
docker compose exec backend python -c "import magic; print('✅ python-magic OK')"

echo.
echo Paso 2: Verificando que los validadores se importan correctamente...
docker compose exec backend python -c "from apps.content.validators import validate_pdf_file, sanitize_filename; print('✅ Validadores OK')"

echo.
echo Paso 3: Creando migraciones...
docker compose exec backend python manage.py makemigrations content

echo.
echo Paso 4: Aplicando migraciones...
docker compose exec backend python manage.py migrate

echo.
echo ================================================
echo Instalacion completada!
echo ================================================
echo.
echo Validaciones activas:
echo - Validacion de tipo MIME para PDFs e imagenes
echo - Validacion de tamano maximo (PDFs: 50MB, Imagenes: 5MB)
echo - Sanitizacion de nombres de archivo
echo - Verificacion de estructura PDF valida
echo - Deteccion de PDFs encriptados
echo.
echo Prueba el sistema subiendo un libro en:
echo http://localhost:3000/admin/books
echo.
pause
