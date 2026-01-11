# Resumen: Configuración WSL para 16GB

## ¿Qué es .wslconfig?

El archivo `.wslconfig` le dice a WSL cuánta memoria RAM puede usar.

**Ubicación:** `C:\Users\TuUsuario\.wslconfig`

**Sin este archivo:** WSL usa valores por defecto (50% de tu RAM = 8GB)

**Con este archivo:** WSL usa lo que le indiques (10GB en este caso)

---

## Tu Configuración Óptima

```ini
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
```

### ¿Por qué 10GB y no 16GB?

```
16GB Totales (tu RAM física)
-  4GB Windows necesita para funcionar
-  2GB Margen de seguridad
= 10GB Para WSL (seguro y óptimo)
```

Si le das los 16GB a WSL, Windows se quedará sin memoria y se congelará.

---

## Cómo Aplicar la Configuración

### Método Automático (Recomendado)

```batch
# Desde CMD o PowerShell en Windows
cd d:\bvs_framework
CONFIGURAR_WSL_16GB.bat
```

**Esto hace:**
1. Crea el archivo `.wslconfig` en `%USERPROFILE%`
2. Le pone el contenido correcto
3. Ejecuta `wsl --shutdown` para aplicar cambios
4. Verifica que funcione

### Método Manual

1. **Crear el archivo:**
   - Abre el Explorador de Windows
   - En la barra de dirección, escribe: `%USERPROFILE%`
   - Click derecho → Nuevo → Documento de texto
   - Nómbralo: `.wslconfig` (CON el punto al inicio)

2. **Editar el archivo:**
   - Click derecho en `.wslconfig` → Editar
   - Pega este contenido:

   ```ini
   [wsl2]
   memory=10GB
   processors=4
   swap=4GB
   localhostForwarding=true
   ```

   - Guarda y cierra

3. **Aplicar cambios:**
   - Abre PowerShell o CMD
   - Ejecuta:

   ```powershell
   wsl --shutdown
   ```

   - Espera 10 segundos
   - Abre WSL de nuevo

---

## Verificar la Configuración

### Desde Windows

```powershell
# Ver el archivo
type %USERPROFILE%\.wslconfig

# Debe mostrar:
# [wsl2]
# memory=10GB
# processors=4
# swap=4GB
# localhostForwarding=true
```

### Desde WSL

```bash
# Ver memoria total asignada
free -h

# Debe mostrar ~10GB en la línea "Mem:"
```

**Ejemplo de salida correcta:**

```
              total        used        free
Mem:           9.8Gi       1.5Gi       8.3Gi
Swap:          4.0Gi          0B       4.0Gi
```

---

## Parámetros Explicados

### memory=10GB

**Qué hace:** Limita la memoria máxima que WSL puede usar.

**Por qué 10GB:** Deja 6GB para Windows (4GB + 2GB margen).

**Antes (sin .wslconfig):** WSL usaba hasta 8GB (50% de 16GB).

**Ahora:** WSL usa hasta 10GB (+25% más memoria).

### processors=4

**Qué hace:** Asigna 4 CPUs virtuales a WSL.

**Por qué 4:** Es un buen balance para la mayoría de procesadores.

**Ajustar:** Si tienes 8+ cores, puedes poner `processors=6`.

### swap=4GB

**Qué hace:** Memoria swap (disco como memoria).

**Por qué 4GB:** Respaldo en caso de picos de memoria.

**Importante:** Swap es más lento que RAM, pero evita crashes.

### localhostForwarding=true

**Qué hace:** Permite acceder a servicios de WSL desde Windows.

**Por qué:** Para abrir `http://localhost:3000` en tu navegador Windows.

**Sin esto:** Tendrías que usar la IP de WSL, que cambia.

---

## Distribución de Memoria

### Sistema Completo (16GB)

```
┌─────────────────────────────────┐
│ Windows: 4GB                    │
├─────────────────────────────────┤
│ WSL: 10GB                       │
│  ├─ Frontend: 4GB               │
│  ├─ Elasticsearch: 2GB          │
│  ├─ Backend: 1GB                │
│  ├─ PostgreSQL: 512MB           │
│  ├─ Redis: 256MB                │
│  └─ Sistema WSL: 2GB            │
├─────────────────────────────────┤
│ Reserva: 2GB                    │
└─────────────────────────────────┘
```

