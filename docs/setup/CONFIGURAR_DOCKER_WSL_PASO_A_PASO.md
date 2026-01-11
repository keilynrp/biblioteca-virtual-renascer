# 🔧 Configurar Docker Desktop para WSL - Paso a Paso

## Problema Actual

Estás en WSL (Windows Subsystem for Linux) pero Docker no está disponible porque Docker Desktop no está configurado para integrarse con WSL.

---

## ✅ Solución: Habilitar WSL Integration en Docker Desktop

### **Paso 1: Abrir Docker Desktop**

1. Abre Docker Desktop en Windows (busca "Docker Desktop" en el menú de inicio)
2. Espera a que el ícono en la bandeja del sistema esté **verde** (indica que Docker está corriendo)

### **Paso 2: Configurar WSL Integration**

1. En Docker Desktop, haz clic en el ícono de **⚙️ Settings** (Configuración) en la parte superior derecha
2. En el menú lateral izquierdo, selecciona **Resources** → **WSL Integration**
3. Verás dos opciones:
   - ✅ **Enable integration with my default WSL distro** ← Activa esto
   - Lista de distribuciones WSL instaladas
4. En la lista de distribuciones, activa tu distribución (probablemente "Ubuntu" o "Ubuntu-22.04")
5. Haz clic en **Apply & Restart**
6. Espera a que Docker Desktop se reinicie (el ícono volverá a ponerse verde)

### **Paso 3: Reiniciar WSL**

1. Cierra TODAS las ventanas de WSL que tengas abiertas
2. Abre **PowerShell** (como administrador si es posible)
3. Ejecuta:
   ```powershell
   wsl --shutdown
   ```
4. Espera 5 segundos
5. Vuelve a abrir WSL

### **Paso 4: Verificar que Funciona**

Dentro de WSL, ejecuta:

```bash
docker --version
docker compose version
```

**Deberías ver algo como:**
```
Docker version 25.0.3, build 4debf41
Docker Compose version v2.24.5
```

Si ves esto, ¡Docker está configurado correctamente!

### **Paso 5: Ejecutar los Scripts**

Ahora puedes ejecutar los scripts en WSL:

```bash
cd /mnt/d/bvs_framework  # Ajusta la ruta si es necesaria
./iniciar-sprint6.sh
```

---

## 🚀 Alternativa MÁS RÁPIDA: Usar Git Bash

Si no quieres configurar WSL ahora mismo, simplemente usa **Git Bash**:

1. Abre **Git Bash** (no WSL)
2. Navega al proyecto:
   ```bash
   cd /d/bvs_framework
   ```
3. Ejecuta el script:
   ```bash
   ./iniciar-sprint6.sh
   ```

Git Bash ya tiene acceso a Docker Desktop automáticamente.

---

## 🔍 ¿Cómo sé en qué terminal estoy?

- **WSL (Ubuntu)**: Prompt muestra algo como `user@HOSTNAME:/mnt/d/...`
- **Git Bash**: Prompt muestra algo como `user@HOSTNAME MINGW64 /d/...`
- **PowerShell**: Prompt muestra `PS D:\...>`

---

## 💡 Recomendación

Para este proyecto, **usa Git Bash** si solo quieres ejecutar los scripts rápidamente.

Configura WSL si:
- Usas WSL frecuentemente para desarrollo
- Prefieres el entorno Linux completo
- Vas a trabajar más con Docker en WSL

---

## 📚 Documentación Oficial

- [Docker Desktop WSL 2 Backend](https://docs.docker.com/desktop/wsl/)
- [Best practices for Docker Desktop on Windows](https://docs.docker.com/desktop/install/windows-install/)

---

**Siguiente paso**: Decide qué opción prefieres y prueba los scripts. 🚀
