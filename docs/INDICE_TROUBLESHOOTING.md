# 📚 Índice Maestro - Troubleshooting y Soluciones Docker

**Creado:** 2026-01-03
**Propósito:** Índice completo de documentación para diagnosticar y resolver problemas con servicios Docker

---

## 🎯 Inicio Rápido

### ⚡ Tengo un Problema AHORA

```bash
bash solucion-rapida.sh
```

Este único comando hace TODO automáticamente.

### 📖 Guía de Lectura por Rol

| Rol | Empieza Aquí |
|-----|--------------|
| 🚨 Desarrollador con problema | [`../INICIO_RAPIDO.txt`](../INICIO_RAPIDO.txt) |
| 🔧 DevOps/Support | [`PLAYBOOK_DIAGNOSTICO.md`](PLAYBOOK_DIAGNOSTICO.md) |
| 📊 Manager/Lead | [`../SOLUCION_LISTA.md`](../SOLUCION_LISTA.md) |
| 🎓 Nuevo en el proyecto | Este documento (INDICE_TROUBLESHOOTING.md) |

---

## 📋 Documentación Disponible

### 1. Guías de Referencia Rápida

#### [`../INICIO_RAPIDO.txt`](../INICIO_RAPIDO.txt)
- **Qué es:** Referencia visual de una página
- **Cuándo usar:** Primera vez que tienes un problema
- **Tiempo lectura:** 2 minutos
- **Contenido clave:**
  - Comando principal: `bash solucion-rapida.sh`
  - Lista de todos los scripts
  - URLs de acceso
  - Comandos útiles básicos

#### [`../SCRIPTS_SOLUCION_PUERTOS.txt`](../SCRIPTS_SOLUCION_PUERTOS.txt)
- **Qué es:** Índice de todos los scripts bash
- **Cuándo usar:** Necesitas saber qué script ejecutar
- **Tiempo lectura:** 3 minutos
- **Contenido clave:**
  - 7 scripts bash con descripciones
  - Tamaño y propósito de cada uno
  - Comandos de ejecución
  - Características principales

---

### 2. Documentación Completa de Scripts

#### [`../SOLUCION_DEFINITIVA_README.md`](../SOLUCION_DEFINITIVA_README.md)
- **Qué es:** Guía exhaustiva de todos los scripts ⭐
- **Cuándo usar:** Quieres entender cómo funcionan los scripts
- **Tiempo lectura:** 15 minutos
- **Contenido clave:**
  - Descripción detallada de 6 scripts
  - Características y funcionalidades
  - Ejemplos de uso paso a paso
  - Flujo visual de decisión
  - TL;DR para lectura rápida
  - Comandos de emergencia

**Secciones principales:**
1. Scripts Principales
2. Scripts de Solución
3. Scripts de Diagnóstico
4. Scripts Avanzados
5. Ejemplos de Uso
6. TL;DR

---

#### [`../SOLUCION_LISTA.md`](../SOLUCION_LISTA.md)
- **Qué es:** Resumen ejecutivo ⭐
- **Cuándo usar:** Necesitas overview rápido
- **Tiempo lectura:** 5 minutos
- **Contenido clave:**
  - Lista de scripts (resumen)
  - 6 casos de uso comunes
  - Tabla comparativa de scripts
  - Flujo de ejecución
  - Próximos pasos
  - URLs de acceso

---

### 3. Análisis y Contexto

#### [`../ANALISIS_PROBLEMA_PUERTOS.md`](../ANALISIS_PROBLEMA_PUERTOS.md)
- **Qué es:** Análisis técnico del problema original
- **Cuándo usar:** Quieres entender la causa raíz
- **Tiempo lectura:** 10 minutos
- **Contenido clave:**
  - Diagnóstico del problema
  - Evidencia de logs (Next.js)
  - Causas probables identificadas
  - Soluciones paso a paso
  - Información técnica adicional
  - Errores típicos en logs

---

### 4. Guías de Troubleshooting

