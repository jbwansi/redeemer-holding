param(
    [string]$EnvFile = ".env"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $EnvFile)) {
    Write-Error "Fichier introuvable: $EnvFile"
    exit 1
}

$envMap = @{}
Get-Content -Path $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    $idx = $line.IndexOf("=")
    if ($idx -lt 1) {
        return
    }

    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim().Trim('"')
    $envMap[$key] = $value
}

$checks = @(
    @{ Name = "APP_KEY défini"; Pass = ($envMap.ContainsKey("APP_KEY") -and $envMap["APP_KEY"]) },
    @{ Name = "APP_DEBUG=false"; Pass = ($envMap["APP_DEBUG"] -eq "false") },
    @{ Name = "STRIPE_KEY défini"; Pass = ($envMap.ContainsKey("STRIPE_KEY") -and $envMap["STRIPE_KEY"]) },
    @{ Name = "STRIPE_SECRET défini"; Pass = ($envMap.ContainsKey("STRIPE_SECRET") -and $envMap["STRIPE_SECRET"]) },
    @{ Name = "STRIPE_WEBHOOK_SECRET défini"; Pass = ($envMap.ContainsKey("STRIPE_WEBHOOK_SECRET") -and $envMap["STRIPE_WEBHOOK_SECRET"]) },
    @{ Name = "FORCE_HTTPS=true"; Pass = ($envMap["FORCE_HTTPS"] -eq "true") },
    @{ Name = "CORS_ALLOWED_ORIGINS défini"; Pass = ($envMap.ContainsKey("CORS_ALLOWED_ORIGINS") -and $envMap["CORS_ALLOWED_ORIGINS"]) }
)

$failed = @()
Write-Host "=== Vérification Pré-Prod Paiement (Sécurité/Config) ==="
foreach ($check in $checks) {
    if ($check.Pass) {
        Write-Host "[OK]  $($check.Name)"
    }
    else {
        Write-Host "[KO]  $($check.Name)"
        $failed += $check.Name
    }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Points à corriger:"
    $failed | ForEach-Object { Write-Host " - $_" }
    exit 2
}

Write-Host ""
Write-Host "Tous les contrôles de base sont conformes."
exit 0
