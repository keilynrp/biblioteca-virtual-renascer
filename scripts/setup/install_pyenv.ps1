# Script para instalar pyenv-win y Python 3.12
# Ejecutar en PowerShell como administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Instalando pyenv-win..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Instalar pyenv-win usando pip
pip install pyenv-win --target $HOME\.pyenv

# Agregar variables de entorno
[System.Environment]::SetEnvironmentVariable('PYENV', "$HOME\.pyenv\pyenv-win", 'User')
[System.Environment]::SetEnvironmentVariable('PYENV_ROOT', "$HOME\.pyenv\pyenv-win", 'User')
[System.Environment]::SetEnvironmentVariable('PYENV_HOME', "$HOME\.pyenv\pyenv-win", 'User')

# Agregar al PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')
$newPaths = @(
    "$HOME\.pyenv\pyenv-win\bin",
    "$HOME\.pyenv\pyenv-win\shims"
)

foreach ($path in $newPaths) {
    if ($currentPath -notlike "*$path*") {
        $currentPath = "$path;$currentPath"
    }
}

[System.Environment]::SetEnvironmentVariable('PATH', $currentPath, 'User')

Write-Host "`nPyenv instalado correctamente!" -ForegroundColor Green
Write-Host "`nREINICIA PowerShell y ejecuta:" -ForegroundColor Yellow
Write-Host "  pyenv install 3.12.7" -ForegroundColor White
Write-Host "  pyenv global 3.12.7" -ForegroundColor White
Write-Host "  python --version" -ForegroundColor White
Write-Host "`n========================================" -ForegroundColor Cyan
