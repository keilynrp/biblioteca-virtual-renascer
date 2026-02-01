# Script PowerShell para crear un nuevo release con Semantic Versioning

$ErrorActionPreference = "Stop"

Write-Host "════════════════════════════════════════" -ForegroundColor Blue
Write-Host "   🚀 Create Release - BVS Framework" -ForegroundColor Blue
Write-Host "════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

# Verificar que estamos en main
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "⚠️  Advertencia: No estás en la rama main (estás en: $currentBranch)" -ForegroundColor Yellow
    $continue = Read-Host "¿Continuar de todos modos? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Verificar que el working tree esté limpio
$status = git status --short
if ($status) {
    Write-Host "❌ Error: Tienes cambios sin commit" -ForegroundColor Red
    Write-Host ""
    git status --short
    Write-Host ""
    Write-Host "Por favor commit o stash tus cambios antes de crear un release" -ForegroundColor Yellow
    exit 1
}

# Obtener el último tag
try {
    $lastTag = git describe --tags --abbrev=0 2>$null
} catch {
    $lastTag = "v0.0.0"
}

Write-Host "📌 Último tag: $lastTag" -ForegroundColor Blue

# Extraer versión actual
$currentVersion = $lastTag -replace '^v', ''

# Parsear versión
$versionParts = $currentVersion -split '\.'
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]

Write-Host ""
Write-Host "Versión actual: $major.$minor.$patch" -ForegroundColor Blue
Write-Host ""

# Mostrar opciones
Write-Host "Selecciona el tipo de release:"
Write-Host ""
Write-Host "  1) 🐛 Patch   ($major.$minor.$($patch+1)) - Bug fixes"
Write-Host "  2) ✨ Minor   ($major.$($minor+1).0) - New features"
Write-Host "  3) 💥 Major   ($($major+1).0.0) - Breaking changes"
Write-Host "  4) 📝 Custom  - Especificar versión manualmente"
Write-Host ""

$option = Read-Host "Opción (1-4)"

switch ($option) {
    "1" {
        $newVersion = "$major.$minor.$($patch+1)"
        $releaseType = "patch"
    }
    "2" {
        $newVersion = "$major.$($minor+1).0"
        $releaseType = "minor"
    }
    "3" {
        $newVersion = "$($major+1).0.0"
        $releaseType = "major"
    }
    "4" {
        $customVersion = Read-Host "Ingresa la nueva versión (formato: X.Y.Z)"
        $newVersion = $customVersion
        $releaseType = "custom"
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

$newTag = "v$newVersion"

Write-Host ""
Write-Host "Nueva versión: $newVersion" -ForegroundColor Green
Write-Host "Nuevo tag: $newTag" -ForegroundColor Green
Write-Host ""

# Pedir mensaje de release
$releaseMessage = Read-Host "Mensaje del release (presiona Enter para mensaje por defecto)"

if ([string]::IsNullOrWhiteSpace($releaseMessage)) {
    $releaseMessage = "Release $newTag"
}

Write-Host ""
Write-Host "═══════════════ Resumen ═══════════════" -ForegroundColor Yellow
Write-Host "  Tag anterior:  $lastTag"
Write-Host "  Tag nuevo:     $newTag"
Write-Host "  Tipo:          $releaseType"
Write-Host "  Mensaje:       $releaseMessage"
Write-Host "═══════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$proceed = Read-Host "¿Proceder con el release? (y/n)"
if ($proceed -ne "y") {
    Write-Host "❌ Release cancelado" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📝 Actualizando archivos de versión..." -ForegroundColor Blue

# Actualizar version en frontend/package.json
$packageJson = "frontend\package.json"
if (Test-Path $packageJson) {
    $content = Get-Content $packageJson -Raw | ConvertFrom-Json
    $content.version = $newVersion
    $content | ConvertTo-Json -Depth 32 | Set-Content $packageJson
    Write-Host "  ✅ frontend/package.json" -ForegroundColor Green
}

# Actualizar version en README.md
$readme = "README.md"
if (Test-Path $readme) {
    $content = Get-Content $readme -Raw
    $content = $content -replace 'version-[0-9]+\.[0-9]+\.[0-9]+', "version-$newVersion"
    $content | Set-Content $readme -NoNewline
    Write-Host "  ✅ README.md" -ForegroundColor Green
}

# Actualizar CHANGELOG.md
Write-Host ""
Write-Host "📄 Actualizando CHANGELOG.md..." -ForegroundColor Blue

$today = Get-Date -Format "yyyy-MM-dd"
$changelogEntry = "## [$newVersion] - $today"

$changelog = Get-Content "CHANGELOG.md"
$newChangelog = @()
$added = $false

foreach ($line in $changelog) {
    $newChangelog += $line
    if ($line -match '## \[Unreleased\]' -and -not $added) {
        $newChangelog += ""
        $newChangelog += $changelogEntry
        $newChangelog += ""
        $newChangelog += "### Added"
        $newChangelog += "- "
        $newChangelog += ""
        $newChangelog += "### Changed"
        $newChangelog += "- "
        $newChangelog += ""
        $newChangelog += "### Fixed"
        $newChangelog += "- "
        $newChangelog += ""
        $newChangelog += "---"
        $newChangelog += ""
        $added = $true
    }
}

$newChangelog | Set-Content "CHANGELOG.md"
Write-Host "  ✅ CHANGELOG.md" -ForegroundColor Green

Write-Host ""
Write-Host "⚠️  Por favor edita CHANGELOG.md y agrega los cambios de esta versión" -ForegroundColor Yellow
Read-Host "Presiona Enter cuando hayas editado CHANGELOG.md"

# Commit cambios de versión
Write-Host ""
Write-Host "💾 Creando commit de release..." -ForegroundColor Blue

git add frontend/package.json README.md CHANGELOG.md 2>$null
git commit -m "chore(release): bump version to $newVersion

- Update version in package.json
- Update README badge
- Update CHANGELOG.md

Release $newTag"

Write-Host "  ✅ Commit creado" -ForegroundColor Green

# Crear tag
Write-Host ""
Write-Host "🏷️  Creando tag..." -ForegroundColor Blue

git tag -a $newTag -m $releaseMessage

Write-Host "  ✅ Tag $newTag creado" -ForegroundColor Green

# Mostrar log
Write-Host ""
Write-Host "📜 Commits desde $lastTag:" -ForegroundColor Blue
git log "$lastTag..HEAD" --oneline --no-merges | Select-Object -First 10
Write-Host ""

# Preguntar si push
$push = Read-Host "¿Pushear cambios y tag al remoto? (y/n)"
if ($push -eq "y") {
    Write-Host ""
    Write-Host "📤 Pusheando al remoto..." -ForegroundColor Blue

    git push origin main
    git push origin $newTag

    Write-Host "  ✅ Cambios pusheados" -ForegroundColor Green
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ Release $newTag creado exitosamente!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Blue
    Write-Host "  1. Crea release notes en GitHub"
    Write-Host "  2. Verifica que CI/CD pase"
    Write-Host "  3. Deploy a producción si corresponde"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Cambios no pusheados. Ejecuta manualmente:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  git push origin main"
    Write-Host "  git push origin $newTag"
    Write-Host ""
}

# Información final
Write-Host "═══════════════════════════════════════" -ForegroundColor Blue
Write-Host "📚 Información del Release" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════" -ForegroundColor Blue
Write-Host ""
Write-Host "Tag:     $newTag"
Write-Host "Commit:  $(git rev-parse HEAD)"
Write-Host "Branch:  $currentBranch"
Write-Host ""