#### [`TROUBLESHOOTING_CONTENEDORES.md`](TROUBLESHOOTING_CONTENEDORES.md)
- **Qué es:** Guía completa de resolución de problemas ⭐⭐⭐
- **Cuándo usar:** Tu referencia principal para cualquier problema
- **Tiempo lectura:** 20-30 minutos (lectura completa)
- **Contenido clave:**
  - 6 problemas comunes con soluciones detalladas
  - Metodología de diagnóstico (6 pasos)
  - Scripts explicados en contexto
  - 6 casos de uso específicos
  - Mejores prácticas
  - Comandos útiles adicionales
  - Checklist de troubleshooting

**Problemas cubiertos:**
1. Contenedores UP pero servicios NO responden
2. Backend responde pero frontend NO
3. Frontend responde pero backend NO
4. Healthcheck "Unhealthy"
5. Puerto ocupado
6. Otros problemas comunes

**Secciones principales:**
- Problemas Comunes
- Metodología de Diagnóstico
- Scripts de Solución
- Casos de Uso Específicos
- Mejores Prácticas

---

#### [`PLAYBOOK_DIAGNOSTICO.md`](PLAYBOOK_DIAGNOSTICO.md)
- **Qué es:** Guía paso a paso de respuesta a incidentes ⭐⭐⭐
- **Cuándo usar:** Tienes un incidente activo AHORA
- **Tiempo lectura:** 10 minutos (ejecución ~30 min)
- **Contenido clave:**
  - Matriz de decisión rápida
  - 5 fases de diagnóstico detalladas
  - Árbol de decisión visual
  - 3 casos de estudio reales
  - Checklist de respuesta a incidentes
  - Comandos de emergencia copy-paste
  - Interpretación de resultados

**Fases del Playbook:**
1. **Fase 1:** Identificación del Problema
2. **Fase 2:** Problema Sistémico (ambos servicios)
3. **Fase 3:** Problema Solo en Backend
4. **Fase 4:** Problema Solo en Frontend
5. **Fase 5:** Contenedor Unhealthy o en Loop

---

### 5. Mejores Prácticas y Prevención

#### [`MEJORES_PRACTICAS_DOCKER.md`](MEJORES_PRACTICAS_DOCKER.md)
- **Qué es:** Guía preventiva y de mantenimiento ⭐⭐⭐
- **Cuándo usar:** Desarrollo diario y planificación
- **Tiempo lectura:** 25 minutos
- **Contenido clave:**
  - Desarrollo diario (inicio, durante, fin)
  - Mantenimiento preventivo (semanal, mensual)
  - Monitoreo y logs efectivo
  - Optimización de rendimiento
  - Seguridad (variables, permisos)
  - Backup y recuperación completa
  - Checklist de mejores prácticas

**Secciones principales:**
1. Desarrollo Diario
2. Mantenimiento Preventivo
3. Monitoreo y Logs
4. Optimización de Rendimiento
5. Seguridad
6. Backup y Recuperación

---

## 🗺️ Flujos de Trabajo

### Flujo 1: Problema Urgente

```
1. Ejecutar: bash solucion-rapida.sh
   ↓ Si no funciona
2. Abrir: PLAYBOOK_DIAGNOSTICO.md
   ↓ Seguir fases
3. Ejecutar diagnóstico según fase
   ↓ Si persiste
4. Consultar: TROUBLESHOOTING_CONTENEDORES.md
   ↓ Último recurso
5. Ejecutar: bash reset-completo.sh
```

---

### Flujo 2: Aprendizaje Completo

```
Día 1: INICIO_RAPIDO.txt + probar scripts
Día 2: SOLUCION_DEFINITIVA_README.md
Día 3: TROUBLESHOOTING_CONTENEDORES.md
Día 4: PLAYBOOK_DIAGNOSTICO.md + casos
Día 5: MEJORES_PRACTICAS_DOCKER.md
```

---

### Flujo 3: Prevención

