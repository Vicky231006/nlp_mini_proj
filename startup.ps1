$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
    -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'Node.js 22+ and npm are required. Install them, then run this script again.'
}

$configJson = node --input-type=module -e "import { getServerConfig } from './server/config.js'; const config = getServerConfig(); const modelUrl = new URL(config.openAICompatible.baseUrl); console.log(JSON.stringify({ provider: config.provider, origin: modelUrl.origin, hostname: modelUrl.hostname, port: modelUrl.port, model: config.openAICompatible.model }));"
if ($LASTEXITCODE -ne 0) {
    throw 'Could not load the app configuration.'
}
$modelConfig = $configJson | ConvertFrom-Json
$ollamaProcess = $null

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
}
