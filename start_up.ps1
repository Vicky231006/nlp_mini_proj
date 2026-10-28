# ==============================================================================
# NCERT Adaptive AI Tutor - start_up.ps1
# Wrapper forwarding directly to startup.ps1
# ==============================================================================
$scriptPath = Join-Path $PSScriptRoot 'startup.ps1'
& $scriptPath @args

