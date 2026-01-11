#!/bin/bash
#
# Script de desarrollo para Docker Compose V2
# Comandos útiles durante el desarrollo
#
# Uso: ./docker_dev.sh <comando>
#

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

case "$1" in
    watch|dev)
        echo -e "${CYAN}Modo desarrollo: logs en tiempo real${NC}"
        echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
        echo ""
        docker compose logs -f backend frontend
        ;;

    reset-db)
        echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos${NC}"
        echo ""
        read -p "¿Estás seguro? Escribe 'si' para confirmar: " -r
        echo
        if [[ "$REPLY" == "si" ]]; then
            echo -e "${BLUE}Deteniendo servicios...${NC}"
            docker compose down

            echo -e "${BLUE}Eliminando volumen de PostgreSQL...${NC}"
            docker volume rm bvs_framework_postgres_data 2>/dev/null || true

            echo -e "${BLUE}Levantando servicios...${NC}"
            docker compose up -d db redis meilisearch
            sleep 10

            echo -e "${BLUE}Ejecutando migraciones...${NC}"
            docker compose up -d backend
            sleep 5
            docker compose exec backend python manage.py migrate

            echo -e "${GREEN}✓ Base de datos reiniciada${NC}"
            echo ""
            echo "Para crear un superusuario ejecuta:"
            echo "  ./docker_quick.sh superuser"
        else
            echo -e "${YELLOW}Operación cancelada${NC}"
        fi
        ;;

    fresh-install)
        echo -e "${CYAN}Instalación limpia del proyecto${NC}"
        echo -e "${RED}⚠️  Esto eliminará TODOS los datos y volúmenes${NC}"
        echo ""
        read -p "¿Continuar? Escribe 'si' para confirmar: " -r
        echo
        if [[ "$REPLY" == "si" ]]; then
            echo -e "${BLUE}[1/6] Deteniendo contenedores...${NC}"
            docker compose down -v

            echo -e "${BLUE}[2/6] Limpiando imágenes antiguas...${NC}"
            docker system prune -f

            echo -e "${BLUE}[3/6] Construyendo imágenes...${NC}"
            docker compose build --no-cache

            echo -e "${BLUE}[4/6] Levantando servicios...${NC}"
            docker compose up -d

            echo -e "${BLUE}[5/6] Esperando a que los servicios estén listos...${NC}"
            sleep 20

            echo -e "${BLUE}[6/6] Ejecutando migraciones...${NC}"
            docker compose exec backend python manage.py migrate

            echo -e "${GREEN}✓ Instalación limpia completada${NC}"
            echo ""
            echo "Siguiente paso: Crear superusuario"
            echo "  ./docker_quick.sh superuser"
        else
            echo -e "${YELLOW}Operación cancelada${NC}"
        fi
        ;;

    backup-db)
        BACKUP_DIR="./backups"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

        echo -e "${BLUE}Creando backup de la base de datos...${NC}"
        mkdir -p "$BACKUP_DIR"

        docker compose exec -T db pg_dump -U postgres biblioteca > "$BACKUP_FILE"

        if [ -f "$BACKUP_FILE" ]; then
            echo -e "${GREEN}✓ Backup creado: $BACKUP_FILE${NC}"
            ls -lh "$BACKUP_FILE"
        else
            echo -e "${RED}✗ Error al crear backup${NC}"
            exit 1
        fi
        ;;

    restore-db)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Especifica el archivo de backup${NC}"
            echo "Uso: $0 restore-db <archivo.sql>"
            echo ""
            echo "Backups disponibles:"
            ls -lh ./backups/*.sql 2>/dev/null || echo "  (ninguno)"
            exit 1
        fi

        BACKUP_FILE="$2"
        if [ ! -f "$BACKUP_FILE" ]; then
            echo -e "${RED}Error: Archivo no encontrado: $BACKUP_FILE${NC}"
            exit 1
        fi

        echo -e "${YELLOW}⚠️  Esto sobrescribirá la base de datos actual${NC}"
        read -p "¿Continuar? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Restaurando base de datos...${NC}"
            docker compose exec -T db psql -U postgres biblioteca < "$BACKUP_FILE"
            echo -e "${GREEN}✓ Base de datos restaurada${NC}"
        else
            echo -e "${YELLOW}Operación cancelada${NC}"
        fi
        ;;

    install-deps)
        echo -e "${BLUE}Instalando dependencias del backend...${NC}"
        docker compose exec backend pip install -r requirements.txt
        echo -e "${GREEN}✓ Dependencias del backend instaladas${NC}"

        echo ""
        echo -e "${BLUE}Instalando dependencias del frontend...${NC}"
        docker compose exec frontend npm install
        echo -e "${GREEN}✓ Dependencias del frontend instaladas${NC}"
        ;;

    update-deps)
        echo -e "${BLUE}Actualizando dependencias del backend...${NC}"
        docker compose exec backend pip install --upgrade -r requirements.txt

        echo ""
        echo -e "${BLUE}Actualizando dependencias del frontend...${NC}"
        docker compose exec frontend npm update

        echo -e "${GREEN}✓ Dependencias actualizadas${NC}"
        ;;

    fixtures-load)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Especifica el archivo de fixtures${NC}"
            echo "Uso: $0 fixtures-load <archivo.json>"
            exit 1
        fi

        FIXTURE_FILE="$2"
        echo -e "${BLUE}Cargando fixtures: $FIXTURE_FILE${NC}"
        docker compose exec backend python manage.py loaddata "$FIXTURE_FILE"
        echo -e "${GREEN}✓ Fixtures cargados${NC}"
        ;;

    fixtures-dump)
        APP="${2:-}"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        FIXTURE_FILE="./fixtures/dump_${APP}_${TIMESTAMP}.json"

        mkdir -p ./fixtures

        if [ -z "$APP" ]; then
            echo -e "${BLUE}Exportando todos los datos...${NC}"
            docker compose exec backend python manage.py dumpdata --indent 2 > "$FIXTURE_FILE"
        else
            echo -e "${BLUE}Exportando datos de: $APP${NC}"
            docker compose exec backend python manage.py dumpdata "$APP" --indent 2 > "$FIXTURE_FILE"
        fi

        echo -e "${GREEN}✓ Fixtures exportados: $FIXTURE_FILE${NC}"
        ;;

    clear-cache)
        echo -e "${BLUE}Limpiando caché de Redis...${NC}"
        docker compose exec redis redis-cli FLUSHALL
        echo -e "${GREEN}✓ Caché de Redis limpiado${NC}"

        echo ""
        echo -e "${BLUE}Limpiando caché de Django...${NC}"
        docker compose exec backend python manage.py clear_cache
        echo -e "${GREEN}✓ Caché de Django limpiado${NC}"
        ;;

    check)
        echo -e "${CYAN}Verificando configuración de Django...${NC}"
        docker compose exec backend python manage.py check --deploy

        echo ""
        echo -e "${CYAN}Verificando migraciones pendientes...${NC}"
        docker compose exec backend python manage.py showmigrations
        ;;

    index)
        echo -e "${BLUE}Reindexando búsqueda en Meilisearch...${NC}"
        docker compose exec backend python manage.py index_books
        echo -e "${GREEN}✓ Reindexación completada${NC}"
        ;;

    stats)
        echo -e "${CYAN}Estadísticas del proyecto:${NC}"
        echo ""

        echo -e "${YELLOW}Usuarios registrados:${NC}"
        docker compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.count())"

        echo ""
        echo -e "${YELLOW}Libros en la base de datos:${NC}"
        docker compose exec backend python manage.py shell -c "from apps.content.models import Book; print(Book.objects.count())"

        echo ""
        echo -e "${YELLOW}Tamaño de la base de datos:${NC}"
        docker compose exec db psql -U postgres -d biblioteca -c "SELECT pg_size_pretty(pg_database_size('biblioteca'));"
        ;;

    help|--help|-h|*)
        echo -e "${CYAN}==========================================${NC}"
        echo -e "${CYAN}  Docker Development - Comandos de Desarrollo${NC}"
        echo -e "${CYAN}==========================================${NC}"
        echo ""
        echo "Uso: $0 <comando> [opciones]"
        echo ""
        echo -e "${YELLOW}🔄 Desarrollo:${NC}"
        echo "  watch, dev             - Ver logs en tiempo real (backend + frontend)"
        echo "  install-deps           - Instalar dependencias (backend + frontend)"
        echo "  update-deps            - Actualizar dependencias"
        echo "  check                  - Verificar configuración de Django"
        echo ""
        echo -e "${YELLOW}🗃️  Base de Datos:${NC}"
        echo "  reset-db               - Reiniciar base de datos (⚠️ elimina datos)"
        echo "  backup-db              - Crear backup de la base de datos"
        echo "  restore-db <archivo>   - Restaurar backup de base de datos"
        echo ""
        echo -e "${YELLOW}📦 Fixtures:${NC}"
        echo "  fixtures-load <file>   - Cargar fixtures desde archivo"
        echo "  fixtures-dump [app]    - Exportar datos a fixtures"
        echo ""
        echo -e "${YELLOW}🧹 Limpieza:${NC}"
        echo "  fresh-install          - Instalación limpia del proyecto"
        echo "  clear-cache            - Limpiar caché (Redis + Django)"
        echo ""
        echo -e "${YELLOW}🔍 Búsqueda:${NC}"
        echo "  index                  - Reindexar Meilisearch"
        echo ""
        echo -e "${YELLOW}📊 Estadísticas:${NC}"
        echo "  stats                  - Ver estadísticas del proyecto"
        echo ""
        echo -e "${YELLOW}Ejemplos:${NC}"
        echo "  $0 watch               # Ver logs en tiempo real"
        echo "  $0 backup-db           # Crear backup"
        echo "  $0 reset-db            # Reiniciar base de datos"
        echo "  $0 fixtures-dump content  # Exportar app content"
        echo ""
        echo -e "${CYAN}==========================================${NC}"

        if [ "$1" != "help" ] && [ "$1" != "--help" ] && [ "$1" != "-h" ]; then
            echo -e "${RED}Comando desconocido: $1${NC}"
            exit 1
        fi
        ;;
esac
