# 🎯 Playbook de Diagnóstico - Docker Services

## 📖 Propósito

Este playbook te guía paso a paso para diagnosticar y resolver problemas con servicios Docker que no responden, específicamente cuando los contenedores están "UP" pero no son accesibles vía web.

---

## 🚦 Matriz de Decisión Rápida

| Síntoma | Script a Ejecutar | Tiempo Estimado |
|---------|-------------------|-----------------|
| No sé qué pasa | `bash solucion-rapida.sh` | 2 min |
| Solo quiero verificar | `bash verificar-acceso.sh` | 30 seg |
| Ambos servicios fallan | `bash fix-servicios-completo.sh` | 3 min |
| Solo backend falla | `bash diagnostico-backend.sh` | 1 min |
| Necesito análisis completo | `bash diagnostico-puertos.sh` | 2 min |
| Nada funciona | `bash reset-completo.sh` | 5-10 min |

---

## 🔍 Fase 1: Identificación del Problema

### Paso 1.1: Verificación Inicial Rápida

```bash
# Ejecuta esto primero
bash verificar-acceso.sh
```

**Interpreta los resultados:**

| Resultado | Significado | Siguiente Paso |
|-----------|-------------|----------------|
| ✓ Frontend OK, ✓ Backend OK | Todo funciona | No hacer nada |
| ✗ Frontend NO, ✗ Backend NO | Problema sistémico | Ir a Fase 2 |
| ✓ Frontend OK, ✗ Backend NO | Problema en backend | Ir a Fase 3 |
| ✗ Frontend NO, ✓ Backend OK | Problema en frontend | Ir a Fase 4 |

---

### Paso 1.2: Verificar Estado de Contenedores

```bash
docker-compose ps
```

**Busca:**
- ✅ `Up` - Contenedor corriendo (pero puede tener problemas internos)
- ✅ `Up (healthy)` - Contenedor corriendo y saludable
- ⚠️ `Up (unhealthy)` - Contenedor corriendo pero healthcheck falla → **Ir a Sección "Unhealthy"**
- ❌ `Exited (0)` - Contenedor detenido normalmente → **Reiniciar con** `docker-compose up -d`
- ❌ `Exited (1)` - Contenedor falló al iniciar → **Ver logs**
- ⚠️ `Restarting` - Contenedor en loop de reinicio → **Problema grave, ir a Fase 5**

---

### Paso 1.3: Logs Rápidos

```bash
# Ver últimas líneas de cada servicio
docker-compose logs --tail 20 backend
docker-compose logs --tail 20 frontend
```

**Busca errores comunes:**

| Error en Logs | Causa | Solución Rápida |
|---------------|-------|-----------------|
| `ModuleNotFoundError` | Dependencia faltante | `docker-compose build backend` |
| `could not connect to server` | DB no disponible | `docker-compose up -d db && sleep 10 && docker-compose restart backend` |
| `Port 8000 is already in use` | Puerto ocupado | Ver logs de Windows: `netstat -ano \| findstr :8000` |
| `SyntaxError` | Error de código | Corregir código y `docker-compose restart` |
| `npm ERR!` | Error Node/npm | `docker-compose build frontend` |
| `ECONNREFUSED` | No puede conectar a backend | Backend no está corriendo |

---

## 🛠️ Fase 2: Problema Sistémico (Ambos Servicios Fallan)

### Paso 2.1: Verificar Dependencias

```bash
# Ver estado de servicios base
docker-compose ps db redis elasticsearch
```

**Si alguno está "Exited":**
```bash
# Iniciar dependencias
docker-compose up -d db redis elasticsearch

# Esperar que estén listas
sleep 15

# Reiniciar servicios principales
docker-compose restart backend frontend
```

---

### Paso 2.2: Aplicar Solución Automática

```bash
bash fix-servicios-completo.sh
```

**Este script:**
1. Detiene frontend y backend
2. Verifica que dependencias estén UP
3. Inicia backend con espera de hasta 60s
4. Inicia frontend con espera de hasta 60s
5. Verifica acceso final

**Si funciona:** ✅ Problema resuelto
**Si NO funciona:** Continuar a Paso 2.3

