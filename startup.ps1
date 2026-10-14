$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
    -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'Node.js 22+ and npm are required. Install them, then run this script again.'
}

$configJson = node --input-type=module -e "import { getServerConfig } from './server/config.js'; const config = getServerConfig(); const modelUrl = new URL(config.openAICompatible.baseUrl); const retrievalUrl = new URL(config.retrieval.baseUrl); console.log(JSON.stringify({ provider: config.provider, origin: modelUrl.origin, hostname: modelUrl.hostname, port: modelUrl.port, model: config.openAICompatible.model, retrieval: { enabled: config.retrieval.enabled, origin: retrievalUrl.origin, hostname: retrievalUrl.hostname, port: (retrievalUrl.port || '8000') } }));"
if ($LASTEXITCODE -ne 0) {
    throw 'Could not load the app configuration.'
}
$modelConfig = $configJson | ConvertFrom-Json
$ollamaProcess = $null
$retrievalProcess = $null

try {
    $usesLocalOllama = $modelConfig.provider -eq 'openai-compatible' -and
        $modelConfig.port -eq '11434' -and
        $modelConfig.hostname -in @('localhost', '127.0.0.1', '::1')

    if ($usesLocalOllama) {
        $ollamaReady = $false
        try {
            $null = Invoke-RestMethod -Uri "$($modelConfig.origin)/api/tags" -TimeoutSec 2
            $ollamaReady = $true
            Write-Host "Ollama is already running at $($modelConfig.origin)."
        } catch {
            $ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
            if (-not $ollamaCommand) {
                throw "The configured local model uses Ollama, but the 'ollama' command is not installed."
            }

            Write-Host 'Starting Ollama...'
            $ollamaProcess = Start-Process -FilePath $ollamaCommand.Source `
                -ArgumentList 'serve' -PassThru -NoNewWindow

            for ($attempt = 0; $attempt -lt 30; $attempt++) {
                Start-Sleep -Seconds 1
                if ($ollamaProcess.HasExited) {
                    throw 'Ollama stopped before becoming ready. Check its installation and logs.'
                }
                try {
                    $null = Invoke-RestMethod -Uri "$($modelConfig.origin)/api/tags" -TimeoutSec 2
                    $ollamaReady = $true
                    break
                } catch {
                    # Wait for Ollama to finish starting.
                }
            }

            if (-not $ollamaReady) {
                throw "Ollama did not become ready at $($modelConfig.origin) within 30 seconds."
            }
        }

        $ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
        if ($ollamaCommand) {
            $installedModels = & $ollamaCommand.Source list 2>$null
            if ($LASTEXITCODE -ne 0 -or
                -not ($installedModels | Select-String -SimpleMatch -Pattern $modelConfig.model)) {
                Write-Warning "Model '$($modelConfig.model)' is not installed. In another terminal, run: ollama pull $($modelConfig.model)"
            }
        }
    }

    $retrieval = $modelConfig.retrieval
    $usesLocalRetrieval = $retrieval.enabled -and
        $retrieval.hostname -in @('localhost', '127.0.0.1', '::1')

    if ($retrieval.enabled -and -not $usesLocalRetrieval) {
        Write-Host "NCERT retrieval points at $($retrieval.origin); it must already be running there (chat falls back without evidence if unreachable)."
    }

    if ($usesLocalRetrieval) {
        $retrievalHealth = "$($retrieval.origin)/health"
        $retrievalReady = $false
        try {
            $null = Invoke-RestMethod -Uri $retrievalHealth -TimeoutSec 2
            $retrievalReady = $true
            Write-Host "NCERT retrieval is already running at $($retrieval.origin)."
        } catch {
            $venvPython = Join-Path $PSScriptRoot '.venv-retrieval/Scripts/python.exe'
            if (-not (Test-Path -LiteralPath $venvPython)) {
                Write-Warning "NCERT retrieval is enabled but '$venvPython' was not found. Chat will run without retrieved evidence; create .venv-retrieval with the service dependencies and restart."
            } else {
                Write-Host "Starting NCERT retrieval ($($retrieval.origin))..."
                $retrievalProcess = Start-Process -FilePath $venvPython `
                    -ArgumentList @('-m', 'uvicorn', 'retrieval_service:app', '--host', $retrieval.hostname, '--port', $retrieval.port, '--log-level', 'warning') `
                    -WorkingDirectory $PSScriptRoot -PassThru -NoNewWindow

                for ($attempt = 0; $attempt -lt 120; $attempt++) {
                    Start-Sleep -Seconds 1
                    if ($retrievalProcess.HasExited) {
                        Write-Warning 'NCERT retrieval stopped before becoming ready. Chat will run without retrieved evidence; run the service manually to see the error.'
                        $retrievalProcess = $null
                        break
                    }
                    try {
                        $null = Invoke-RestMethod -Uri $retrievalHealth -TimeoutSec 2
                        $retrievalReady = $true
                        break
                    } catch {
                        # Wait for the retrieval service to finish loading models.
                    }
                }

                if ($retrievalReady) {
                    Write-Host 'NCERT retrieval is ready.'
                } elseif ($retrievalProcess) {
                    Write-Warning "NCERT retrieval did not become ready at $($retrieval.origin) within 120 seconds. Chat will run without retrieved evidence for now."
                }
            }
        }
    } elseif (-not $retrieval.enabled) {
        Write-Host 'NCERT retrieval is disabled; chat will run without retrieved evidence.'
    }

    Write-Host 'Starting the web app and API server...'
    & npm run dev
    if ($LASTEXITCODE -ne 0) {
        throw "The app exited with status $LASTEXITCODE."
    }
} finally {
    if ($ollamaProcess -and -not $ollamaProcess.HasExited) {
        Stop-Process -Id $ollamaProcess.Id -ErrorAction SilentlyContinue
        Wait-Process -Id $ollamaProcess.Id -Timeout 5 -ErrorAction SilentlyContinue
    }
    if ($retrievalProcess -and -not $retrievalProcess.HasExited) {
        Stop-Process -Id $retrievalProcess.Id -ErrorAction SilentlyContinue
        Wait-Process -Id $retrievalProcess.Id -Timeout 5 -ErrorAction SilentlyContinue
    }
}
