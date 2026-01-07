# 📑 Backend Scripts - Index

Índice rápido de todos los scripts y documentación para el backend.

---

## 🚀 Inicio Rápido

**¿Primera vez?** → Lee: [QUICK_START_BACKEND.md](QUICK_START_BACKEND.md)

**¿Problemas?** → Ejecuta: `./scripts/fix_backend_issues.sh`

**¿Quieres entender todo?** → Lee: [BACKEND_OPTIMIZATION_SUMMARY.md](BACKEND_OPTIMIZATION_SUMMARY.md)

---

## 📁 Estructura de Archivos

```
bvs_framework/
│
├── 📄 Inicio Rápido (Root)
│   ├── start-backend.bat          # Windows CMD (principiantes)
│   ├── Start-Backend.ps1          # PowerShell (avanzados)
│   ├── QUICK_START_BACKEND.md     # Guía rápida
│   └── BACKEND_OPTIMIZATION_SUMMARY.md  # Resumen completo
│
├── 📂 scripts/ (Scripts principales)
│   ├── start_backend_optimized.sh      # ⭐ Script principal de inicio
│   ├── fix_backend_issues.sh           # 🔧 Diagnóstico y reparación
│   ├── validate_environment.sh         # ✓ Validación de entorno
│   ├── test_scripts.sh                 # 🧪 Test de scripts
│   ├── BACKEND_SCRIPTS_README.md       # 📖 Documentación detallada
│   └── ... (otros scripts)
│
└── 📂 logs/ (Generado automáticamente)
    └── backend_startup_*.log           # Logs de inicio
```

---

## 🎯 ¿Qué Script Usar?

### Para Iniciar el Backend

| Sistema | Nivel | Comando |
|---------|-------|---------|
| Windows | Principiante | `start-backend.bat` |
| Windows | Avanzado | `.\Start-Backend.ps1` |
| Linux/Mac/Git Bash | Cualquiera | `./scripts/start_backend_optimized.sh` |

### Para Diagnosticar Problemas

Todos los sistemas: `./scripts/fix_backend_issues.sh`

### Para Validar el Entorno

Todos los sistemas: `./scripts/validate_environment.sh`

### Para Probar los Scripts

Todos los sistemas: `./scripts/test_scripts.sh`

---

## 📚 Documentación por Tipo de Usuario