---

### Paso 2.3: Diagnóstico Profundo

```bash
bash diagnostico-puertos.sh > diagnostico-completo.txt
```

**Analiza el archivo generado:**
- Busca la sección "LOGS BACKEND" y "LOGS FRONTEND"
- Identifica el primer error que aparece
- Busca el error en la tabla de "Errores Comunes" (Paso 1.3)

---

### Paso 2.4: Reset Completo (Último Recurso)

```bash
bash reset-completo.sh
```

⚠️ **Solo si:**
- Todos los pasos anteriores fallaron
- Hay problemas de build/dependencias
- Sospecha de corrupción en volúmenes

✅ **Seguro:** No elimina datos de base de datos

---

## 🐍 Fase 3: Problema Solo en Backend

### Paso 3.1: Diagnóstico Específico

```bash
bash diagnostico-backend.sh
```

**Revisa la salida:**
- Sección "Procesos Python corriendo": Debe mostrar `python manage.py runserver`
- Sección "Puertos escuchando": Debe mostrar `:8000`
- Sección "Test de conexión a Django": Debe responder con código HTTP 200/302

---

### Paso 3.2: Verificaciones Específicas Backend

```bash
# 1. ¿Python está corriendo?
docker exec bvs_framework-backend-1 ps aux | grep python

# Si NO hay proceso Python, ver por qué no arrancó:
docker logs bvs_framework-backend-1 --tail 50

# 2. ¿Puerto 8000 está escuchando?
docker exec bvs_framework-backend-1 netstat -tln | grep 8000

# Si NO está escuchando, Django no arrancó correctamente

# 3. ¿DB está accesible?
docker exec bvs_framework-backend-1 python -c "import psycopg2; conn = psycopg2.connect(host='db', database='biblioteca', user='postgres', password='postgres'); print('✓ DB OK')"

# Si falla, iniciar DB:
docker-compose up -d db && sleep 10 && docker-compose restart backend
```

---

### Paso 3.3: Soluciones Comunes Backend

**Caso A: Error de Migraciones**
```bash
docker-compose exec backend python manage.py migrate
docker-compose restart backend
```

**Caso B: Error de Importación**
```bash
# Rebuild con dependencias actualizadas
docker-compose build backend
docker-compose up -d backend
```

**Caso C: Error de Código**
```bash
# Ver el error específico
docker logs bvs_framework-backend-1 --tail 30

# Corregir el código
# Reiniciar
docker-compose restart backend
```

**Caso D: Puerto Ocupado DENTRO del Contenedor**
```bash
# Recrear el contenedor
docker-compose up -d --force-recreate backend
```

---

## ⚛️ Fase 4: Problema Solo en Frontend

### Paso 4.1: Verificaciones Específicas Frontend

```bash
# 1. ¿Node está corriendo?
docker exec bvs_framework-frontend-1 ps aux | grep node

# Si NO hay proceso Node:
docker logs bvs_framework-frontend-1 --tail 50

# 2. ¿Puerto 3000 está escuchando?
docker exec bvs_framework-frontend-1 netstat -tln | grep 3000

# 3. ¿Puede conectar al backend?
docker exec bvs_framework-frontend-1 curl -I http://backend:8000/admin/
```

---

### Paso 4.2: Soluciones Comunes Frontend

**Caso A: Error de Compilación**
```bash
# Ver logs completos
docker logs bvs_framework-frontend-1 --tail 100

# Buscar errores de TypeScript o React
# Corregir código
# Reiniciar (Next.js auto-recompila)
docker-compose restart frontend
```

**Caso B: Dependencias Faltantes**
```bash
# Rebuild
docker-compose build frontend
docker-compose up -d frontend
```

**Caso C: Error de Conexión al Backend**
```bash
# Verificar que backend esté accesible
bash verificar-acceso.sh

# Si backend está OK pero frontend dice que no:
# Verificar NEXT_PUBLIC_API_URL en docker-compose.yml
docker exec bvs_framework-frontend-1 env | grep NEXT_PUBLIC_API_URL

# Debe ser: http://localhost:8000/api
```

