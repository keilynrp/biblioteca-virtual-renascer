# Script PowerShell para crear placeholders SVG para screenshots

# Colores del tema
$BG_COLOR = "#1a1a2e"
$TEXT_COLOR = "#ffffff"
$ACCENT_COLOR = "#16a34a"

# Función para crear SVG placeholder
function Create-Placeholder {
    param(
        [string]$Filename,
        [string]$Title,
        [int]$Width = 1200,
        [int]$Height = 800
    )

    $svgContent = @"
<svg width="$Width" height="$Height" xmlns="http://www.w3.org/2000/svg">
  <rect width="$Width" height="$Height" fill="$BG_COLOR"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="32" fill="$TEXT_COLOR" text-anchor="middle">
    📸 Screenshot Coming Soon
  </text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="24" fill="$ACCENT_COLOR" text-anchor="middle">
    $Title
  </text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="16" fill="$TEXT_COLOR" text-anchor="middle" opacity="0.7">
    Run the app locally to see this feature in action
  </text>
</svg>
"@

    $svgContent | Out-File -FilePath $Filename -Encoding UTF8
    Write-Host "Created: $Filename" -ForegroundColor Green
}

# Navegar al directorio de screenshots
Set-Location $PSScriptRoot\screenshots

# Crear directorios si no existen
$dirs = @('dashboard', 'library', 'reader', 'auth', 'subscriptions', 'profile', 'settings', 'mobile')
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

# Crear placeholders
Create-Placeholder "dashboard\dashboard-home-placeholder.png" "Dashboard Principal" 1920 1080
Create-Placeholder "library\library-catalog-placeholder.png" "Catálogo de Libros" 1920 1080
Create-Placeholder "reader\reader-pdf-annotations-placeholder.png" "Lector PDF con Anotaciones" 1920 1080
Create-Placeholder "profile\favorites-placeholder.png" "Favoritos y Historial" 1200 800
Create-Placeholder "subscriptions\plans-placeholder.png" "Planes de Suscripción" 1200 800
Create-Placeholder "settings\theme-customizer-placeholder.png" "Personalizador de Temas" 1200 800
Create-Placeholder "library\reading-clubs-placeholder.png" "Clubes de Lectura" 1200 800
Create-Placeholder "mobile\mobile-views-placeholder.png" "Vista Móvil" 375 812

Write-Host "`n✅ All placeholders created successfully!" -ForegroundColor Green
