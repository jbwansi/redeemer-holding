param(
    [Parameter(Mandatory = $true)]
    [string]$Tag,
    [string]$SshUserHost = "redeemer-prod",
    [string]$SshKey = "$env:USERPROFILE\.ssh\redeemerholding_infomaniak",
    [string]$RemoteScript = ""
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

function Ask-YesNo {
    param([string]$Message, [bool]$DefaultYes = $false)
    $suffix = if ($DefaultYes) { "[Y/n]" } else { "[y/N]" }
    $answer = Read-Host "$Message $suffix"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $DefaultYes }
    return $answer.Trim().ToLower() -in @("y","yes","o","oui")
}

function Step {
    param([string]$Title, [scriptblock]$Action)
    Write-Host "`n==> $Title" -ForegroundColor Cyan
    & $Action
}

if ([string]::IsNullOrWhiteSpace($RemoteScript)) {
    $RemoteScript = Join-Path $PSScriptRoot "deploy-production-release.sh"
}

Write-Host ""
Write-Host "Redeemer Holding - Déploiement PRODUCTION" -ForegroundColor Green
Write-Host "========================================="
Write-Host "Tag demandé : $Tag"

if (-not (Test-Path ".git")) {
    throw "Lancer ce script à la racine du dépôt Git."
}

Step "Contrôle du dépôt local" {
    git fetch origin --tags

    if (git status --porcelain) {
        git status --short
        throw "Le working tree doit être propre pour un déploiement production."
    }

    $tagCommit = git rev-list -n 1 $Tag 2>$null
    if (-not $tagCommit) { throw "Le tag $Tag n'existe pas localement." }

    $remoteTag = git ls-remote --tags origin $Tag
    if (-not $remoteTag) { throw "Le tag $Tag n'existe pas sur origin." }

    Write-Host "[OK] Tag présent localement et sur origin." -ForegroundColor Green
    Write-Host "Commit : $((git rev-parse --short $Tag).Trim())"
}

if ($Tag -match "-rc\.") {
    Write-Host "`nATTENTION : vous déployez une Release Candidate en production." -ForegroundColor Yellow
    if (-not (Ask-YesNo "Confirmer explicitement le déploiement de $Tag en production ?" $false)) {
        throw "Déploiement annulé."
    }
}

if (-not (Test-Path $RemoteScript)) { throw "Script serveur introuvable : $RemoteScript" }
if (-not (Test-Path $SshKey)) { throw "Clé SSH introuvable : $SshKey" }

Write-Host ""
Write-Host "Production cible : redeemerholding.com" -ForegroundColor Yellow
Write-Host "Racine distante  : ~/deployments/redeemerholding-prod"
Write-Host "Tag               : $Tag"

if (-not (Ask-YesNo "Lancer le déploiement production maintenant ?" $false)) {
    Write-Host "Déploiement annulé avant connexion au serveur." -ForegroundColor Yellow
    exit 0
}

$remoteTmp = "/tmp/redeemer-production-$([guid]::NewGuid().ToString('N')).sh"

Step "Copie temporaire du script serveur" {
    scp -i $SshKey $RemoteScript "${SshUserHost}:$remoteTmp"
}

try {
    Step "Déploiement interactif sur Infomaniak production" {
        ssh -t -i $SshKey $SshUserHost "chmod 700 '$remoteTmp' && '$remoteTmp' '$Tag'; status=`$?; rm -f '$remoteTmp'; exit `$status"
    }
}
finally {
    ssh -i $SshKey $SshUserHost "rm -f '$remoteTmp'" 2>$null | Out-Null
}