**Caso D: Hydration Error**
```bash
# Estos son errores de React, generalmente no impiden acceso
# Verificar en consola del navegador (F12)
# Corregir el componente con el error de hidratación
```

---

## ⚕️ Fase 5: Contenedor "Unhealthy" o en Loop

### Paso 5.1: Identificar Contenedor Problemático

```bash
docker ps --filter "health=unhealthy"
```

---

### Paso 5.2: Ver Logs del Healthcheck

```bash
# Para backend
docker inspect bvs_framework-backend-1 --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

# Para frontend
docker inspect bvs_framework-frontend-1 --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

---

### Paso 5.3: Entender el Healthcheck

**Backend (docker-compose.yml):**
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8000/admin/ || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

**Significa:**
- Cada 30s, intenta `curl http://localhost:8000/admin/`
- Si falla 5 veces consecutivas → marca como "unhealthy"
- Tiene 60s de gracia al inicio antes de empezar a verificar

**Frontend (docker-compose.yml):**
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 90s
```

---

### Paso 5.4: Solución para Unhealthy

```bash
# Opción 1: Esperar más tiempo (si recién inició)
# Healthcheck puede tardar hasta start_period + (interval * retries)
# Backend: hasta 60s + 150s = 3.5 minutos
# Frontend: hasta 90s + 90s = 3 minutos

# Opción 2: Verificar manualmente el healthcheck
docker exec bvs_framework-backend-1 curl -f http://localhost:8000/admin/

# Si falla, el servicio no arrancó correctamente
# Ver logs para identificar por qué
docker logs bvs_framework-backend-1 --tail 50

# Opción 3: Recrear con más tiempo
docker-compose up -d --force-recreate backend
# Esperar al menos 4 minutos antes de verificar

# Opción 4: Deshabilitar temporalmente healthcheck
# Editar docker-compose.yml y comentar la sección healthcheck
# (Solo para debugging, no recomendado en producción)
```

---

## 📊 Árbol de Decisión Visual

```
┌─────────────────────────────────┐
│ ¿Los servicios responden?       │
│ bash verificar-acceso.sh        │
└────────┬────────────────────────┘
         │
         ├─ ✓ Ambos OK
         │  └─ ✅ No hacer nada
         │
         ├─ ✗ Ambos fallan
         │  └─┬─ bash fix-servicios-completo.sh
         │    ├─ ✓ Funcionó → ✅ Listo
         │    └─ ✗ Sigue fallando
         │       └─ bash diagnostico-puertos.sh
         │          └─ Identificar error específico
         │             └─ bash reset-completo.sh (último recurso)
         │
         ├─ ✗ Solo Backend falla
         │  └─┬─ bash diagnostico-backend.sh
         │    ├─ Ver logs
         │    ├─ Verificar DB
         │    ├─ Verificar migraciones
         │    └─ docker-compose restart backend
         │
         └─ ✗ Solo Frontend falla
            └─┬─ Ver logs: docker logs frontend
              ├─ Verificar compilación
              ├─ Verificar conexión a backend
              └─ docker-compose restart frontend
```

---

## 🎓 Casos de Estudio

### Caso Real 1: "Contenedores UP pero no puedo acceder"

**Síntomas Iniciales:**
- `docker ps` muestra todos los contenedores como "Up"
- `http://localhost:3000` timeout
- `http://localhost:8000/admin/` timeout

**Diagnóstico Realizado:**
```bash
bash verificar-acceso.sh
# Resultado: ✗ Frontend NO, ✗ Backend NO
```

**Análisis:**
- Frontend estaba "Up" pero Next.js sí arrancó correctamente
- Backend estaba "Up" pero Django NO arrancó
- Logs mostraban: "ERR_NETWORK" desde el frontend al intentar conectar al backend
- Test de puerto mostró: puerto 8000 CERRADO

**Causa Raíz:**
- Django falló al iniciar (error de importación o DB no accesible)
- Frontend intentaba conectarse pero backend no respondía

**Solución Aplicada:**
```bash
bash fix-servicios-completo.sh
```

**Resultado:**
- Script detuvo ambos servicios
- Verificó que DB, Redis, ES estaban UP
- Reinició backend con espera de 60s
- Django arrancó correctamente
- Reinició frontend
- Ambos servicios respondiendo: ✅

