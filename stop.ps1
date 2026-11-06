# ==============================================================================
# NCERT Adaptive AI Tutor - Stop All Services
# Terminates:
#   - Vite Frontend (port 5173)
#   - Express API Server (port 3001)
#   - NCERT Vector Retrieval Service (port 8000)
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$IncludeOllama,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Usage: .\stop.ps1 [-IncludeOllama] [-Help]

Parameters:
  -IncludeOllama    Also stop the Ollama service on port 11434.
  -Help             Show this message.
"@
    exit 0
}

Write-Host "==============================================================" -ForegroundColor Yellow
Write-Host "  Stopping NCERT Adaptive AI Tutor Services..." -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor Yellow

$portsToClean = @(5173, 3001, 8000)
if ($IncludeOllama) {
    $portsToClean += 11434
}

foreach ($port in $portsToClean) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            if ($procId -and $procId -ne 0 -and $procId -ne $PID) {
                try {
                    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    if ($p) {
                        Write-Host "  -> Stopping $($p.ProcessName) on port $port (PID: $procId)..." -ForegroundColor Cyan
                        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                    }
                } catch {}
            }
        }
    } else {
        Write-Host "  -> Port $port is already free." -ForegroundColor DarkGray
    }
}

Start-Sleep -Seconds 1
Write-Host "`nAll tutoring services have been stopped successfully.`n" -ForegroundColor Green

