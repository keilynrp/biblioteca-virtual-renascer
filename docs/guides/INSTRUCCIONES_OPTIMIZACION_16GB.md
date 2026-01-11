# 🚀 Instrucciones: Aplicar Optimización 16GB

## Para Usuarios de Linux/Mac/WSL

### Paso 1: Dar Permisos de Ejecución

```bash
chmod +x aplicar-optimizacion-16gb.sh
```

### Paso 2: Ejecutar el Script

```bash
./aplicar-optimizacion-16gb.sh
```

### Características del Script Linux

El script bash mejorado incluye:

✅ **Verificación del Sistema**
- Verifica que tengas suficiente RAM (>=14GB recomendado)
- Verifica que Docker esté instalado y corriendo
- Verifica espacio en disco disponible
- Muestra recursos disponibles para Docker

✅ **Backup Opcional**
- Opción de crear backup antes de aplicar cambios
- Respalda configuración (docker-compose.yml, .env)
- Exporta volúmenes de datos (opcional)
- Timestamp en nombre de backup

✅ **Optimizaciones Docker**
- Detiene contenedores existentes
- Limpia imágenes antiguas
- Reconstruye con configuración 16GB
- Crea volúmenes persistentes
- Inicia servicios optimizados

✅ **Monitoreo en Tiempo Real**
- Verifica salud de cada servicio
- Monitoreo paralelo de todos los contenedores
- Indicadores de progreso con colores
- Timeouts configurables

✅ **Verificación Completa**
- Estado de contenedores
- Uso de recursos en tiempo real
- Conectividad de servicios
- Configuraciones específicas (heap, buffers, etc.)

✅ **Salida con Colores**
- ✓ Verde para éxito
- ⚠ Amarillo para advertencias
- ✗ Rojo para errores
- Azul/Cyan para información

✅ **Opciones Interactivas**
- Preguntas de confirmación
- Opción de ver logs al final
- Manejo de errores graceful

---

## Para Usuarios de Windows

### Opción 1: Desde WSL (Recomendado)

```bash
# Entrar a WSL
wsl

# Navegar al directorio
cd /mnt/d/bvs_framework

# Ejecutar script Linux
chmod +x aplicar-optimizacion-16gb.sh
./aplicar-optimizacion-16gb.sh
```

### Opción 2: Desde PowerShell/CMD

```cmd
APLICAR_OPTIMIZACION_16GB.bat
```

---

## 📊 Proceso Completo

### PASO 1: Verificación del Sistema (30 segundos)
```
- Verificar RAM total (>=14GB)
- Verificar Docker instalado
- Verificar espacio en disco (>=20GB)
- Mostrar recursos disponibles
```

### PASO 2: Backup Opcional (2-5 minutos)
```
- Opción de crear backup
- Respaldar configuración
- Exportar volúmenes de datos
```

### PASO 3: Optimizaciones Docker (10-15 minutos)
```
- Detener contenedores
- Limpiar imágenes antiguas
- Reconstruir con optimizaciones
- Crear volúmenes
- Iniciar servicios
```

### PASO 4: Monitoreo (60-90 segundos)
```
- Esperar servicios saludables
- Verificar DB, Redis, Elasticsearch
- Verificar Backend y Frontend
- Indicadores de progreso
```

### PASO 5: Verificación Final (30 segundos)
```
- Estado de contenedores
- Uso de recursos
- Conectividad de servicios
- Configuraciones específicas
```

**Tiempo total estimado: 15-25 minutos**

---

## 🎯 Ejemplo de Salida