---

### Caso Real 2: "Backend unhealthy después de cambios en código"

**Síntomas:**
- Hice cambios en `views.py`
- Reinicié con `docker-compose restart backend`
- Ahora muestra "unhealthy"

**Diagnóstico:**
```bash
docker inspect bvs_framework-backend-1 --format='{{.State.Health.Status}}'
# unhealthy

docker logs bvs_framework-backend-1 --tail 30
# SyntaxError: invalid syntax en views.py línea 45
```

**Causa:**
Error de sintaxis en el código Python

**Solución:**
1. Corregí el error de sintaxis
2. `docker-compose restart backend`
3. Esperé 2 minutos (start_period)
4. Verificó: `docker ps` → "Up (healthy)" ✅

---

### Caso Real 3: "Frontend carga pero muestra página en blanco"

**Síntomas:**
- `http://localhost:3000` carga
- Pero solo muestra página en blanco
- Consola del navegador muestra errores

**Diagnóstico:**
```bash
# Verificar acceso
bash verificar-acceso.sh
# Frontend: ✓ Responde
# Backend: ✗ No responde

# Verificar backend específicamente
bash diagnostico-backend.sh
# Puerto 8000 NO está escuchando
```

**Causa:**
- Frontend SÍ está corriendo
- Pero backend NO arrancó
- Frontend renderiza HTML pero no puede cargar datos

**Solución:**
```bash
# Ver por qué backend no arrancó
docker logs bvs_framework-backend-1 --tail 50
# Error: could not connect to server (PostgreSQL)

# Iniciar PostgreSQL
docker-compose up -d db
sleep 10

# Reiniciar backend
docker-compose restart backend

# Verificar
bash verificar-acceso.sh
# ✓ Ambos funcionando
```

---

## 📝 Checklist de Respuesta a Incidentes

Cuando tengas un problema, sigue este checklist:

### ✅ Fase de Recopilación de Información (5 min)

- [ ] Ejecutar `bash verificar-acceso.sh`
- [ ] Ejecutar `docker-compose ps`
- [ ] Guardar logs: `docker-compose logs > logs-incidente.txt`
- [ ] Identificar qué servicio(s) falla(n)

### ✅ Fase de Solución Rápida (5 min)

- [ ] Ejecutar `bash solucion-rapida.sh`
- [ ] Si funciona → ✅ Documentar qué pasó
- [ ] Si NO funciona → Continuar

### ✅ Fase de Diagnóstico Profundo (10 min)

- [ ] Ejecutar `bash diagnostico-puertos.sh > diagnostico.txt`
- [ ] Identificar error específico en logs
- [ ] Buscar error en tabla de "Errores Comunes"
- [ ] Aplicar solución específica

### ✅ Fase de Escalamiento (15 min)

- [ ] Si nada funciona, ejecutar `bash reset-completo.sh`
- [ ] Documentar el problema y la solución
- [ ] Actualizar este playbook con el nuevo caso

---

## 🔧 Comandos de Emergencia

Copia y pega estos comandos según necesites:

```bash
# Ver TODO el estado
bash verificar-acceso.sh && docker-compose ps && docker-compose logs --tail 20

# Reiniciar TODO
docker-compose restart

# Ver logs en vivo de ambos servicios
docker-compose logs -f backend frontend

# Recrear solo los servicios problemáticos
docker-compose up -d --force-recreate backend frontend

# Reset nuclear (CUIDADO: tarda 10 min)
bash reset-completo.sh

# Guardar estado para análisis
docker-compose ps > estado.txt && docker-compose logs > logs.txt && bash diagnostico-puertos.sh > diagnostico.txt
```

---

## 📚 Referencias Rápidas

- **Troubleshooting General:** `docs/TROUBLESHOOTING_CONTENEDORES.md`
- **Scripts:** `SOLUCION_DEFINITIVA_README.md`
- **Inicio Rápido:** `INICIO_RAPIDO.txt`

---

**Última actualización:** 2026-01-03
**Versión:** 1.0
**Mantenido por:** DevOps Team
