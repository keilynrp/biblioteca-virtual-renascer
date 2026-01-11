#!/bin/bash
#
# Comandos rápidos para Docker Compose V2
# Proporciona atajos para operaciones comunes
#
# Uso: ./docker_quick.sh <comando> [opciones]
#

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Verificar que docker compose esté disponible
if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Error: Docker Compose V2 no está instalado${NC}"
    exit 1
fi

case "$1" in
    start|up)
        echo -e "${BLUE}Levantando todos los servicios...${NC}"
        docker compose up -d
        echo -e "${GREEN}✓ Servicios iniciados${NC}"
        echo ""
        docker compose ps
        ;;

    stop|down)
        echo -e "${BLUE}Deteniendo todos los servicios...${NC}"
        docker compose down
        echo -e "${GREEN}✓ Servicios detenidos${NC}"
        ;;

    restart)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            echo -e "${BLUE}Reiniciando todos los servicios...${NC}"
            docker compose restart
        else
            echo -e "${BLUE}Reiniciando $SERVICE...${NC}"
            docker compose restart "$SERVICE"
        fi
        echo -e "${GREEN}✓ Reinicio completado${NC}"
        docker compose ps
        ;;

    rebuild)
        SERVICE="${2:-backend}"
        echo -e "${BLUE}Reconstruyendo $SERVICE...${NC}"
        docker compose build --no-cache "$SERVICE"
        docker compose up -d "$SERVICE"
        echo -e "${GREEN}✓ $SERVICE reconstruido y reiniciado${NC}"
        ;;

    logs)
        SERVICE="${2:-}"
        LINES="${3:-50}"
        if [ -z "$SERVICE" ]; then
            echo -e "${CYAN}Mostrando logs de todos los servicios (Ctrl+C para salir)...${NC}"
            docker compose logs -f --tail="$LINES"
        else
            echo -e "${CYAN}Mostrando logs de $SERVICE (Ctrl+C para salir)...${NC}"
            docker compose logs -f --tail="$LINES" "$SERVICE"
        fi
        ;;

    shell|bash|sh)
        SERVICE="${2:-backend}"
        echo -e "${BLUE}Abriendo shell en $SERVICE...${NC}"
        docker compose exec "$SERVICE" bash
        ;;

    migrate)
        echo -e "${BLUE}Ejecutando migraciones de Django...${NC}"
        docker compose exec backend python manage.py migrate
        echo -e "${GREEN}✓ Migraciones completadas${NC}"
        ;;

    makemigrations)
        echo -e "${BLUE}Creando migraciones de Django...${NC}"
        docker compose exec backend python manage.py makemigrations
        echo -e "${GREEN}✓ Migraciones creadas${NC}"
        ;;

    superuser|createsuperuser)
        echo -e "${BLUE}Creando superusuario de Django...${NC}"
        docker compose exec backend python manage.py createsuperuser
        ;;

    collectstatic)
        echo -e "${BLUE}Recolectando archivos estáticos...${NC}"
        docker compose exec backend python manage.py collectstatic --noinput
        echo -e "${GREEN}✓ Archivos estáticos recolectados${NC}"
        ;;

    test|pytest)
        echo -e "${BLUE}Ejecutando tests del backend...${NC}"
        docker compose exec backend pytest "$2"
        ;;

    shell-plus|dbshell)
        if [ "$1" = "shell-plus" ]; then
            echo -e "${BLUE}Abriendo Django shell_plus...${NC}"
            docker compose exec backend python manage.py shell_plus
        else
            echo -e "${BLUE}Abriendo Django dbshell...${NC}"
            docker compose exec backend python manage.py dbshell
        fi
        ;;

    clean)
        echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará todos los contenedores y volúmenes${NC}"
        echo -e "${YELLOW}Se perderán TODOS los datos de la base de datos${NC}"
        echo ""
        read -p "¿Continuar? Escribe 'si' para confirmar: " -r
        echo
        if [[ "$REPLY" == "si" ]]; then
            docker compose down -v
            docker system prune -f
            echo -e "${GREEN}✓ Limpieza completada${NC}"
        else
            echo -e "${YELLOW}Operación cancelada${NC}"
        fi
        ;;

    status|ps)
        echo -e "${CYAN}Estado de los contenedores:${NC}"
        docker compose ps
        echo ""
        echo -e "${CYAN}Uso de recursos:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        ;;

    fix-apt)
        echo -e "${BLUE}Aplicando fix de apt_pkg al backend...${NC}"
        docker compose exec backend bash -c "
            rm -f /etc/apt/apt.conf.d/50command-not-found
            echo 'APT::Update::Post-Invoke-Success \"\";' > /etc/apt/apt.conf.d/99no-command-not-found
            rm -f /var/lib/command-not-found/commands.db
            apt-get clean
            rm -rf /var/lib/apt/lists/*
            DEBIAN_FRONTEND=noninteractive apt-get update
            DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends python3-apt
            echo '✓ Fix aplicado correctamente'
        "
        echo -e "${GREEN}✓ Fix de apt_pkg completado${NC}"
        ;;

    build)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            echo -e "${BLUE}Construyendo todas las imágenes...${NC}"
            docker compose build
        else
            echo -e "${BLUE}Construyendo imagen de $SERVICE...${NC}"
            docker compose build "$SERVICE"
        fi
        echo -e "${GREEN}✓ Construcción completada${NC}"
        ;;

    pull)
        echo -e "${BLUE}Descargando imágenes actualizadas...${NC}"
        docker compose pull
        echo -e "${GREEN}✓ Imágenes actualizadas${NC}"
        ;;

    exec)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Especifica el servicio${NC}"
            echo "Uso: $0 exec <servicio> <comando>"
            exit 1
        fi
        SERVICE="$2"
        shift 2
        COMMAND="$@"
        echo -e "${BLUE}Ejecutando en $SERVICE: $COMMAND${NC}"
        docker compose exec "$SERVICE" $COMMAND
        ;;

    top)
        echo -e "${CYAN}Procesos en ejecución:${NC}"
        docker compose top
        ;;

    config)
        echo -e "${CYAN}Configuración de docker-compose.yml:${NC}"
        docker compose config
        ;;

    images)
        echo -e "${CYAN}Imágenes Docker del proyecto:${NC}"
        docker compose images
        ;;

    version)
        echo -e "${CYAN}Versiones instaladas:${NC}"
        echo ""
        docker --version
        docker compose version
        ;;

    help|--help|-h|*)
        echo -e "${CYAN}==========================================${NC}"
        echo -e "${CYAN}  Docker Compose V2 - Comandos Rápidos${NC}"
        echo -e "${CYAN}==========================================${NC}"
        echo ""
        echo "Uso: $0 <comando> [opciones]"
        echo ""
        echo -e "${YELLOW}📦 Gestión de Servicios:${NC}"
        echo "  start, up              - Levantar todos los servicios"
        echo "  stop, down             - Detener todos los servicios"
        echo "  restart [servicio]     - Reiniciar servicios (todos o uno específico)"
        echo "  rebuild [servicio]     - Reconstruir imagen (default: backend)"
        echo "  build [servicio]       - Construir imagen sin iniciar"
        echo "  pull                   - Descargar imágenes actualizadas"
        echo ""
        echo -e "${YELLOW}📊 Monitoreo:${NC}"
        echo "  logs [servicio] [num]  - Ver logs (default: 50 últimas líneas)"
        echo "  status, ps             - Ver estado de contenedores"
        echo "  top                    - Ver procesos en ejecución"
        echo "  images                 - Ver imágenes del proyecto"
        echo ""
        echo -e "${YELLOW}🔧 Acceso a Contenedores:${NC}"
        echo "  shell [servicio]       - Abrir shell (default: backend)"
        echo "  exec <servicio> <cmd>  - Ejecutar comando en servicio"
        echo ""
        echo -e "${YELLOW}🗃️  Django/Backend:${NC}"
        echo "  migrate                - Ejecutar migraciones de Django"
        echo "  makemigrations         - Crear migraciones de Django"
        echo "  superuser              - Crear superusuario de Django"
        echo "  collectstatic          - Recolectar archivos estáticos"
        echo "  shell-plus             - Django shell_plus"
        echo "  dbshell                - Shell de base de datos"
        echo "  test [archivo]         - Ejecutar tests del backend"
        echo ""
        echo -e "${YELLOW}🛠️  Mantenimiento:${NC}"
        echo "  clean                  - Limpiar contenedores y volúmenes (⚠️ elimina datos)"
        echo "  fix-apt                - Aplicar fix de apt_pkg al backend"
        echo "  config                 - Ver configuración de docker-compose.yml"
        echo "  version                - Ver versiones de Docker"
        echo ""
        echo -e "${YELLOW}Ejemplos:${NC}"
        echo "  $0 start               # Levantar todo"
        echo "  $0 logs backend        # Ver logs del backend"
        echo "  $0 logs backend 100    # Ver últimas 100 líneas del backend"
        echo "  $0 restart frontend    # Reiniciar frontend"
        echo "  $0 shell backend       # Abrir shell en backend"
        echo "  $0 migrate             # Ejecutar migraciones"
        echo "  $0 test                # Ejecutar todos los tests"
        echo "  $0 exec backend env    # Ver variables de entorno del backend"
        echo ""
        echo -e "${CYAN}==========================================${NC}"

        if [ "$1" != "help" ] && [ "$1" != "--help" ] && [ "$1" != "-h" ]; then
            echo -e "${RED}Comando desconocido: $1${NC}"
            exit 1
        fi
        ;;
esac
