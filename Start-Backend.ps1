# ============================================================================
# Backend Startup - PowerShell Script
# ============================================================================
# PowerShell wrapper for backend management
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('start', 'fresh', 'skip-build', 'fix', 'logs', 'stop', 'restart', 'shell', 'superuser')]
    [string]$Action = 'menu'
)

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput Green "✓ $Message"
}

function Write-Error-Custom {
    param([string]$Message)
    Write-ColorOutput Red "✗ $Message"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput Cyan "ℹ $Message"
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-ColorOutput Yellow "⚠ $Message"
}

# Check Docker
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Error-Custom "Docker is not running. Please start Docker Desktop."
        return $false
    }
}

# Check Git Bash
function Test-GitBash {
    $bashPath = Get-Command bash -ErrorAction SilentlyContinue
    if ($null -eq $bashPath) {
        Write-Error-Custom "Git Bash not found. Please install Git for Windows."
        Write-Info "Download from: https://git-scm.com/download/win"
        return $false
    }
    return $true
}

# Show Header
function Show-Header {
    Clear-Host
    Write-ColorOutput Magenta @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Backend Startup - PowerShell Manager              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@
}

# Show Menu
function Show-Menu {
    Show-Header

    Write-Host "Available Actions:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Start backend (normal)"
    Write-Host "  2. Start backend (skip build - faster)"
    Write-Host "  3. Start backend (fresh - clean start)"
    Write-Host "  4. Fix backend issues (diagnostic tool)"
    Write-Host "  5. View backend logs"
    Write-Host "  6. Stop all services"
    Write-Host "  7. Restart all services"
    Write-Host "  8. Create Django superuser"
    Write-Host "  9. Django shell"
    Write-Host "  0. Exit"
    Write-Host ""
}

# Execute Action
function Invoke-BackendAction {
    param([string]$Action)

    if (-not (Test-Docker)) {
        return
    }

    switch ($Action) {
        'start' {
            Write-Info "Starting backend..."
            if (Test-GitBash) {
                bash scripts/start_backend_optimized.sh
            }
        }
        'skip-build' {
            Write-Info "Starting backend (skip build)..."
            if (Test-GitBash) {
                bash scripts/start_backend_optimized.sh --skip-build
            }
        }
        'fresh' {
            Write-Info "Starting backend (fresh)..."
            if (Test-GitBash) {
                bash scripts/start_backend_optimized.sh --fresh
            }
        }
        'fix' {
            Write-Info "Launching diagnostic tool..."
            if (Test-GitBash) {
                bash scripts/fix_backend_issues.sh
            }
        }
        'logs' {
            Write-Info "Showing backend logs (Ctrl+C to exit)..."
            docker-compose logs -f backend
        }
        'stop' {
            Write-Info "Stopping all services..."
            docker-compose down
            Write-Success "All services stopped"
            Read-Host "Press Enter to continue"
        }
        'restart' {
            Write-Info "Restarting all services..."
            docker-compose restart
            Write-Success "All services restarted"
            Read-Host "Press Enter to continue"
        }
        'superuser' {
            Write-Info "Creating superuser..."
            docker-compose exec backend python manage.py createsuperuser
            Read-Host "Press Enter to continue"
        }
        'shell' {
            Write-Info "Opening Django shell..."
            docker-compose exec backend python manage.py shell
        }
        'menu' {
            while ($true) {
                Show-Menu
                $choice = Read-Host "Enter your choice (0-9)"

                switch ($choice) {
                    '1' { Invoke-BackendAction 'start' }
                    '2' { Invoke-BackendAction 'skip-build' }
                    '3' { Invoke-BackendAction 'fresh' }
                    '4' { Invoke-BackendAction 'fix' }
                    '5' { Invoke-BackendAction 'logs' }
                    '6' { Invoke-BackendAction 'stop' }
                    '7' { Invoke-BackendAction 'restart' }
                    '8' { Invoke-BackendAction 'superuser' }
                    '9' { Invoke-BackendAction 'shell' }
                    '0' {
                        Write-Info "Exiting..."
                        return
                    }
                    default {
                        Write-Error-Custom "Invalid option!"
                        Read-Host "Press Enter to continue"
                    }
                }
            }
        }
    }
}

# Main execution
try {
    Invoke-BackendAction $Action
} catch {
    Write-Error-Custom "An error occurred: $_"
    Read-Host "Press Enter to exit"
}
