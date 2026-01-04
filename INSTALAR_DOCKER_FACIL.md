# 🐋 Cómo Instalar Docker de Forma Ligera (Sin Docker Desktop)

## 🎯 Objetivo
Instalar Docker Engine en WSL para no depender de Docker Desktop que ralentiza la PC.

---

## ✅ Opción 1: Instalación Automática (Recomendada)

### **Paso 1: Abrir WSL (Ubuntu)**
1. Presiona `Windows + R`
2. Escribe: `wsl`
3. Presiona Enter

### **Paso 2: Navegar al Proyecto**
```bash
cd /mnt/d/bvs_framework
```

### **Paso 3: Ejecutar Script de Instalación**
```bash
bash instalar-docker-wsl.sh
```

El script te guiará automáticamente.

### **Paso 4: Reiniciar WSL**
Cierra la ventana de WSL y vuelve a abrirla.

### **Paso 5: Iniciar Docker y Ejecutar Proyecto**
```bash
# Iniciar Docker
sudo service docker start

# Navegar al proyecto
cd /mnt/d/bvs_framework

# Ejecutar scripts
./iniciar-sprint6.sh
```

---

## ✅ Opción 2: Instalación Manual Paso a Paso

Si prefieres hacerlo manualmente, ejecuta estos comandos en WSL:

### **1. Descargar Script de Instalación de Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
```

### **2. Ejecutar Instalación**
```bash
sudo sh get-docker.sh
```

Este paso puede tomar 2-3 minutos.

### **3. Agregar tu Usuario al Grupo Docker**
```bash
sudo usermod -aG docker $USER
```

### **4. Iniciar Servicio Docker**
```bash
sudo service docker start
```

### **5. Verificar Instalación**
```bash
docker --version
docker compose version
```

Deberías ver:
```
Docker version 25.x.x, build xxxxx
Docker Compose version v2.24.x
```

### **6. Ejecutar el Proyecto**
```bash
cd /mnt/d/bvs_framework
./iniciar-sprint6.sh
```

---

## 🔄 Cada Vez que Abras WSL

Docker no se inicia automáticamente en WSL. Cada vez que abras una nueva terminal de WSL, ejecuta:

```bash
sudo service docker start
```

### **Opcional: Inicio Automático**

Para que Docker se inicie automáticamente cada vez que abras WSL:

```bash
echo 'sudo service docker start' >> ~/.bashrc
```

Esto agregará el comando al final de tu archivo `.bashrc`.

---

## 🎯 Comandos Rápidos

### **Iniciar Docker**
```bash
sudo service docker start
```

### **Verificar que Docker está Corriendo**
```bash
docker ps
```

### **Detener Docker** (para liberar recursos)
```bash
sudo service docker stop
```

### **Reiniciar Docker**
```bash
sudo service docker restart
```

---

## 📊 Ventajas vs Docker Desktop

| Característica | Docker Desktop | Docker Engine en WSL |
|----------------|----------------|---------------------|
| RAM en reposo | ~2-4 GB | ~50 MB |
| RAM en uso | ~4-6 GB | ~500 MB - 1 GB |
| CPU en reposo | 5-10% | 0% |
| Inicio de Windows | Se inicia automáticamente | No se inicia |
| GUI | Sí | No (solo terminal) |
| Velocidad | Media | Rápida |

---

## 🐛 Troubleshooting

### **Error: "Cannot connect to Docker daemon"**

**Solución:**
```bash
sudo service docker start
```

### **Error: "permission denied"**

**Solución:**
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar y volver a abrir WSL
exit
# (vuelve a abrir WSL)
```

### **Error: "docker: command not found"**

**Causa:** Docker no se instaló correctamente.

**Solución:**
```bash
# Reinstalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### **WSL no encuentra /mnt/d/bvs_framework**

**Solución:**
```bash
# Verificar letra de tu disco
ls /mnt/

# Si tu proyecto está en otra letra, ajusta:
cd /mnt/c/bvs_framework  # Por ejemplo
```

---

## 🚀 Resumen del Flujo de Trabajo

### **Primera Vez (Instalación):**
```bash
# 1. En WSL
cd /mnt/d/bvs_framework
bash instalar-docker-wsl.sh

# 2. Cerrar y volver a abrir WSL

# 3. Iniciar Docker
sudo service docker start

# 4. Ejecutar proyecto
./iniciar-sprint6.sh
```

### **Cada Día (Uso Normal):**
```bash
# 1. Abrir WSL
wsl

# 2. Iniciar Docker
sudo service docker start

# 3. Ir al proyecto y trabajar
cd /mnt/d/bvs_framework
./iniciar-sprint6.sh
```

### **Al Terminar (Liberar Recursos):**
```bash
# Detener contenedores
docker compose down

# Detener Docker (opcional, para liberar toda la RAM)
sudo service docker stop
```

---

## 💡 Tips

1. **Inicio Automático:** Agrega `sudo service docker start` a tu `.bashrc` para no tener que iniciarlo manualmente.

2. **Alias Útiles:** Agrega estos a tu `.bashrc`:
   ```bash
   alias dstart='sudo service docker start'
   alias dstop='sudo service docker stop'
   alias sprint6='cd /mnt/d/bvs_framework && ./iniciar-sprint6.sh'
   ```

3. **Verificar Recursos:** Para ver cuánta RAM usa Docker:
   ```bash
   docker stats
   ```

---

## 📚 Enlaces Útiles

- **Documentación de Docker Engine:** https://docs.docker.com/engine/
- **Docker en WSL:** https://docs.docker.com/desktop/wsl/
- **Troubleshooting:** https://docs.docker.com/engine/install/linux-postinstall/

---

**¿Listo para instalar? Sigue la Opción 1 (Instalación Automática) arriba.** 🚀