### Beneficios

- ✅ Windows tiene suficiente memoria (4GB)
- ✅ WSL tiene más memoria que antes (+2GB)
- ✅ Docker tiene espacio para crecer
- ✅ Hay margen de seguridad (2GB)

---

## Problemas Comunes

### "WSL no arranca después del cambio"

**Causa:** Configuración incorrecta o WSL corrompido.

**Solución:**

```powershell
# Opción 1: Restaurar backup
copy %USERPROFILE%\.wslconfig.backup %USERPROFILE%\.wslconfig
wsl --shutdown

# Opción 2: Eliminar configuración
del %USERPROFILE%\.wslconfig
wsl --shutdown
```

### "free -h muestra menos de 10GB"

**Causa:** WSL no reinició correctamente.

**Solución:**

```powershell
# Desde PowerShell en Windows
wsl --shutdown
```

Espera 10 segundos y abre WSL de nuevo.

### "Windows se pone lento"

**Causa:** 10GB es mucho para tu sistema.

**Solución:** Reduce a 8GB:

```ini
[wsl2]
memory=8GB
processors=4
swap=4GB
localhostForwarding=true
```

Guarda y ejecuta `wsl --shutdown`.

### "Docker sigue sin memoria"

**Causa:** Docker no se reinició después del cambio.

**Solución:**

```bash
# Desde WSL
docker compose down
docker compose up -d

# Verificar
docker stats
```

---

## Comandos Útiles

### Gestión de WSL

```powershell
# Ver versión de WSL
wsl --version

# Ver distribuciones instaladas
wsl --list --verbose

# Apagar WSL (aplica .wslconfig)
wsl --shutdown

# Iniciar WSL
wsl

# Ver estado (desde WSL)
free -h
top
```

### Verificar .wslconfig

```powershell
# Ver contenido
type %USERPROFILE%\.wslconfig

# Ver ubicación exacta
echo %USERPROFILE%\.wslconfig

# Editar
notepad %USERPROFILE%\.wslconfig
```

---

## Revertir Cambios

### Opción 1: Eliminar .wslconfig

```powershell
del %USERPROFILE%\.wslconfig
wsl --shutdown
```

WSL volverá a usar valores por defecto (50% RAM = 8GB).

### Opción 2: Restaurar backup

```powershell
copy %USERPROFILE%\.wslconfig.backup %USERPROFILE%\.wslconfig
wsl --shutdown
```

---

## Configuraciones Alternativas

### Para 8GB de RAM Total

```ini
[wsl2]
memory=5GB
processors=2
swap=2GB
localhostForwarding=true
```

### Para 32GB de RAM Total

```ini
[wsl2]
memory=20GB
processors=8
swap=8GB
localhostForwarding=true
```

### Para Desarrollo Ligero (16GB)

```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
```

---

## Siguiente Paso

Una vez configurado WSL, instala y optimiza Docker:

```batch
# Opción A: Todo desde Windows (más fácil)
CONFIGURAR_TODO_16GB.bat

# Opción B: Solo Docker desde WSL
wsl
cd /mnt/d/bvs_framework
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

---

## Recursos

- [Documentación oficial WSL](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)
- [GUIA_COMPLETA_CONFIGURACION_16GB.md](GUIA_COMPLETA_CONFIGURACION_16GB.md)
- [LEEME_PRIMERO.md](LEEME_PRIMERO.md)

---

## Resumen

1. **Crear:** `.wslconfig` en `C:\Users\TuUsuario\`
2. **Contenido:** 10GB memory, 4 processors, 4GB swap
3. **Aplicar:** `wsl --shutdown` y esperar 10 segundos
4. **Verificar:** `free -h` desde WSL (debe mostrar ~10GB)
5. **Siguiente:** Ejecutar `CONFIGURAR_TODO_16GB.bat`

**¡Listo!** 🚀
