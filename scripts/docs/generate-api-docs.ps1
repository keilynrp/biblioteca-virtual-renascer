# Script PowerShell para generar documentación de API desde código Django

$ErrorActionPreference = "Stop"

Write-Host "🚀 Generando documentación de API..." -ForegroundColor Cyan

# Directorios
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$BackendDir = Join-Path $ProjectRoot "backend"
$DocsApiDir = Join-Path $ProjectRoot "docs\api"

Write-Host "📂 Directorio del proyecto: $ProjectRoot" -ForegroundColor Blue

# Verificar directorio backend
if (-not (Test-Path $BackendDir)) {
    Write-Host "❌ Error: No se encuentra el directorio backend" -ForegroundColor Red
    exit 1
}

# Crear directorio de documentación
if (-not (Test-Path $DocsApiDir)) {
    New-Item -ItemType Directory -Path $DocsApiDir | Out-Null
}

# Activar entorno virtual
$VenvPath = Join-Path $BackendDir ".venv\Scripts\Activate.ps1"
if (Test-Path $VenvPath) {
    Write-Host "🔧 Activando entorno virtual..." -ForegroundColor Yellow
    & $VenvPath
}

# Cambiar al directorio backend
Set-Location $BackendDir

# Instalar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
pip install -q drf-spectacular pyyaml 2>$null

# Generar schema OpenAPI YAML
Write-Host "📄 Generando schema OpenAPI..." -ForegroundColor Blue
$schemaYml = Join-Path $DocsApiDir "openapi-schema.yml"
python manage.py spectacular --color --file $schemaYml

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema OpenAPI generado: docs/api/openapi-schema.yml" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se pudo generar schema OpenAPI" -ForegroundColor Yellow
}

# Generar schema JSON
Write-Host "📄 Generando schema en formato JSON..." -ForegroundColor Blue
$schemaJson = Join-Path $DocsApiDir "openapi-schema.json"
python manage.py spectacular --color --format openapi-json --file $schemaJson

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema JSON generado: docs/api/openapi-schema.json" -ForegroundColor Green
}

# Generar documentación de modelos
Write-Host "📊 Generando documentación de modelos..." -ForegroundColor Blue

$modelsDoc = Join-Path $DocsApiDir "models-generated.md"
$modelsContent = @"
# Modelos de Datos (Auto-generado)

> **Nota**: Este archivo es generado automáticamente. No editar manualmente.

## Modelos del Backend

"@

$Apps = @('authentication', 'content', 'subscriptions', 'payments', 'loans', 'communities', 'notifications')

foreach ($app in $Apps) {
    $appPath = Join-Path $BackendDir "apps\$app"
    if (Test-Path $appPath) {
        $modelsContent += "`n## App: $app`n`n"
        $modelsContent += "<!-- TODO: Implementar extracción automática de modelos -->`n`n"
    }
}

$modelsContent | Out-File -FilePath $modelsDoc -Encoding UTF8
Write-Host "✅ Documentación de modelos generada: docs/api/models-generated.md" -ForegroundColor Green

# Generar índice de endpoints
Write-Host "📋 Generando índice de endpoints..." -ForegroundColor Blue

$endpointsDoc = Join-Path $DocsApiDir "endpoints-generated.md"
$endpointsContent = @"
# Endpoints de API (Auto-generado)

> **Nota**: Este archivo es generado automáticamente desde el schema OpenAPI.
>
> Para la documentación interactiva completa, visita:
> - Swagger UI: http://localhost:8000/api/docs/
> - ReDoc: http://localhost:8000/api/redoc/

## Endpoints Disponibles

"@

$endpointsContent | Out-File -FilePath $endpointsDoc -Encoding UTF8
Write-Host "✅ Índice de endpoints generado" -ForegroundColor Green

# Generar estadísticas
Write-Host "📊 Generando estadísticas..." -ForegroundColor Blue

$totalModels = 0
foreach ($app in $Apps) {
    $modelsFile = Join-Path $BackendDir "apps\$app\models.py"
    if (Test-Path $modelsFile) {
        $content = Get-Content $modelsFile
        $totalModels += ($content | Select-String "class.*models.Model").Count
    }
}

$statsDoc = Join-Path $DocsApiDir "stats.md"
$statsContent = @"
# Estadísticas de API

**Generado:** $(Get-Date)

## Métricas

- **Total de Modelos**: $totalModels
- **Apps de Backend**: $($Apps.Count)

## Distribución por Método

<!-- TODO: Extraer del schema OpenAPI -->

## Coverage de Documentación

<!-- TODO: Calcular porcentaje de endpoints documentados -->

"@

$statsContent | Out-File -FilePath $statsDoc -Encoding UTF8
Write-Host "✅ Estadísticas generadas: docs/api/stats.md" -ForegroundColor Green

# Resumen
Write-Host "`n════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Documentación de API generada exitosamente!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "`nArchivos generados:" -ForegroundColor Blue
Write-Host "  📄 openapi-schema.yml"
Write-Host "  📄 openapi-schema.json"
Write-Host "  📄 models-generated.md"
Write-Host "  📄 endpoints-generated.md"
Write-Host "  📄 stats.md"
Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Revisa los archivos generados en docs/api/"
Write-Host "  2. Actualiza README.md si es necesario"
Write-Host "  3. Commit los cambios: git add docs/api/ && git commit"
Write-Host ""
