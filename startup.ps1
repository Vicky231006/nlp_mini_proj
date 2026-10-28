# ==============================================================================
# NCERT Adaptive AI Tutor - Unified Full-Stack Startup Orchestrator
# Starts:
#   1. Local Ollama LLM Service (port 11434, default: qwen2.5:1.5b)
#   2. NCERT Vector & Hybrid Retrieval Service (Uvicorn FastAPI, port 8000)
#   3. Express API Backend (port 3001)
#   4. Vite Frontend Application (port 5173)
# ==============================================================================

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
        [string]$ServiceName
    )
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            if ($procId -and $procId -ne 0 -and $procId -ne $PID) {
                try {
                    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    if ($p -and $p.ProcessName -in @('python', 'node', 'uvicorn')) {
                        Write-Host "[!] Port $Port is held by stale $($p.ProcessName) (PID: $procId). Terminating..." -ForegroundColor Yellow
                        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Milliseconds 500
                    }
                } catch {}
            }
        }
    }
}

# 1. Check prerequisites
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
    -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'Node.js 22+ and npm are required. Install them, then run this script again.'
}

# 2. Extract application configuration
$configJson = node --input-type=module -e "import { getServerConfig } from './server/config.js'; const config = getServerConfig(); const modelUrl = new URL(config.openAICompatible.baseUrl); const retrievalUrl = new URL(config.retrieval.baseUrl); console.log(JSON.stringify({ provider: config.provider, origin: modelUrl.origin, hostname: modelUrl.hostname, port: modelUrl.port, model: config.openAICompatible.model, retrieval: { enabled: config.retrieval.enabled, origin: retrievalUrl.origin, hostname: retrievalUrl.hostname, port: (retrievalUrl.port || '8000') } }));"
if ($LASTEXITCODE -ne 0) {
    throw 'Could not load the app configuration from server/config.js.'
}
$modelConfig = $configJson | ConvertFrom-Json
$ollamaProcess = $null
$retrievalProcess = $null

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
        Write-Host "  -> Provider '$($modelConfig.provider)' configured (remote/Gemini)." -ForegroundColor Green
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
            # Release port 8000 if held by a dead process
            Test-And-Free-Port -Port ([int]$retrieval.port) -ServiceName "Retrieval Service"

            $venvPython = Join-Path $PSScriptRoot '.venv-retrieval/Scripts/python.exe'
            if (-not (Test-Path -LiteralPath $venvPython)) {
                Write-Warning "NCERT retrieval is enabled, but virtual environment '$venvPython' was not found.`nChat will run without retrieved textbook evidence."
            } else {
                Write-Host "  -> Starting Uvicorn retrieval worker ($($retrieval.origin))..." -ForegroundColor Cyan
                $retrievalLog = Join-Path $tmpDir 'retrieval_service.log'
                $retrievalErr = Join-Path $tmpDir 'retrieval_service.err'

                # Clear old logs
                if (Test-Path $retrievalLog) { Remove-Item $retrievalLog -Force }
                if (Test-Path $retrievalErr) { Remove-Item $retrievalErr -Force }

                $retrievalProcess = Start-Process -FilePath $venvPython `
                    -ArgumentList @('-m', 'uvicorn', 'retrieval_service:app', '--host', $retrieval.hostname, '--port', $retrieval.port, '--log-level', 'info') `
                    -WorkingDirectory $PSScriptRoot `
                    -RedirectStandardOutput $retrievalLog `
                    -RedirectStandardError $retrievalErr `
                    -PassThru

                Write-Host "  -> Loading FAISS dense index, BM25 indices, and neural models..." -NoNewline

                for ($attempt = 1; $attempt -le 60; $attempt++) {
                    Start-Sleep -Seconds 1
                    Write-Host -NoNewline "."

                    if ($retrievalProcess.HasExited) {
                        Write-Host " FAILED!" -ForegroundColor Red
                        Write-Host "`n[!] Retrieval process exited with code $($retrievalProcess.ExitCode)." -ForegroundColor Red
                        if (Test-Path $retrievalErr) {
                            $errContent = Get-Content -LiteralPath $retrievalErr -Tail 20 -ErrorAction SilentlyContinue
                            if ($errContent) {
                                Write-Host "Error Details:`n$($errContent -join "`n")" -ForegroundColor Red
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
                    Write-Warning "NCERT retrieval did not become ready within 60s. Continuing startup..."
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
    Write-Host "  - LLM Provider:      $($modelConfig.origin) ($($modelConfig.model))" -ForegroundColor Cyan
    Write-Host "==============================================================" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop all services.`n" -ForegroundColor DarkGray

    & npm run dev
    if ($LASTEXITCODE -ne 0) {
        throw "The web application exited with status $LASTEXITCODE."
    }
} finally {
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
