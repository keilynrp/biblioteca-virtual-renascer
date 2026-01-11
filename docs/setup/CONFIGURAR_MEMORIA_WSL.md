# Configurar Memoria de Docker en WSL2

## 🎯 Solución para WSL2

En WSL2, Docker usa la memoria asignada a WSL, no a Docker Desktop directamente. Necesitas configurar `.wslconfig`.

---

## Paso 1: Crear/Editar .wslconfig

### Opción A: Usando PowerShell (Recomendado)

1. Abre **PowerShell** (no WSL)

2. Ejecuta este comando para crear el archivo:

```powershell
notepad $env:USERPROFILE\.wslconfig
```

3. Si el archivo no existe, Notepad preguntará si quieres crearlo. Click **Sí**.

4. Pega este contenido:

```ini
[wsl2]
memory=6GB
processors=4
swap=2GB
localhostForwarding=true
```

5. Guarda el archivo: **Ctrl + S**

6. Cierra Notepad

### Opción B: Manualmente

1. Abre el Explorador de Archivos

2. En la barra de direcciones, escribe:
   ```
   %USERPROFILE%
   ```

3. Presiona **Enter** (esto te lleva a `C:\Users\TuNombre\`)

4. Crea un nuevo archivo llamado `.wslconfig` (con el punto al inicio)

5. Ábrelo con Notepad y pega:

```ini
[wsl2]
memory=6GB
processors=4
swap=2GB
localhostForwarding=true
```

6. Guarda el archivo

---

## Paso 2: Reiniciar WSL

Ahora necesitas reiniciar WSL para que los cambios surtan efecto.

### En PowerShell (como Administrador):

```powershell
# Detener WSL
wsl --shutdown

# Esperar 8 segundos
Start-Sleep -Seconds 8

# Verificar que WSL se detuvo
wsl --list --verbose
```

Deberías ver que todas las distribuciones están "Stopped".

---

## Paso 3: Iniciar WSL de Nuevo

1. Abre una nueva terminal de **Ubuntu** (o tu distribución WSL)

2. WSL se iniciará automáticamente con la nueva configuración

---

## Paso 4: Verificar la Configuración

En tu terminal WSL, ejecuta:

```bash
# Ver memoria total disponible
free -h

# Ver memoria asignada a WSL
cat /proc/meminfo | grep MemTotal
```

Deberías ver algo como:
```
MemTotal:        6291456 kB  (~6 GB)
```

---

## Paso 5: Reiniciar Docker

En tu terminal WSL:

```bash
# Ir a tu proyecto
cd /mnt/d/bvs_framework

# O si estás en el sistema de archivos de WSL:
cd ~/bvs_framework

# Detener servicios
docker compose down

# Iniciar con nueva configuración
docker compose up -d

# Verificar estado
docker compose ps
```

---

## 🔧 Script Automatizado para WSL

Crea este script para hacer todo automáticamente:

```bash
#!/bin/bash
# configurar-docker-wsl.sh

echo "=================================================="
echo "Configurando Memoria para Docker en WSL2"
echo "=================================================="
echo ""

# Verificar que estamos en WSL
if grep -qi microsoft /proc/version; then
    echo "[OK] Ejecutando en WSL"
else
    echo "[ERROR] Este script debe ejecutarse en WSL"
    exit 1
fi

echo ""
echo "IMPORTANTE:"
echo "Este script creará el archivo .wslconfig en Windows"
echo "Necesitarás reiniciar WSL después"
echo ""
read -p "Presiona Enter para continuar..."

# Crear archivo .wslconfig
WSLCONFIG="/mnt/c/Users/$USER/.wslconfig"

cat > "$WSLCONFIG" << 'EOF'
[wsl2]
memory=6GB
processors=4
swap=2GB
localhostForwarding=true
EOF

echo "[OK] Archivo .wslconfig creado"
echo ""
echo "Contenido:"
cat "$WSLCONFIG"
echo ""

echo "=================================================="
echo "SIGUIENTE PASO:"
echo "=================================================="
echo ""
echo "1. Sal de WSL (escribe 'exit')"
echo "2. En PowerShell ejecuta: wsl --shutdown"
echo "3. Espera 8 segundos"
echo "4. Vuelve a abrir WSL"
echo "5. Ejecuta: cd /mnt/d/bvs_framework && docker compose up -d"
echo ""
```

Guarda este script y ejecútalo:

```bash
chmod +x configurar-docker-wsl.sh
./configurar-docker-wsl.sh
```

---

## 📊 Configuración Explicada

```ini
[wsl2]
memory=6GB          # Memoria máxima para WSL (ajusta según tu RAM)
processors=4        # Número de CPUs (ajusta según tu procesador)
swap=2GB           # Memoria swap
localhostForwarding=true  # Permite acceso a localhost
```

### Si tienes menos RAM:

**Para 8 GB de RAM total:**
```ini
[wsl2]
memory=4GB
processors=2
swap=1GB
```

**Para 16 GB de RAM total:**
```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
```

---

## 🔍 Verificar que Funciona

Después de reiniciar WSL:

```bash
# 1. Verificar memoria disponible
free -h

# 2. Ir al proyecto
cd /mnt/d/bvs_framework

# 3. Ejecutar el script de corrección
./FIX_BACKEND_KILLED.bat
# O en Linux/WSL:
bash FIX_BACKEND_KILLED.bat

# 4. Monitorear memoria de Docker
docker stats

# 5. Verificar que el backend está corriendo
docker compose ps
curl http://localhost:8000/api/
```

---

## ⚠️ Troubleshooting

### Problema: "No se encuentra el archivo .wslconfig"

**Solución:** Asegúrate de:
1. Crearlo en `C:\Users\TuNombre\` (no dentro de WSL)
2. El nombre exacto es `.wslconfig` (con punto al inicio)
3. No tiene extensión `.txt` (desactiva "Ocultar extensiones" en Windows)

### Problema: "WSL no respeta la configuración"

**Solución:**
```powershell
# PowerShell como Administrador
wsl --shutdown
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

### Problema: "WSL usa toda la RAM disponible"

**Solución:** Agrega límite estricto:
```ini
[wsl2]
memory=6GB
processors=4
swap=2GB
pageReporting=true
kernelCommandLine=cgroup_memory=1 cgroup_enable=memory swapaccount=1
```

---

## 🚀 Comando Rápido (Todo en Uno)

Ejecuta esto en **PowerShell como Administrador**:

```powershell
# Crear .wslconfig
@"
[wsl2]
memory=6GB
processors=4
swap=2GB
localhostForwarding=true
"@ | Out-File -FilePath "$env:USERPROFILE\.wslconfig" -Encoding ASCII

# Mostrar contenido
Get-Content "$env:USERPROFILE\.wslconfig"

# Reiniciar WSL
wsl --shutdown

# Esperar
Start-Sleep -Seconds 8

# Confirmar
Write-Host "WSL reiniciado. Abre una nueva terminal WSL para continuar."
```

---

## 📍 Ubicación del Archivo

El archivo `.wslconfig` debe estar en:

```
Windows: C:\Users\TuNombre\.wslconfig
PowerShell: $env:USERPROFILE\.wslconfig
WSL: /mnt/c/Users/TuNombre/.wslconfig
```

**NO debe estar:**
- Dentro de `/home/` en WSL
- En el directorio del proyecto
- En ninguna otra ubicación

---

## ✅ Checklist Final

- [ ] Archivo `.wslconfig` creado en `C:\Users\TuNombre\`
- [ ] Contenido correcto (memory=6GB, etc.)
- [ ] WSL reiniciado con `wsl --shutdown`
- [ ] Esperado 8 segundos antes de reabrir WSL
- [ ] Memoria verificada con `free -h` (debe mostrar ~6GB)
- [ ] Docker reiniciado con `docker compose up -d`
- [ ] Backend respondiendo en http://localhost:8000
- [ ] Frontend cargando en http://localhost:3000

---

**Después de estos pasos, el backend debería mantenerse corriendo sin problemas.** 🚀
