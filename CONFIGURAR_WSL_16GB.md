# Configurar WSL para Optimización 16GB

## Método 1: Desde Windows (Recomendado)

### Paso 1: Ejecutar el Script Automático

```batch
CONFIGURAR_WSL_16GB.bat
```

Este script:
- Verifica tu RAM física
- Crea/actualiza `.wslconfig` con configuración óptima
- Reinicia WSL para aplicar cambios
- Verifica que todo funcione

### Paso 2: Verificar la Configuración

El archivo se crea en: `C:\Users\TuUsuario\.wslconfig`

Con este contenido:

```ini
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
```

---

## Método 2: Manual desde Windows

### Paso 1: Crear/Editar .wslconfig

1. Abre el Explorador de Archivos
2. Escribe en la barra de dirección: `%USERPROFILE%`
3. Crea un archivo llamado `.wslconfig` (con el punto al inicio)
4. Edítalo con Notepad y pega:

```ini
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
```

### Paso 2: Aplicar Cambios

Abre PowerShell o CMD y ejecuta:

```powershell
wsl --shutdown
```

Espera 10 segundos y vuelve a iniciar WSL.

---

## Método 3: Desde Linux/WSL

Si prefieres crear el archivo desde dentro de WSL:

### Paso 1: Crear el Script Helper

```bash
chmod +x configurar-wsl-16gb-helper.sh
./configurar-wsl-16gb-helper.sh
```

### Paso 2: Aplicar desde Windows

El script te creará el contenido. Cópialo y:

1. Desde WSL ejecuta: `powershell.exe`
2. Copia y pega:

```powershell
$content = @"
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
"@

Set-Content -Path "$env:USERPROFILE\.wslconfig" -Value $content
wsl --shutdown
```

3. Sal de PowerShell y espera 10 segundos
4. Vuelve a entrar a WSL

---

## Explicación de la Configuración

### ¿Por qué 10GB de 16GB?

```
16GB Totales
- 4GB para Windows
- 2GB para otros procesos
= 10GB disponibles para WSL
```

### Distribución en Docker (de esos 10GB):

```
Frontend:     4GB
Elasticsearch: 2GB
Backend:      1GB
PostgreSQL:   512MB
Redis:        256MB
Nginx:        256MB
Sistema WSL:  2GB
-----------------
Total usado:  ~10GB
```

### Parámetros Explicados

- **memory=10GB**: Memoria máxima para WSL
- **processors=4**: CPUs virtuales (ajusta según tu PC)
- **swap=4GB**: Memoria swap de respaldo
- **localhostForwarding=true**: Acceso a servicios desde Windows

---

## Verificación Post-Configuración

### Desde WSL/Linux:

```bash
# Ver memoria asignada
free -h

# Ver memoria total del sistema
grep MemTotal /proc/meminfo

# Debería mostrar ~10GB
```

### Desde Windows PowerShell:

```powershell
# Ver contenido del archivo
type $env:USERPROFILE\.wslconfig

# Ver uso de WSL
wsl --list --verbose
```

---

## Problemas Comunes

### WSL no arranca después del cambio

**Solución:**

```powershell
# Desde PowerShell en Windows
wsl --shutdown
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

Luego restaura tus datos del backup.

### "Not enough memory"

Reduce la configuración:

```ini
[wsl2]
memory=8GB
processors=4
swap=4GB
```

### WSL muy lento

Reduce swap:

```ini
[wsl2]
memory=10GB
processors=4
swap=2GB
```

---

## Siguiente Paso

Una vez configurado WSL, ejecuta la instalación completa:

### Desde Windows:

```batch
wsl
cd /mnt/d/bvs_framework
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

### O directamente:

```bash
wsl bash -c "cd /mnt/d/bvs_framework && chmod +x INSTALAR_Y_OPTIMIZAR.sh && ./INSTALAR_Y_OPTIMIZAR.sh"
```

---

## Checklist de Configuración

- [ ] Ejecutar `CONFIGURAR_WSL_16GB.bat` desde Windows
- [ ] Verificar que el archivo `.wslconfig` existe en `%USERPROFILE%`
- [ ] Ejecutar `wsl --shutdown`
- [ ] Esperar 10 segundos
- [ ] Reiniciar WSL
- [ ] Verificar memoria con `free -h` (debe mostrar ~10GB)
- [ ] Ejecutar `INSTALAR_Y_OPTIMIZAR.sh`
- [ ] Verificar contenedores con `docker compose ps`
- [ ] Verificar recursos con `docker stats`

---

## Revertir Cambios

Si quieres volver a la configuración anterior:

```powershell
# Desde PowerShell
Remove-Item $env:USERPROFILE\.wslconfig
wsl --shutdown
```

O edita el archivo y reduce los valores.

---

## Recursos Adicionales

- [Documentación oficial WSL](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)
- [INSTRUCCIONES_OPTIMIZACION_16GB.md](INSTRUCCIONES_OPTIMIZACION_16GB.md)
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md)

---

**¡Tu sistema está listo para usar los 16GB de forma óptima!** 🚀