```
Semanal:
- Revisar: MEJORES_PRACTICAS_DOCKER.md → Semanal
- Ejecutar: bash verificar-acceso.sh
- Backup: Database

Mensual:
- Revisar: MEJORES_PRACTICAS_DOCKER.md → Mensual
- Limpiar: docker system prune
- Actualizar: docker-compose pull
```

---

## 🎯 Scripts Bash Creados

### Script Maestro

**`solucion-rapida.sh`** (8.0K)
- Solución automática completa
- Verifica → Fix → Re-verifica → Resultado
- **Ejecutar:** `bash solucion-rapida.sh`

---

### Scripts de Solución

**`verificar-acceso.sh`** (6.0K)
- Verificación sin modificar nada
- Test de puertos TCP y HTTP
- Health status
- **Ejecutar:** `bash verificar-acceso.sh`

**`fix-servicios-completo.sh`** (5.9K)
- Fix automático con espera inteligente
- Detiene → Deps → Backend → Frontend → Verifica
- **Ejecutar:** `bash fix-servicios-completo.sh`

---

### Scripts de Diagnóstico

**`diagnostico-puertos.sh`** (5.0K)
- Diagnóstico completo de ambos servicios
- Logs, procesos, puertos, recomendaciones
- **Ejecutar:** `bash diagnostico-puertos.sh`

**`diagnostico-backend.sh`** (4.7K)
- Diagnóstico específico del backend
- Python, Django, DB, migraciones
- **Ejecutar:** `bash diagnostico-backend.sh`

---

### Scripts Avanzados

**`reset-completo.sh`** (4.9K)
- Reset total del sistema
- Down → Limpia → Rebuild → Migra → Up
- ⚠️ NO elimina datos de DB
- **Ejecutar:** `bash reset-completo.sh`

---

### Utilidades

**`listar-scripts.sh`** (5.3K)
- Lista todos los scripts con colores
- Descripciones y categorías
- **Ejecutar:** `bash listar-scripts.sh`

---

## 📊 Matriz de Referencia Rápida

| Necesito... | Documento | Tiempo |
|------------|-----------|--------|
| Solución AHORA | INICIO_RAPIDO.txt | 2 min |
| Guía paso a paso | PLAYBOOK_DIAGNOSTICO.md | 30 min |
| Entender problema | TROUBLESHOOTING_CONTENEDORES.md | 20 min |
| Ver scripts | SCRIPTS_SOLUCION_PUERTOS.txt | 3 min |
| Guía completa | SOLUCION_DEFINITIVA_README.md | 15 min |
| Mejores prácticas | MEJORES_PRACTICAS_DOCKER.md | 25 min |
| Backup/Restore | MEJORES_PRACTICAS_DOCKER.md § Backup | 5 min |
| Optimizar | MEJORES_PRACTICAS_DOCKER.md § Optimización | 10 min |
| Casos reales | PLAYBOOK_DIAGNOSTICO.md § Casos | 10 min |
| Resumen ejecutivo | SOLUCION_LISTA.md | 5 min |

---

## 🔥 Comandos de Emergencia

```bash
# 1. SOLUCIÓN INMEDIATA
bash solucion-rapida.sh

# 2. DIAGNÓSTICO COMPLETO
bash diagnostico-puertos.sh > diagnostico.txt

# 3. VER LOGS EN VIVO
docker-compose logs -f backend frontend

# 4. REINICIAR TODO
docker-compose restart

# 5. RESET NUCLEAR
bash reset-completo.sh

# 6. VERIFICAR ESTADO
bash verificar-acceso.sh && docker-compose ps
```

---

## 🎓 Recomendaciones de Lectura

### Para Resolver Problema Inmediato
1. **[INICIO_RAPIDO.txt](../INICIO_RAPIDO.txt)** (2 min)
2. **[PLAYBOOK_DIAGNOSTICO.md](PLAYBOOK_DIAGNOSTICO.md)** (seguir fases)

