param(
    [string]$BaseVersion = "v1.0.0",
    [string]$Branch = "develop",
    [string]$SshUserHost = "ta8021_redeemer_test@ta8021.ftp.infomaniak.com",
    [string]$SshKey = "$env:USERPROFILE\.ssh\redeemerholding_infomaniak",
    [string]$RemoteScript = ".\scripts\deploy-release.sh"
)

$ErrorActionPreference = "Stop"

function Ask-YesNo {
    param([string]$Message, [bool]$DefaultYes = $true)
    $suffix = if ($DefaultYes) { "[Y/n]" } else { "[y/N]" }
    $answer = Read-Host "$Message $suffix"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $DefaultYes }
    return $answer.Trim().ToLower() -in @("y","yes","o","oui")
}

function Run-Step {
    param([string]$Title, [scriptblock]$Action)
    Write-Host "`n==> $Title" -ForegroundColor Cyan
    & $Action
}

Write-Host ""
Write-Host "Redeemer Holding - Déploiement staging interactif" -ForegroundColor Green
Write-Host "================================================="

Run-Step "Vérification du dépôt Git" {
    if (-not (Test-Path ".git")) { throw "Lancer ce script à la racine du dépôt Git." }
    $currentBranch = (git branch --show-current).Trim()
    if ($currentBranch -ne $Branch) { throw "Branche actuelle: $currentBranch. Attendue: $Branch." }
    git fetch origin --tags
    git status --short
}

Write-Host "Attention : npm ci nécessite que npm run dev / Vite soit arrêté." -ForegroundColor Yellow
if (-not (Ask-YesNo "Le serveur npm run dev est-il arrêté ?" $false)) {
    throw "Arrête npm run dev puis relance le déploiement."
}

if (Ask-YesNo "Lancer npm ci + build Vite ?" $true) {
    Run-Step "npm ci" { npm ci }
    Run-Step "Build Vite" { npm run build }
    if (-not (Test-Path "public\build\manifest.json")) { throw "manifest Vite absent." }
    $assetCount = (Get-ChildItem "public\build\assets" -File | Measure-Object).Count
    if ($assetCount -lt 1) { throw "Aucun asset Vite détecté." }
    Write-Host "[OK] $assetCount assets Vite." -ForegroundColor Green
}

if (Ask-YesNo "Lancer la suite Laravel avant la RC ?" $true) {
    Run-Step "Tests Laravel" { php artisan test }
}

if (git status --porcelain) {
    Write-Host "`nChangements détectés :" -ForegroundColor Yellow
    git status --short
    if (-not (Ask-YesNo "Ajouter tous les changements avec git add . ?" $false)) { throw "Annulé." }
    git add .
    git diff --cached --stat

    if (-not (Ask-YesNo "Créer le commit maintenant ?" $false)) { throw "Annulé avant commit." }
    $message = Read-Host "Message du commit"
    if ([string]::IsNullOrWhiteSpace($message)) { $message = "chore: prepare staging release" }
    git commit -m $message
}

if (git status --porcelain) { throw "Le working tree doit être propre avant la RC." }

Run-Step "Synchronisation de $Branch" {
    git fetch origin $Branch
    $local = (git rev-parse HEAD).Trim()
    $remote = (git rev-parse "origin/$Branch").Trim()
    if ($local -ne $remote) {
        if (-not (Ask-YesNo "Pousser $Branch vers origin ?" $true)) { throw "Commit local non publié." }
        git push origin $Branch
    } else {
        Write-Host "[OK] $Branch synchronisée." -ForegroundColor Green
    }
}

Run-Step "Calcul de la prochaine RC" {
    $escaped = [regex]::Escape($BaseVersion)
    $numbers = @()
    foreach ($tag in (git tag --list "$BaseVersion-rc.*")) {
        if ($tag -match "^$escaped-rc\.(\d+)$") { $numbers += [int]$Matches[1] }
    }
    $next = if ($numbers.Count -eq 0) { 1 } else { ($numbers | Measure-Object -Maximum).Maximum + 1 }
    $script:RcTag = "$BaseVersion-rc.$next"
    Write-Host "Nouvelle RC : $script:RcTag" -ForegroundColor Green
    Write-Host "HEAD        : $((git rev-parse --short HEAD).Trim())"
}

if (-not (Ask-YesNo "Créer et publier $RcTag ?" $true)) { throw "Création RC annulée." }

Run-Step "Création du tag $RcTag" {
    git tag -a $RcTag -m "Release candidate $RcTag"
    git show --no-patch --oneline $RcTag
    git push origin $RcTag
}

Run-Step "Vérification du tag distant" {
    $remoteTag = git ls-remote --tags origin $RcTag
    if (-not $remoteTag) { throw "Tag distant introuvable." }
    Write-Host $remoteTag
}

if (-not (Test-Path $RemoteScript)) { throw "Script serveur introuvable: $RemoteScript" }
if (-not (Test-Path $SshKey)) { throw "Clé SSH introuvable: $SshKey" }

if (-not (Ask-YesNo "Déployer maintenant $RcTag sur Infomaniak staging ?" $true)) {
    Write-Host "RC publiée, déploiement serveur non lancé." -ForegroundColor Yellow
    exit 0
}

$remoteTmp = "/tmp/redeemer-deploy-$([guid]::NewGuid().ToString('N')).sh"

Run-Step "Copie temporaire du script serveur" {
    scp -i $SshKey $RemoteScript "${SshUserHost}:$remoteTmp"
}

try {
    Run-Step "Déploiement interactif sur Infomaniak" {
        ssh -t -i $SshKey $SshUserHost "chmod 700 '$remoteTmp' && '$remoteTmp' '$RcTag'; status=`$?; rm -f '$remoteTmp'; exit `$status"
    }
}
finally {
    ssh -i $SshKey $SshUserHost "rm -f '$remoteTmp'" 2>$null | Out-Null
}

Write-Host "`nDéploiement terminé pour $RcTag." -ForegroundColor Green
