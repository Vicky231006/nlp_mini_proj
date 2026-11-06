# ==============================================================================
# NCERT Adaptive AI Tutor - start_up.ps1
# Wrapper forwarding directly to startup.ps1
# ==============================================================================
[CmdletBinding()]
param(
    [switch]$Background,
    [switch]$Daemon,
    [switch]$NoBrowser,
    [switch]$Help
)
$scriptPath = Join-Path $PSScriptRoot 'startup.ps1'
& $scriptPath @PSBoundParameters @args