### Para Entender a Fondo
1. **[TROUBLESHOOTING_CONTENEDORES.md](TROUBLESHOOTING_CONTENEDORES.md)** (20 min)
2. **[SOLUCION_DEFINITIVA_README.md](../SOLUCION_DEFINITIVA_README.md)** (15 min)

### Para Prevenir Problemas
1. **[MEJORES_PRACTICAS_DOCKER.md](MEJORES_PRACTICAS_DOCKER.md)** (25 min)

### Para Managers/Leads
1. **[SOLUCION_LISTA.md](../SOLUCION_LISTA.md)** (5 min)
2. **[ANALISIS_PROBLEMA_PUERTOS.md](../ANALISIS_PROBLEMA_PUERTOS.md)** (10 min)

---

## 📁 Estructura de Archivos

```
bvs_framework/
│
├── docs/
│   ├── INDICE_TROUBLESHOOTING.md        # Este archivo
│   ├── TROUBLESHOOTING_CONTENEDORES.md  # Guía troubleshooting
│   ├── PLAYBOOK_DIAGNOSTICO.md          # Playbook respuesta
│   └── MEJORES_PRACTICAS_DOCKER.md      # Mejores prácticas
│
├── Scripts (.sh)
│   ├── solucion-rapida.sh               # ⭐ Script maestro
│   ├── verificar-acceso.sh
│   ├── fix-servicios-completo.sh
│   ├── diagnostico-puertos.sh
│   ├── diagnostico-backend.sh
│   ├── reset-completo.sh
│   └── listar-scripts.sh
│
└── Documentación Raíz
    ├── INICIO_RAPIDO.txt
    ├── SCRIPTS_SOLUCION_PUERTOS.txt
    ├── SOLUCION_DEFINITIVA_README.md
    ├── SOLUCION_LISTA.md
    └── ANALISIS_PROBLEMA_PUERTOS.md
```

---

## 💡 Tips de Uso

1. **Bookmark este archivo** - Es tu punto de entrada
2. **Imprime INICIO_RAPIDO.txt** - Tenlo físicamente a mano
3. **Practica los scripts** - Antes de que haya problemas reales
4. **Lee PLAYBOOK_DIAGNOSTICO.md** - Entiende el flujo completo
5. **Implementa MEJORES_PRACTICAS_DOCKER.md** - Prevención es clave
6. **Documenta nuevos casos** - Agrega tu experiencia

---

## 🆘 Flujo de Escalamiento

```
Nivel 1: Auto-servicio
→ bash solucion-rapida.sh
→ Leer: INICIO_RAPIDO.txt

Nivel 2: Guía paso a paso
→ Seguir: PLAYBOOK_DIAGNOSTICO.md
→ Ejecutar diagnósticos específicos

Nivel 3: Diagnóstico profundo
→ Leer: TROUBLESHOOTING_CONTENEDORES.md
→ Guardar logs: diagnostico-puertos.sh > log.txt

Nivel 4: Soporte especializado
→ Compartir: log.txt + contexto
→ Consultar: Equipo DevOps
```

---

## 📚 Contenido por Documento

### TROUBLESHOOTING_CONTENEDORES.md
- 6 problemas comunes
- Metodología 6 pasos
- 6 casos de uso
- Comandos útiles
- Checklist

### PLAYBOOK_DIAGNOSTICO.md
- Matriz de decisión
- 5 fases detalladas
- Árbol de decisión
- 3 casos reales
- Comandos emergencia

### MEJORES_PRACTICAS_DOCKER.md
- Desarrollo diario
- Mantenimiento (semanal/mensual)
- Monitoreo y logs
- Optimización
- Seguridad
- Backup

### SOLUCION_DEFINITIVA_README.md
- 6 scripts explicados
- Características
- Ejemplos de uso
- Flujo visual
- TL;DR

---

**Creado:** 2026-01-03
**Última actualización:** 2026-01-03
**Versión:** 1.0
**Mantenido por:** DevOps Team

---

**¡Comienza aquí:** [`INICIO_RAPIDO.txt`](../INICIO_RAPIDO.txt) **→** `bash solucion-rapida.sh`
