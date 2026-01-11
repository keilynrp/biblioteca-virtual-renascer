#!/bin/bash
#
# Comandos rápidos para Docker Compose
# Proporciona atajos para operaciones comunes
#

case "$1" in
    start|up)
        echo "Levantando todos los servicios..."
        docker-compose up -d
        echo "✓ Servicios iniciados"
        docker-compose ps
        ;;

    stop|down)
        echo "Deteniendo todos los servicios..."
        docker-compose down
        echo "✓ Servicios detenidos"
        ;;

    restart)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            echo "Reiniciando todos los servicios..."
            docker-compose restart
        else
            echo "Reiniciando $SERVICE..."
            docker-compose restart "$SERVICE"
        fi
        echo "✓ Reinicio completado"
        ;;

    rebuild)
        SERVICE="${2:-backend}"
        echo "Reconstruyendo $SERVICE..."
        docker-compose build --no-cache "$SERVICE"
        docker-compose up -d "$SERVICE"
        echo "✓ $SERVICE reconstruido y reiniciado"
        ;;

    logs)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$SERVICE"
        fi
        ;;

    shell|bash)
        SERVICE="${2:-backend}"
        echo "Abriendo shell en $SERVICE..."
        docker-compose exec "$SERVICE" bash
        ;;

    migrate)
        echo "Ejecutando migraciones de Django..."
        docker-compose exec backend python manage.py migrate
        ;;

    makemigrations)
        echo "Creando migraciones de Django..."
        docker-compose exec backend python manage.py makemigrations
        ;;

    superuser)
        echo "Creando superusuario de Django..."
        docker-compose exec backend python manage.py createsuperuser
        ;;

    test)
        echo "Ejecutando tests del backend..."
        docker-compose exec backend pytest
        ;;

    clean)
        echo "⚠ ADVERTENCIA: Esto eliminará todos los contenedores y volúmenes"
        read -p "¿Continuar? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker system prune -f
            echo "✓ Limpieza completada"
        fi
        ;;

    status|ps)
        docker-compose ps
        echo ""
        echo "Uso de recursos:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        ;;

    fix-apt)
        echo "Aplicando fix de apt_pkg al backend..."
        docker-compose exec backend bash -c "
            rm -f /etc/apt/apt.conf.d/50command-not-found
            echo 'APT::Update::Post-Invoke-Success \"\";' > /etc/apt/apt.conf.d/99no-command-not-found
            apt-get update
            echo '✓ Fix aplicado'
        "
        ;;

    *)
        echo "Comandos rápidos para Docker Compose"
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
