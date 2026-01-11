#!/bin/bash
#
# Comandos rápidos para Docker Compose
# Compatible con docker-compose v1 (con guión)
#

# Detectar comando de Docker Compose
DOCKER_COMPOSE="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        echo "Error: docker-compose no está instalado"
        exit 1
    fi
fi

case "$1" in
    start|up)
        echo "Levantando todos los servicios..."
        $DOCKER_COMPOSE up -d
        echo "✓ Servicios iniciados"
        $DOCKER_COMPOSE ps
        ;;

    stop|down)
        echo "Deteniendo todos los servicios..."
        $DOCKER_COMPOSE down
        echo "✓ Servicios detenidos"
        ;;

    restart)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            echo "Reiniciando todos los servicios..."
            $DOCKER_COMPOSE restart
        else
            echo "Reiniciando $SERVICE..."
            $DOCKER_COMPOSE restart "$SERVICE"
        fi
        echo "✓ Reinicio completado"
        ;;

    rebuild)
        SERVICE="${2:-backend}"
        echo "Reconstruyendo $SERVICE..."
        $DOCKER_COMPOSE build --no-cache "$SERVICE"
        $DOCKER_COMPOSE up -d "$SERVICE"
        echo "✓ $SERVICE reconstruido y reiniciado"
        ;;

    logs)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            $DOCKER_COMPOSE logs -f
        else
            $DOCKER_COMPOSE logs -f "$SERVICE"
        fi
        ;;

    shell|bash)
        SERVICE="${2:-backend}"
        echo "Abriendo shell en $SERVICE..."
        $DOCKER_COMPOSE exec "$SERVICE" bash
        ;;

    migrate)
        echo "Ejecutando migraciones de Django..."
        $DOCKER_COMPOSE exec backend python manage.py migrate
        ;;

    makemigrations)
        echo "Creando migraciones de Django..."
        $DOCKER_COMPOSE exec backend python manage.py makemigrations
        ;;

    superuser)
        echo "Creando superusuario de Django..."
        $DOCKER_COMPOSE exec backend python manage.py createsuperuser
        ;;

    test)
        echo "Ejecutando tests del backend..."
        $DOCKER_COMPOSE exec backend pytest
        ;;

    clean)
        echo "⚠ ADVERTENCIA: Esto eliminará todos los contenedores y volúmenes"
        read -p "¿Continuar? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $DOCKER_COMPOSE down -v
            docker system prune -f
            echo "✓ Limpieza completada"
        fi
        ;;

    status|ps)
        $DOCKER_COMPOSE ps
        echo ""
        echo "Uso de recursos:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        ;;

    fix-apt)
        echo "Aplicando fix de apt_pkg al backend..."
        $DOCKER_COMPOSE exec backend bash -c "
            rm -f /etc/apt/apt.conf.d/50command-not-found
            echo 'APT::Update::Post-Invoke-Success \"\";' > /etc/apt/apt.conf.d/99no-command-not-found
            apt-get update
            echo '✓ Fix aplicado'
        "
        ;;

    *)
        echo "Comandos rápidos para Docker Compose"
        echo ""
        echo "Usando: $DOCKER_COMPOSE"
        echo ""
        echo "Uso: $0 <comando> [servicio]"
        echo ""
        echo "Comandos disponibles:"
        echo "  start, up          - Levantar todos los servicios"
        echo "  stop, down         - Detener todos los servicios"
        echo "  restart [servicio] - Reiniciar servicios (todos o uno específico)"
        echo "  rebuild [servicio] - Reconstruir imagen (default: backend)"
        echo "  logs [servicio]    - Ver logs (todos o uno específico)"
        echo "  shell [servicio]   - Abrir shell (default: backend)"
        echo "  migrate            - Ejecutar migraciones de Django"
        echo "  makemigrations     - Crear migraciones de Django"
        echo "  superuser          - Crear superusuario de Django"
        echo "  test               - Ejecutar tests del backend"
        echo "  clean              - Limpiar contenedores y volúmenes"
        echo "  status, ps         - Ver estado de contenedores"
        echo "  fix-apt            - Aplicar fix de apt_pkg al backend"
        echo ""
        echo "Ejemplos:"
        echo "  $0 start"
        echo "  $0 logs backend"
        echo "  $0 restart frontend"
        echo "  $0 shell backend"
        echo ""
        exit 1
        ;;
esac
