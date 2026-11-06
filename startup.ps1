# ==============================================================================
# NCERT Adaptive AI Tutor - Unified Full-Stack Startup Orchestrator
# Starts:
#   1. Local Ollama LLM Service (port 11434, default: qwen2.5:1.5b)
#   2. NCERT Vector & Hybrid Retrieval Service (Uvicorn FastAPI, port 8000)
#   3. Express API Backend (port 3001)
#   4. Vite Frontend Application (port 5173)
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$Background,
    [switch]$Daemon,
    [switch]$NoBrowser,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Usage: .\startup.ps1 [-Background] [-Daemon] [-NoBrowser] [-Help]

Parameters:
  -Background, -Daemon   Launch all services detached in the background and return immediately.
  -NoBrowser             Do not automatically open the browser UI.
  -Help                  Show this usage help message.
"@
    exit 0
}

if ($Daemon) {
    $Background = $true
}

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  Starting NCERT Adaptive AI Tutor Services" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

# 0. Ensure tmp directory exists
$tmpDir = Join-Path $PSScriptRoot 'tmp'
if (-not (Test-Path -LiteralPath $tmpDir)) {
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
}

# Helper to check and release stuck ports
function Test-And-Free-Port {
    param(
        [int]$Port,
        [string]$ServiceName = "Service"
    )
    if (-not $Port -or $Port -le 0) { return }

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            if ($procId -and $procId -ne 0 -and $procId -ne $PID) {
                try {
                    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    if ($p -and $p.ProcessName -in @('python', 'python3', 'node', 'uvicorn', 'electron')) {
                        Write-Host "  [!] Port $Port is held by stale $($p.ProcessName) (PID: $procId). Releasing..." -ForegroundColor Yellow
                        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                    }
                } catch {}
            }
        }
        # Wait up to 3 seconds for port socket to be fully released by OS
        for ($i = 0; $i -lt 6; $i++) {
            Start-Sleep -Milliseconds 500
            $active = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
            if (-not $active) { break }
        }
    }
}

# 1. Check prerequisites
$nodeCmdObj = Get-Command node -ErrorAction SilentlyContinue
$nodeCmd = if ($nodeCmdObj) { $nodeCmdObj.Source } else { $null }

$npmCmdObj = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCmdObj) {
    $npmCmdObj = Get-Command npm -ErrorAction SilentlyContinue
}
$npmCmd = if ($npmCmdObj) { $npmCmdObj.Source } else { $null }

if (-not $nodeCmd -or -not $npmCmd) {
    throw 'Node.js 22+ and npm are required. Install them, then run this script again.'
}

# 2. Extract application configuration
$configJson = & $nodeCmd --input-type=module -e "
import { getServerConfig } from './server/config.js';
const config = getServerConfig();
const modelUrl = new URL(config.openAICompatible.baseUrl);
const retrievalUrl = new URL(config.retrieval.baseUrl);
console.log(JSON.stringify({
  provider: config.provider,
  origin: modelUrl.origin,
  hostname: modelUrl.hostname,
  port: (modelUrl.port || (modelUrl.protocol === 'https:' ? '443' : '80')),
  model: config.openAICompatible.model,
  geminiModel: config.gemini?.model || '',
  geminiKeyCount: config.gemini?.apiKeys?.length || 0,
  retrieval: {
    enabled: config.retrieval.enabled,
    origin: retrievalUrl.origin,
    hostname: retrievalUrl.hostname,
    port: (retrievalUrl.port || (retrievalUrl.protocol === 'https:' ? '443' : '8000'))
  }
}));"

if ($LASTEXITCODE -ne 0 -or -not $configJson) {
    throw 'Could not load the app configuration from server/config.js.'
}
$modelConfig = $configJson | ConvertFrom-Json
$ollamaProcess = $null
$retrievalProcess = $null
$webProcess = $null

