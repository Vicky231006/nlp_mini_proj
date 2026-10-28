# ==============================================================================
# NCERT Adaptive AI Tutor - start_all.ps1
# Wrapper forwarding directly to startup.ps1
# ==============================================================================
$scriptPath = Join-Path $PSScriptRoot 'startup.ps1'
& $scriptPath @args

