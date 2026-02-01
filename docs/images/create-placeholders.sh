#!/bin/bash
# Script para crear placeholders SVG para screenshots

# Colores del tema
BG_COLOR="#1a1a2e"
TEXT_COLOR="#ffffff"
ACCENT_COLOR="#16a34a"

# Función para crear SVG placeholder
create_placeholder() {
    local filename=$1
    local title=$2
    local width=${3:-1200}
    local height=${4:-800}

    cat > "$filename" <<EOF
<svg width="$width" height="$height" xmlns="http://www.w3.org/2000/svg">
  <rect width="$width" height="$height" fill="$BG_COLOR"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="32" fill="$TEXT_COLOR" text-anchor="middle">
    📸 Screenshot Coming Soon
  </text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="24" fill="$ACCENT_COLOR" text-anchor="middle">
    $title
  </text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="16" fill="$TEXT_COLOR" text-anchor="middle" opacity="0.7">
    Run the app locally to see this feature in action
  </text>
</svg>
EOF
    echo "Created: $filename"
}

# Crear directorios si no existen
mkdir -p screenshots/{dashboard,library,reader,auth,subscriptions,profile,settings,mobile}

# Crear placeholders
create_placeholder "screenshots/dashboard/dashboard-home-placeholder.png" "Dashboard Principal" 1920 1080
create_placeholder "screenshots/library/library-catalog-placeholder.png" "Catálogo de Libros" 1920 1080
create_placeholder "screenshots/reader/reader-pdf-annotations-placeholder.png" "Lector PDF con Anotaciones" 1920 1080
create_placeholder "screenshots/profile/favorites-placeholder.png" "Favoritos y Historial" 1200 800
create_placeholder "screenshots/subscriptions/plans-placeholder.png" "Planes de Suscripción" 1200 800
create_placeholder "screenshots/settings/theme-customizer-placeholder.png" "Personalizador de Temas" 1200 800
create_placeholder "screenshots/library/reading-clubs-placeholder.png" "Clubes de Lectura" 1200 800
create_placeholder "screenshots/mobile/mobile-views-placeholder.png" "Vista Móvil" 375 812

echo "✅ All placeholders created successfully!"
