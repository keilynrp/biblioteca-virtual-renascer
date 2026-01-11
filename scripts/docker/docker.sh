#!/bin/bash
#
# Script maestro para Docker Compose V2
# Punto de entrada único para todos los comandos Docker del proyecto
#
# Uso: ./docker.sh <comando> [opciones]
#

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════╗"
    echo "║   BVS Framework - Docker Manager      ║"
    echo "║   Docker Compose V2                   ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar Docker Compose V2
check_docker() {
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}✗ Error: Docker Compose V2 no está instalado${NC}"
        echo ""
        echo "Instala Docker Desktop desde:"
        echo "https://www.docker.com/products/docker-desktop/"
        exit 1
    fi
}

# Menú principal
case "$1" in
    # Comandos de inicio rápido
    start|up)
        check_docker
        ./start_containers.sh "${@:2}"
        ;;

    stop|down)
        check_docker
        ./docker_quick.sh stop
        ;;

    restart)
        check_docker
        ./docker_quick.sh restart "${@:2}"
        ;;

    # Comandos de construcción
    build)
        check_docker
        ./docker_quick.sh build "${@:2}"
        ;;

    rebuild)
        check_docker
        ./docker_quick.sh rebuild "${@:2}"
        ;;

    # Comandos de logs y monitoreo
    logs)
        check_docker
        ./docker_quick.sh logs "${@:2}"
        ;;

    status|ps)
        check_docker
        ./docker_quick.sh status
        ;;

    watch)
        check_docker
        ./docker_dev.sh watch
        ;;

    # Comandos de acceso
    shell|bash)
        check_docker
        ./docker_quick.sh shell "${@:2}"
        ;;

    exec)
        check_docker
        ./docker_quick.sh exec "${@:2}"
        ;;

    # Comandos Django
    migrate)
        check_docker
        ./docker_quick.sh migrate
        ;;

    makemigrations)
        check_docker
        ./docker_quick.sh makemigrations
        ;;

    superuser)
        check_docker
        ./docker_quick.sh superuser
        ;;

    test)
        check_docker
        ./docker_quick.sh test "${@:2}"
        ;;

    # Comandos de desarrollo
    dev)
        check_docker
        shift
        ./docker_dev.sh "$@"
        ;;

    # Comandos de base de datos
    backup-db)
        check_docker
        ./docker_dev.sh backup-db
        ;;

    restore-db)
        check_docker
        ./docker_dev.sh restore-db "$2"
        ;;

    reset-db)
        check_docker
        ./docker_dev.sh reset-db
        ;;

    # Comandos de mantenimiento
    clean)
        check_docker
        ./docker_quick.sh clean
        ;;

    fix-apt)
        check_docker
        ./docker_quick.sh fix-apt
        ;;

    # Información
    version)
        check_docker
        ./docker_quick.sh version
        ;;

    config)
        check_docker
        ./docker_quick.sh config
        ;;

    # Ayuda y menú
    help|--help|-h)
        show_banner
        echo -e "${YELLOW}Script maestro para gestionar Docker Compose V2${NC}"
        echo ""
        echo "Uso: $0 <comando> [opciones]"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${MAGENTA}🚀 Comandos Principales:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  start, up              - Levantar todos los servicios"
        echo "  stop, down             - Detener todos los servicios"
        echo "  restart [servicio]     - Reiniciar servicios"
        echo "  rebuild [servicio]     - Reconstruir y reiniciar servicio"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${MAGENTA}📊 Monitoreo y Logs:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  logs [servicio]        - Ver logs (tiempo real)"
        echo "  status, ps             - Ver estado de contenedores"
        echo "  watch                  - Modo desarrollo (logs en vivo)"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${MAGENTA}🔧 Acceso a Contenedores:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  shell [servicio]       - Abrir shell (default: backend)"
        echo "  exec <srv> <cmd>       - Ejecutar comando"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${MAGENTA}🗃️  Django y Base de Datos:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  migrate                - Ejecutar migraciones"
        echo "  makemigrations         - Crear migraciones"
        echo "  superuser              - Crear superusuario"
        echo "  test                   - Ejecutar tests"
        echo "  backup-db              - Backup de base de datos"
        echo "  restore-db <archivo>   - Restaurar backup"
        echo "  reset-db               - Reiniciar base de datos"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${MAGENTA}🛠️  Desarrollo y Mantenimiento:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  dev <comando>          - Comandos de desarrollo"
        echo "  build [servicio]       - Construir imagen"
        echo "  clean                  - Limpiar todo (⚠️ elimina datos)"
        echo "  fix-apt                - Fix de apt_pkg en backend"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${MAGENTA}ℹ️  Información:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  version                - Ver versiones de Docker"
        echo "  config                 - Ver configuración"
        echo "  help                   - Mostrar esta ayuda"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${YELLOW}Ejemplos de uso:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  $0 start               # Levantar todo el proyecto"
        echo "  $0 logs backend        # Ver logs del backend"
        echo "  $0 shell               # Abrir shell en backend"
        echo "  $0 migrate             # Ejecutar migraciones"
        echo "  $0 dev watch           # Modo desarrollo"
        echo "  $0 backup-db           # Crear backup"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${YELLOW}Para ayuda detallada de cada módulo:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo "  ./docker_quick.sh help     # Comandos rápidos"
        echo "  ./docker_dev.sh help       # Comandos de desarrollo"
        echo "  ./start_containers.sh -h   # Opciones de inicio"
        echo ""
        ;;

    menu)
        show_banner
        PS3="Selecciona una opción: "
        options=(
            "Levantar servicios"
            "Detener servicios"
            "Ver logs (backend)"
            "Ver estado"
            "Shell en backend"
            "Ejecutar migraciones"
            "Crear superusuario"
            "Backup base de datos"
            "Limpiar todo"
            "Salir"
        )
        select opt in "${options[@]}"
        do
            case $opt in
                "Levantar servicios")
                    ./start_containers.sh
                    break
                    ;;
                "Detener servicios")
                    ./docker_quick.sh stop
                    break
                    ;;
                "Ver logs (backend)")
                    ./docker_quick.sh logs backend
                    break
                    ;;
                "Ver estado")
                    ./docker_quick.sh status
                    break
                    ;;
                "Shell en backend")
                    ./docker_quick.sh shell
                    break
                    ;;
                "Ejecutar migraciones")
                    ./docker_quick.sh migrate
                    break
                    ;;
                "Crear superusuario")
                    ./docker_quick.sh superuser
                    break
                    ;;
                "Backup base de datos")
                    ./docker_dev.sh backup-db
                    break
                    ;;
                "Limpiar todo")
                    ./docker_quick.sh clean
                    break
                    ;;
                "Salir")
                    break
                    ;;
                *) echo "Opción inválida $REPLY";;
            esac
        done
        ;;

    *)
        show_banner
        echo -e "${RED}Comando desconocido: ${1:-ninguno}${NC}"
        echo ""
        echo "Ejecuta '$0 help' para ver todos los comandos disponibles"
        echo "O ejecuta '$0 menu' para un menú interactivo"
        exit 1
        ;;
esac