### 🆕 Nuevo Usuario
1. Lee: [QUICK_START_BACKEND.md](QUICK_START_BACKEND.md)
2. Ejecuta: `start-backend.bat` (Windows) o `./scripts/start_backend_optimized.sh`
3. Si hay problemas: [Troubleshooting](QUICK_START_BACKEND.md#⚠️-problemas-comunes-y-soluciones)

### 👨‍💻 Desarrollador Regular
1. Usa: `./scripts/start_backend_optimized.sh --skip-build` (desarrollo diario)
2. Consulta: [scripts/BACKEND_SCRIPTS_README.md](scripts/BACKEND_SCRIPTS_README.md)
3. Problemas: `./scripts/fix_backend_issues.sh`

### 🔧 DevOps/Administrador
1. Lee: [BACKEND_OPTIMIZATION_SUMMARY.md](BACKEND_OPTIMIZATION_SUMMARY.md)
2. Revisa: [scripts/BACKEND_SCRIPTS_README.md](scripts/BACKEND_SCRIPTS_README.md)
3. Usa: Scripts con todas las opciones disponibles

---

## 🔗 Enlaces Directos

### Guías de Inicio
- [Inicio Rápido](QUICK_START_BACKEND.md)
- [Resumen de Optimización](BACKEND_OPTIMIZATION_SUMMARY.md)

### Documentación Técnica
- [README de Scripts](scripts/BACKEND_SCRIPTS_README.md)
- [Troubleshooting General](TROUBLESHOOTING.md)

### Scripts Ejecutables
- [Script Principal (Bash)](scripts/start_backend_optimized.sh)
- [Fix Issues (Bash)](scripts/fix_backend_issues.sh)
- [Validación (Bash)](scripts/validate_environment.sh)
- [Tests (Bash)](scripts/test_scripts.sh)
- [Menu Windows (CMD)](start-backend.bat)
- [PowerShell Script](Start-Backend.ps1)

---

## 📖 Guías por Tarea

### Tarea: Primera Instalación
```bash
# 1. Validar entorno
./scripts/validate_environment.sh

# 2. Iniciar backend
./scripts/start_backend_optimized.sh

# 3. Crear superuser
docker-compose exec backend python manage.py createsuperuser
```
📘 Más info: [QUICK_START_BACKEND.md#inicio-rápido](QUICK_START_BACKEND.md)

---

### Tarea: Desarrollo Diario
```bash
# Inicio rápido (sin rebuild)
./scripts/start_backend_optimized.sh --skip-build
```
📘 Más info: [scripts/BACKEND_SCRIPTS_README.md#uso](scripts/BACKEND_SCRIPTS_README.md)

---

### Tarea: Resolver Problemas
```bash
# Diagnóstico interactivo
./scripts/fix_backend_issues.sh
```
📘 Más info: [QUICK_START_BACKEND.md#diagnóstico-de-problemas](QUICK_START_BACKEND.md)

---

### Tarea: Reset Completo
```bash
# Inicio limpio (borra datos)
./scripts/start_backend_optimized.sh --fresh
```
⚠️ **ADVERTENCIA:** Borra toda la base de datos

📘 Más info: [BACKEND_OPTIMIZATION_SUMMARY.md#reset-completo](BACKEND_OPTIMIZATION_SUMMARY.md)

---

## 🆘 Resolución de Problemas Rápida

| Problema | Solución Rápida |
|----------|-----------------|
| Puerto ocupado | `./scripts/fix_backend_issues.sh` → Opción 2 |
| Dependencias rotas | `./scripts/fix_backend_issues.sh` → Opción 7 |
| DB no conecta | `./scripts/fix_backend_issues.sh` → Opción 8 |
| Migraciones fallidas | `./scripts/fix_backend_issues.sh` → Opción 11 |
| Todo está roto | `./scripts/start_backend_optimized.sh --fresh` |

📘 Más info: [QUICK_START_BACKEND.md#problemas-comunes](QUICK_START_BACKEND.md)

---

## 🧪 Testing y Validación

### Probar Scripts
```bash
./scripts/test_scripts.sh
```

### Validar Entorno
```bash
./scripts/validate_environment.sh
```

### Health Check Manual
```bash
docker-compose ps
curl http://localhost:8000/admin/
curl http://localhost:7700/health
```

---

## 📊 Comparación de Scripts

| Script | Propósito | Interactivo | Tiempo |
|--------|-----------|-------------|--------|
| `start_backend_optimized.sh` | Inicio automatizado | No | 3-5 min |
| `fix_backend_issues.sh` | Diagnóstico y fix | Sí | Variable |
| `validate_environment.sh` | Validación pre-inicio | No | 30s |
| `test_scripts.sh` | Test de scripts | No | 10s |
| `start-backend.bat` | Menu Windows | Sí | Variable |
| `Start-Backend.ps1` | PowerShell avanzado | Opcional | Variable |

---

## 🎓 Flujo de Aprendizaje Recomendado

### Nivel 1: Básico (1 día)
1. ✅ Lee [QUICK_START_BACKEND.md](QUICK_START_BACKEND.md)
2. ✅ Ejecuta `start-backend.bat` (Windows) o el script bash
3. ✅ Crea un superuser
4. ✅ Accede al admin

### Nivel 2: Intermedio (1 semana)
1. ✅ Aprende a usar `--skip-build` para desarrollo
2. ✅ Familiarízate con `fix_backend_issues.sh`
3. ✅ Lee [scripts/BACKEND_SCRIPTS_README.md](scripts/BACKEND_SCRIPTS_README.md)
4. ✅ Practica con diferentes opciones

### Nivel 3: Avanzado (1 mes)
1. ✅ Entiende cada paso del script principal
2. ✅ Lee [BACKEND_OPTIMIZATION_SUMMARY.md](BACKEND_OPTIMIZATION_SUMMARY.md)
3. ✅ Personaliza scripts según necesidades
4. ✅ Contribuye con mejoras

---

## 🔍 Casos de Uso Específicos

### Caso 1: Nuevo en el Proyecto
**Usuario:** Desarrollador que se une al equipo
**Objetivo:** Levantar el backend por primera vez
**Ruta:** [QUICK_START_BACKEND.md](QUICK_START_BACKEND.md) → `start-backend.bat`

---

### Caso 2: Desarrollo Diario
**Usuario:** Desarrollador regular
**Objetivo:** Iniciar backend rápidamente cada día
**Ruta:** `./scripts/start_backend_optimized.sh --skip-build`

---

### Caso 3: Debugging
**Usuario:** Desarrollador con problemas
**Objetivo:** Diagnosticar y resolver issues
**Ruta:** `./scripts/fix_backend_issues.sh` → Full system check

---

### Caso 4: Deploy/Production
**Usuario:** DevOps
**Objetivo:** Validar entorno antes de deploy
**Ruta:** [BACKEND_OPTIMIZATION_SUMMARY.md](BACKEND_OPTIMIZATION_SUMMARY.md) → `validate_environment.sh`

---

### Caso 5: Cambios Mayores
**Usuario:** Tech Lead
**Objetivo:** Reset completo después de cambios en DB
**Ruta:** `./scripts/start_backend_optimized.sh --fresh`

---

## 💡 Tips Profesionales

### Aliases Útiles (Bash/Zsh)
```bash
# Agregar a ~/.bashrc o ~/.zshrc
alias be-start='./scripts/start_backend_optimized.sh --skip-build'
alias be-fresh='./scripts/start_backend_optimized.sh --fresh'
alias be-fix='./scripts/fix_backend_issues.sh'
alias be-logs='docker-compose logs -f backend'
alias be-shell='docker-compose exec backend python manage.py shell'
```

### PowerShell Aliases
```powershell
# Agregar a $PROFILE
function Start-Backend { .\Start-Backend.ps1 -Action start }
function Start-BackendFast { .\Start-Backend.ps1 -Action skip-build }
function Fix-Backend { .\Start-Backend.ps1 -Action fix }
```

---

## 📞 Ayuda y Soporte

### Problemas con Scripts
1. Ejecuta: `./scripts/test_scripts.sh`
2. Revisa: Logs en `logs/`
3. Consulta: [scripts/BACKEND_SCRIPTS_README.md](scripts/BACKEND_SCRIPTS_README.md)

### Problemas con Backend
1. Ejecuta: `./scripts/validate_environment.sh`
2. Ejecuta: `./scripts/fix_backend_issues.sh`
3. Consulta: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Preguntas Generales
- Revisa: [BACKEND_OPTIMIZATION_SUMMARY.md](BACKEND_OPTIMIZATION_SUMMARY.md)
- Consulta: Documentación de Django, Docker, etc.

---

## 🗺️ Mapa Mental

```
BACKEND SCRIPTS
│
├── INICIO
│   ├── Windows → start-backend.bat / Start-Backend.ps1
│   └── Linux/Mac → start_backend_optimized.sh
│
├── PROBLEMAS
│   ├── Diagnóstico → fix_backend_issues.sh
│   └── Validación → validate_environment.sh
│
├── DESARROLLO
│   ├── Diario → --skip-build
│   ├── Limpio → --fresh
│   └── Testing → test_scripts.sh
│
└── DOCUMENTACIÓN
    ├── Quick Start → QUICK_START_BACKEND.md
    ├── Completa → BACKEND_SCRIPTS_README.md
    └── Resumen → BACKEND_OPTIMIZATION_SUMMARY.md
```

---

## ✅ Checklist de Uso

### Primera Vez
- [ ] Leí QUICK_START_BACKEND.md
- [ ] Ejecuté validate_environment.sh
- [ ] Corrí start_backend_optimized.sh
- [ ] Creé un superuser
- [ ] Verifiqué que todo funciona

### Desarrollo Regular
- [ ] Uso --skip-build para inicio rápido
- [ ] Conozco fix_backend_issues.sh
- [ ] Reviso logs cuando hay problemas
- [ ] Hago backups antes de --fresh

### Troubleshooting
- [ ] Ejecuto validación primero
- [ ] Uso diagnóstico interactivo
- [ ] Reviso logs generados
- [ ] Consulto documentación

---

## 📈 Estadísticas

**Archivos creados:** 9
**Scripts ejecutables:** 6
**Documentación:** 3
**Líneas de código:** ~3000+
**Funciones:** 50+
**Validaciones:** 20+

---

## 🎯 Próximos Pasos

Después de dominar estos scripts:

1. **Explora el código:** Entiende cómo funcionan los scripts
2. **Personaliza:** Adapta según tus necesidades
3. **Contribuye:** Sugiere mejoras
4. **Automatiza más:** Integra con CI/CD

---

**Última actualización:** 2026-01-06
**Versión:** 1.0.0
**Mantenedor:** Equipo de Desarrollo

---

**¡Happy Coding! 🚀**