try {
    # --------------------------------------------------------------------------
    # Step 1: Ollama LLM Service
    # --------------------------------------------------------------------------
    Write-Host "`n[1/3] Checking LLM Service ($($modelConfig.provider))..." -ForegroundColor Yellow
    $usesLocalOllama = $modelConfig.provider -eq 'openai-compatible' -and
        $modelConfig.port -eq '11434' -and
        $modelConfig.hostname -in @('localhost', '127.0.0.1', '::1')

    if ($usesLocalOllama) {
        $ollamaReady = $false
        try {
            $tags = Invoke-RestMethod -Uri "$($modelConfig.origin)/api/tags" -TimeoutSec 2 -ErrorAction Stop
            $ollamaReady = $true
            Write-Host "  -> Ollama is already active at $($modelConfig.origin)" -ForegroundColor Green
        } catch {
            $ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
            if (-not $ollamaCommand) {
                throw "The configured local model uses Ollama, but the 'ollama' command was not found on PATH."
            }

            Write-Host '  -> Launching local Ollama daemon...' -ForegroundColor Cyan
            $ollamaProcess = Start-Process -FilePath $ollamaCommand.Source `
                -ArgumentList 'serve' -PassThru -NoNewWindow

            for ($attempt = 1; $attempt -le 30; $attempt++) {
                Start-Sleep -Seconds 1
                if ($ollamaProcess.HasExited) {
                    throw 'Ollama stopped unexpectedly. Check its installation and logs.'
                }
                try {
                    $null = Invoke-RestMethod -Uri "$($modelConfig.origin)/api/tags" -TimeoutSec 2 -ErrorAction Stop
                    $ollamaReady = $true
                    break
                } catch {}
            }

            if (-not $ollamaReady) {
                throw "Ollama did not become ready at $($modelConfig.origin) within 30 seconds."
            }
            Write-Host "  -> Ollama started successfully." -ForegroundColor Green
        }

        # Check model availability
        $ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
        if ($ollamaCommand) {
            $installedModels = & $ollamaCommand.Source list 2>$null
            if ($LASTEXITCODE -eq 0 -and ($installedModels | Select-String -SimpleMatch -Pattern $modelConfig.model)) {
                Write-Host "  -> Model '$($modelConfig.model)' is verified and ready." -ForegroundColor Green
            } else {
                Write-Warning "Model '$($modelConfig.model)' is not yet pulled in Ollama.`nIn another terminal, run: ollama pull $($modelConfig.model)"
            }
        }
    } else {
        if ($modelConfig.provider -eq 'gemini') {
            Write-Host "  -> Provider 'gemini' configured (model: $($modelConfig.geminiModel), active keys: $($modelConfig.geminiKeyCount))." -ForegroundColor Green
        } else {
            Write-Host "  -> Provider '$($modelConfig.provider)' configured ($($modelConfig.origin) / $($modelConfig.model))." -ForegroundColor Green
        }
    }

    # --------------------------------------------------------------------------
    # Step 2: NCERT Vector & Hybrid Retrieval Service
    # --------------------------------------------------------------------------
    $retrieval = $modelConfig.retrieval
    $usesLocalRetrieval = $retrieval.enabled -and
        $retrieval.hostname -in @('localhost', '127.0.0.1', '::1')

    if ($usesLocalRetrieval) {
        Write-Host "`n[2/3] Checking NCERT Retrieval Service ($($retrieval.origin))..." -ForegroundColor Yellow
        $retrievalHealth = "$($retrieval.origin)/health"
        $retrievalReady = $false

        try {
            $healthCheck = Invoke-RestMethod -Uri $retrievalHealth -TimeoutSec 2 -ErrorAction Stop
            if ($healthCheck.status -eq 'ok') {
                $retrievalReady = $true
                Write-Host "  -> NCERT retrieval is already running at $($retrieval.origin) (chunks: $($healthCheck.chunks), device: $($healthCheck.device))." -ForegroundColor Green
            }
        } catch {}

        if (-not $retrievalReady) {
            Test-And-Free-Port -Port ([int]$retrieval.port) -ServiceName "Retrieval Service"

            $venvPython = Join-Path $PSScriptRoot '.venv-retrieval\Scripts\python.exe'
            if (-not (Test-Path -LiteralPath $venvPython)) {
                Write-Warning "NCERT retrieval is enabled, but virtual environment '$venvPython' was not found.`nChat will run without retrieved textbook evidence."
            } else {
                Write-Host "  -> Starting Uvicorn retrieval worker ($($retrieval.origin))..." -ForegroundColor Cyan
                $retrievalLog = Join-Path $tmpDir 'retrieval_service.log'
                $retrievalErr = Join-Path $tmpDir 'retrieval_service.err'

                # Safely clear or create log files without throwing file lock errors
                try {
                    if (Test-Path -LiteralPath $retrievalLog) { Clear-Content -LiteralPath $retrievalLog -ErrorAction SilentlyContinue }
                    else { New-Item -ItemType File -Path $retrievalLog -Force -ErrorAction SilentlyContinue | Out-Null }
                    if (Test-Path -LiteralPath $retrievalErr) { Clear-Content -LiteralPath $retrievalErr -ErrorAction SilentlyContinue }
                    else { New-Item -ItemType File -Path $retrievalErr -Force -ErrorAction SilentlyContinue | Out-Null }
                } catch {}

                $env:PYTHONUNBUFFERED = "1"
                $retrievalProcess = Start-Process -FilePath $venvPython `
                    -ArgumentList "-u -m uvicorn retrieval_service:app --host $($retrieval.hostname) --port $($retrieval.port) --log-level info" `
                    -WorkingDirectory $PSScriptRoot `
                    -RedirectStandardOutput $retrievalLog `
                    -RedirectStandardError $retrievalErr `
                    -WindowStyle Hidden `
                    -PassThru

                Write-Host "  -> Loading FAISS dense index, BM25 indices, and neural models..." -NoNewline

                for ($attempt = 1; $attempt -le 120; $attempt++) {
                    Start-Sleep -Seconds 1
                    Write-Host -NoNewline "."

                    if ($retrievalProcess.HasExited) {
                        Write-Host " FAILED!" -ForegroundColor Red
                        Write-Host "`n[!] Retrieval process exited prematurely with code $($retrievalProcess.ExitCode)." -ForegroundColor Red
                        if (Test-Path -LiteralPath $retrievalErr) {
                            $errContent = Get-Content -LiteralPath $retrievalErr -Tail 20 -ErrorAction SilentlyContinue
                            if ($errContent) {
                                Write-Host "Error Details:`n$($errContent -join "`n")" -ForegroundColor Red
                            }
                        }
                        if (Test-Path -LiteralPath $retrievalLog) {
                            $logContent = Get-Content -LiteralPath $retrievalLog -Tail 20 -ErrorAction SilentlyContinue
                            if ($logContent) {
                                Write-Host "Log Output:`n$($logContent -join "`n")" -ForegroundColor DarkGray
                            }
                        }
                        $retrievalProcess = $null
                        break
                    }

                    try {
                        $healthCheck = Invoke-RestMethod -Uri $retrievalHealth -TimeoutSec 2 -ErrorAction Stop
                        if ($healthCheck.status -eq 'ok') {
                            $retrievalReady = $true
                            Write-Host " DONE!" -ForegroundColor Green
                            Write-Host "  -> NCERT retrieval ready: $($healthCheck.chunks) chunks indexed on $($healthCheck.device)." -ForegroundColor Green
                            break
                        }
                    } catch {}
                }

                if (-not $retrievalReady -and $retrievalProcess) {
                    Write-Host ""
                    Write-Warning "NCERT retrieval did not become ready within 120s. Continuing startup..."
                }
            }
        }
    } else {
        Write-Host "`n[2/3] NCERT Retrieval is disabled or pointing at external endpoint." -ForegroundColor Yellow
    }

    # --------------------------------------------------------------------------
    # Step 3: Web App and API Server
    # --------------------------------------------------------------------------
    Write-Host "`n[3/3] Launching Web Application & API..." -ForegroundColor Yellow
    Test-And-Free-Port -Port 3001 -ServiceName "Express API"
    Test-And-Free-Port -Port 5173 -ServiceName "Vite UI"

    Write-Host "`n==============================================================" -ForegroundColor Green
    Write-Host "  All Services Initialized Successfully!" -ForegroundColor Green
    Write-Host "  - UI Frontend:       http://localhost:5173" -ForegroundColor Cyan
    Write-Host "  - Express API:       http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  - NCERT Retriever:   $($retrieval.origin)" -ForegroundColor Cyan
    if ($modelConfig.provider -eq 'gemini') {
        Write-Host "  - LLM Provider:      Gemini API ($($modelConfig.geminiModel))" -ForegroundColor Cyan
    } else {
        Write-Host "  - LLM Provider:      $($modelConfig.origin) ($($modelConfig.model))" -ForegroundColor Cyan
    }
    Write-Host "==============================================================" -ForegroundColor Green

    if (-not $NoBrowser) {
        # Launch browser once Vite is confirmed listening on port 5173
        $openScript = "for (`$i = 0; `$i -lt 30; `$i++) { Start-Sleep -Milliseconds 500; if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { Start-Process 'http://localhost:5173'; break } }"
        Start-Process powershell -ArgumentList "-NoProfile -Command $openScript" -WindowStyle Hidden
    }

    if ($Background) {
        Write-Host "Running services in background (daemon mode)..." -ForegroundColor Yellow
        $webProcess = Start-Process -FilePath $npmCmd `
            -ArgumentList "run dev" `
            -WorkingDirectory $PSScriptRoot `
            -WindowStyle Minimized `
            -PassThru

        # Wait up to 10 seconds for API and UI ports to become active
        for ($i = 1; $i -le 20; $i++) {
            Start-Sleep -Milliseconds 500
            $apiActive = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
            $webActive = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
            if ($apiActive -and $webActive) {
                Write-Host "Both Express API (3001) and Vite Web UI (5173) are listening." -ForegroundColor Green
                break
            }
        }

        Write-Host "Services are running stably in the background." -ForegroundColor Green
        Write-Host "Access the application at: http://localhost:5173`n" -ForegroundColor Cyan
        return
    }

    Write-Host "Press Ctrl+C to stop all services.`n" -ForegroundColor DarkGray
    & $npmCmd run dev
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "The web application exited with status $LASTEXITCODE."
    }
} finally {
    if (-not $Background) {
        Write-Host "`nShutting down background services..." -ForegroundColor Yellow
        if ($retrievalProcess -and -not $retrievalProcess.HasExited) {
            Write-Host "Stopping NCERT retrieval service (PID: $($retrievalProcess.Id))..." -ForegroundColor DarkGray
            Stop-Process -Id $retrievalProcess.Id -Force -ErrorAction SilentlyContinue
            Wait-Process -Id $retrievalProcess.Id -Timeout 3 -ErrorAction SilentlyContinue
        }
        if ($ollamaProcess -and -not $ollamaProcess.HasExited) {
            Write-Host "Stopping Ollama daemon (PID: $($ollamaProcess.Id))..." -ForegroundColor DarkGray
            Stop-Process -Id $ollamaProcess.Id -Force -ErrorAction SilentlyContinue
            Wait-Process -Id $ollamaProcess.Id -Timeout 3 -ErrorAction SilentlyContinue
        }
        Write-Host "All services stopped cleanly.`n" -ForegroundColor Green
    }
}
