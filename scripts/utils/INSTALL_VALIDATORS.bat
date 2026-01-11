@echo off
echo ================================================
echo Instalando dependencias para validacion de PDFs
echo ================================================
echo.

echo Paso 1: Rebuilding backend container con libmagic...
echo (Esto puede tomar unos minutos)
docker compose build backend

echo.
echo Paso 2: Reiniciando servicios...
docker compose up -d backend

echo.
echo Esperando a que el backend este listo...
timeout /t 10 /nobreak

echo.
echo Paso 3: Verificando instalacion de python-magic...
docker compose exec backend python -c "import magic; print('✅ python-magic instalado correctamente')"

echo.
echo Paso 4: Creando migraciones para los cambios en modelos...
docker compose exec backend python manage.py makemigrations content

echo.
echo Paso 5: Aplicando migraciones...
docker compose exec backend python manage.py migrate

echo.
echo ================================================
echo Instalacion completada!
echo ================================================
echo.
echo Las siguientes validaciones estan ahora activas:
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