```bash
========================================
  APLICANDO OPTIMIZACION COMPLETA 16GB
========================================

Este script va a:
1. Verificar configuracion del sistema
2. Aplicar optimizaciones Docker para 16GB
3. Reconstruir y reiniciar contenedores
4. Verificar el estado final

Presiona Enter para continuar...

========================================
  PASO 1: VERIFICANDO SISTEMA
========================================

[1.1] Verificando RAM total del sistema...
✓ Sistema tiene 16GB de RAM

[1.2] Memoria disponible:
              total        used        free
Mem:           15Gi       3.2Gi        12Gi

[1.3] Verificando Docker...
✓ Docker instalado: 24.0.7

[1.4] Recursos Docker disponibles:
 Total Memory: 10GiB
 CPUs: 4

[1.5] Espacio en disco disponible:
/dev/sda1       500G  120G  380G  25% /

========================================
  PASO 2: BACKUP (OPCIONAL)
========================================

¿Deseas crear un backup de la configuracion actual? (s/n): s

[2.1] Creando backup de configuracion...
✓ docker-compose.yml respaldado
✓ .env respaldado

[2.2] Exportando volumenes (esto puede tardar)...
✓ postgres_data respaldado
✓ elasticsearch_data respaldado
✓ redis_data respaldado

✓ Backup creado en: docker-backup-20260101-143025

========================================
  PASO 3: OPTIMIZACIONES DOCKER
========================================

[3.1] Deteniendo contenedores actuales...
✓ Contenedores detenidos

[3.2] Limpiando imagenes antiguas...
✓ Imagenes antiguas eliminadas

[3.3] Construyendo imagenes optimizadas para 16GB...
⚠ Esto puede tardar 5-10 minutos...

[Building backend...]
✓ Imagenes construidas exitosamente

[3.4] Creando volumenes persistentes...
✓ Volumen postgres_data creado/verificado
✓ Volumen elasticsearch_data creado/verificado
✓ Volumen redis_data creado/verificado
✓ Volumen frontend_cache creado/verificado

[3.5] Iniciando servicios optimizados...
✓ Servicios iniciados

========================================
  PASO 4: ESPERANDO SERVICIOS
========================================

[4.1] Esperando que servicios esten saludables...
⚠ Esto puede tardar 60-90 segundos...

Monitoreando servicios:
✓ db esta saludable
✓ redis esta saludable
✓ elasticsearch esta saludable
✓ backend esta saludable
✓ frontend esta saludable

========================================
  PASO 5: VERIFICACION FINAL
========================================

[5.1] Estado de contenedores:
NAME                   STATUS
bvs_framework-db-1     Up (healthy)
bvs_framework-redis-1  Up (healthy)
bvs_framework-backend-1 Up (healthy)
bvs_framework-frontend-1 Up (healthy)
bvs_framework-elasticsearch-1 Up (healthy)

[5.2] Uso de recursos:
NAME          CPU %    MEM USAGE / LIMIT     MEM %
backend       2.5%     345MB / 1GB           34.5%
frontend      8.2%     1.8GB / 4GB           45.0%
db            1.1%     187MB / 512MB         36.5%
redis         0.3%     48MB / 256MB          18.8%
elasticsearch 5.7%     1.6GB / 2GB           80.0%

[5.3] Verificando conectividad de servicios...

✓ PostgreSQL: Respondiendo
✓ Redis: Respondiendo
✓ Elasticsearch: Status green
✓ Backend: Respondiendo
✓ Frontend: Respondiendo

[5.4] Verificando configuraciones especificas...

✓ Elasticsearch heap: Xmx1g
✓ PostgreSQL shared_buffers: 128MB
✓ Redis maxmemory: 192MB

========================================
  OPTIMIZACION 16GB COMPLETADA
========================================

✓ Configuracion aplicada exitosamente

Recursos asignados:
  • Frontend:      4GB  (antes 3GB)    ↑ +33%
  • Elasticsearch: 2GB  (antes 1.5GB)  ↑ +33%
  • Backend:       1GB  (optimizado)   ✓
  • PostgreSQL:    512MB (optimizado)  ✓
  • Redis:         256MB (optimizado)  ✓

Total Docker: ~7.8GB / 16GB (49%)
Margen disponible: ~8GB

Comandos útiles:
  docker compose logs -f              Ver logs en tiempo real
  docker compose logs -f [servicio]   Ver logs de un servicio
  docker stats                         Ver uso de recursos
  docker compose ps                    Ver estado de servicios
  docker compose restart [servicio]    Reiniciar un servicio
  docker compose down                  Detener todos los servicios

Verificacion de salud:
  curl http://localhost:8000/           Backend Django
  curl http://localhost:3000/           Frontend Next.js
  curl http://localhost:9200/_cluster/health  Elasticsearch

📚 Documentacion:
  • OPTIMIZACION_16GB_APLICADA.md    Guia completa
  • COMPARACION_OPTIMIZACIONES.md    Analisis tecnico
  • DOCKER_OPTIMIZATIONS.md          Referencia completa

💾 Backup guardado en: docker-backup-20260101-143025

¡Sistema optimizado y listo para usar! 🚀

¿Deseas ver los logs en tiempo real? (s/n):
```

---

## 🔧 Troubleshooting

### Si el script falla en verificación de RAM

```bash
# Verificar RAM manualmente
free -h

# Si tienes 12-14GB, puedes continuar pero puede haber presión de memoria
# Si tienes <12GB, considera usar docker-compose.yml sin modificar
```

### Si Docker no responde

```bash
# Reiniciar Docker
sudo systemctl restart docker

# O en WSL
wsl --shutdown
# Luego reiniciar WSL
```

### Si los servicios quedan unhealthy

```bash
# Ver logs de un servicio específico
docker compose logs backend

# Reiniciar un servicio
docker compose restart backend

# Verificar manualmente
curl http://localhost:8000/
```

### Si necesitas revertir cambios

```bash
# Si creaste backup
cd docker-backup-YYYYMMDD-HHMMSS
cp docker-compose.yml ../
cd ..
docker compose down
docker compose up -d
```

---

## 📝 Notas Importantes

1. **Tiempo de Ejecución**: 15-25 minutos completos
2. **Backup Recomendado**: Siempre di "s" a crear backup
3. **Conexión a Internet**: Necesaria para rebuild de imágenes
4. **No Interrumpir**: Deja que el script complete todo el proceso
5. **Logs Disponibles**: build.log se guarda para debugging

---

## ✅ Verificación Post-Instalación

Después de ejecutar el script, verifica:

```bash
# 1. Todos los servicios healthy
docker compose ps

# 2. Uso de memoria adecuado
docker stats --no-stream

# 3. Elasticsearch respondiendo
curl http://localhost:9200/_cluster/health?pretty

# 4. Backend respondiendo
curl http://localhost:8000/

# 5. Frontend respondiendo
curl http://localhost:3000/
```

Si todos responden correctamente: **✅ ¡Optimización exitosa!**

---

## 🎉 Siguiente Paso

Una vez completada la optimización, lee:
- [OPTIMIZACION_16GB_APLICADA.md](OPTIMIZACION_16GB_APLICADA.md) para detalles completos
- [COMPARACION_OPTIMIZACIONES.md](COMPARACION_OPTIMIZACIONES.md) para análisis técnico

**¡Disfruta de tu sistema optimizado!** 🚀
