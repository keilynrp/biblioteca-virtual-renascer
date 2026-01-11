# 🐋 Configurar Docker Desktop con WSL

## ⚠️ Problema Detectado

Tienes Docker Compose antiguo (v1.29.2) roto en WSL, pero Docker Desktop no está configurado correctamente para funcionar con WSL.

---

## ✅ Solución: Configurar Docker Desktop para WSL

### **Paso 1: Abrir Docker Desktop**

1. Abre Docker Desktop en Windows
2. Espera a que el ícono esté verde (Docker corriendo)

### **Paso 2: Habilitar Integración con WSL**

1. En Docker Desktop, click en el ícono de engranaje ⚙️ (Settings)
2. Ve a **Resources** → **WSL Integration**
3. Activa las siguientes opciones:
   - ✅ **Enable integration with my default WSL distro**
   - ✅ Activa tu distribución (probablemente "Ubuntu")
4. Click en **Apply & Restart**

### **Paso 3: Reiniciar WSL**

Cierra todas las ventanas de WSL y ejecuta en PowerShell:

```powershell
wsl --shutdown
```

Luego vuelve a abrir WSL.

### **Paso 4: Verificar que funciona**

En WSL, ejecuta:

```bash
docker --version
docker compose version
```

Deberías ver:
```
Docker version 25.x.x
Docker Compose version v2.24.5
```

---

## 🚀 Alternativa: Usar PowerShell Directamente

Si prefieres no configurar WSL, puedes usar los scripts de PowerShell que creé:

### **En PowerShell (fuera de WSL):**

```powershell
cd d:\bvs_framework

# Iniciar servicios
.\iniciar-sprint6.ps1

# Obtener libro de prueba
.\obtener-libro-prueba.ps1

# Ver estado
.\estado-sprint6.ps1
```

**Ventaja**: Docker Desktop está instalado en Windows, los scripts de PowerShell funcionan directamente.

---

## 📋 Pasos Recomendados

### **Opción A: Configurar Docker en WSL** (Recomendado si usas WSL frecuentemente)

1. Sigue los pasos arriba para habilitar WSL Integration en Docker Desktop
2. Reinicia WSL
3. Usa los comandos de Docker normalmente en WSL

### **Opción B: Usar PowerShell** (Más rápido para este proyecto)

1. Abre PowerShell (no WSL)
2. Navega a `d:\bvs_framework`
3. Ejecuta `.\iniciar-sprint6.ps1`

---

## 🔍 ¿Por qué este problema?

**WSL es Linux**, pero Docker Desktop corre en Windows. Para que Docker funcione en WSL, necesitas:

1. **Docker Desktop** instalado en Windows ✅ (ya lo tienes)
2. **Integración WSL habilitada** en Docker Desktop ❌ (falta configurar)

Una vez configurado, Docker Desktop compartirá el daemon de Docker con WSL, y podrás usar `docker` y `docker compose` en ambos ambientes.

---

## 🎯 Próximos Pasos

### **Si quieres usar WSL:**

1. Configura Docker Desktop WSL Integration (pasos arriba)
2. Reinicia WSL: `wsl --shutdown` en PowerShell
3. Vuelve a abrir WSL
4. Prueba: `docker compose version`

### **Si prefieres usar PowerShell:**

```powershell
# Abre PowerShell (no WSL)
cd d:\bvs_framework
.\iniciar-sprint6.ps1
```

---

## 📚 Documentación Oficial

- [Docker Desktop WSL 2 Backend](https://docs.docker.com/desktop/wsl/)
- [Docker Compose V2](https://docs.docker.com/compose/compose-v2/)

---

**Recomendación**: Para este proyecto, usa PowerShell. Es más rápido y directo. Los scripts están listos y funcionan perfectamente. 🚀
