# 🔍 Instrucciones para Verificar los Servicios

## Resumen del Estado Actual

Basándome en las verificaciones realizadas:

### ✅ Servicios Funcionando Correctamente:
- **PostgreSQL** (puerto 5432) - ✅ Accesible
- **Redis** (puerto 6379) - ✅ Accesible
- **Elasticsearch** (puerto 9200) - ✅ Funcionando (versión 8.11.0)
- **Frontend Next.js** (puerto 3000) - ✅ Respondiendo HTTP 200

### ⚠️ Servicios con Problemas:
- **Backend Django** (puerto 8000) - ⚠️ Puerto abierto pero no responde HTTP

---

## 🚀 Cómo Ejecutar el Diagnóstico Completo

### Opción 1: Script de Diagnóstico Completo (Recomendado)

Abre WSL y ejecuta:

```bash
cd /mnt/d/bvs_framework
chmod +x diagnostico-completo.sh
./diagnostico-completo.sh
```

Este script verificará:
1. Estado de todos los contenedores
2. Conectividad de puertos
3. Respuestas HTTP de cada servicio
4. Logs recientes de cada contenedor
5. Uso de recursos
6. Conectividad interna entre servicios

### Opción 2: Comandos Manuales

Si prefieres ejecutar comandos individuales:

#### Ver estado de contenedores:
```bash
sudo docker-compose ps
```

#### Ver logs del backend (para diagnosticar el problema):
```bash
sudo docker-compose logs backend
```

#### Ver logs en tiempo real:
```bash
sudo docker-compose logs -f backend
```

#### Ver logs de todos los servicios:
```bash
sudo docker-compose logs --tail=50
```

#### Reiniciar un servicio específico:
```bash
sudo docker-compose restart backend
```

#### Reconstruir y reiniciar el backend:
```bash
sudo docker-compose up -d --build backend
```

---

## 🔧 Diagnóstico del Backend

El backend parece tener un problema. Para investigar:

### 1. Verificar logs del backend:
```bash
sudo docker-compose logs backend --tail=100
```

### 2. Entrar al contenedor del backend:
```bash
sudo docker-compose exec backend bash
```

Una vez dentro, puedes:
```bash
# Ver procesos
ps aux

# Verificar si Django está corriendo
python manage.py check

# Intentar correr el servidor manualmente
python manage.py runserver 0.0.0.0:8000
```

### 3. Verificar variables de entorno:
```bash
sudo docker-compose exec backend env | grep -E "DJANGO|DB_|REDIS"
```

### 4. Verificar conectividad a la base de datos:
```bash
sudo docker-compose exec backend python manage.py check --database default
```

---

## 🔄 Acciones Recomendadas

### Si el backend no está corriendo:

1. **Ver los logs completos:**
   ```bash
   sudo docker-compose logs backend
   ```

2. **Reiniciar el backend:**
   ```bash
   sudo docker-compose restart backend
   ```

3. **Si hay errores de migración:**
   ```bash
   sudo docker-compose exec backend python manage.py migrate
   ```

4. **Reconstruir completamente:**
   ```bash
   sudo docker-compose down
   sudo docker-compose up -d --build
   ```

---

## 📊 URLs de Acceso

Una vez que todos los servicios estén funcionando:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **Elasticsearch**: http://localhost:9200
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 🐛 Problemas Comunes

### Backend no responde:
- Verifica los logs: `sudo docker-compose logs backend`
- Posibles causas:
  - Error en migraciones de base de datos
  - Error de configuración en `.env`
  - Dependencias faltantes
  - Error en el código

### Frontend no carga:
- Verifica que el backend esté funcionando primero
- Revisa logs: `sudo docker-compose logs frontend`

### Elasticsearch no inicia:
- Puede necesitar más memoria
- Verifica logs: `sudo docker-compose logs elasticsearch`

---

## 📝 Siguiente Paso

**Por favor ejecuta el script de diagnóstico y comparte la salida:**

```bash
cd /mnt/d/bvs_framework
chmod +x diagnostico-completo.sh
./diagnostico-completo.sh > diagnostico_output.txt 2>&1
```

Luego puedes revisar el archivo `diagnostico_output.txt` o compartir su contenido para que pueda ayudarte a resolver cualquier problema.
