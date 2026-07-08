param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl,

    [Parameter(Mandatory = $false)]
    [string]$CronToken = "",

    [Parameter(Mandatory = $false)]
    [string]$PublicPath = "/services",

    [Parameter(Mandatory = $false)]
    [switch]$FailOnWarnings
)

$ErrorActionPreference = "Stop"

function Invoke-SafeWebRequest {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Uri,

        [Parameter(Mandatory = $true)]
        [string]$Method,

        [Parameter(Mandatory = $false)]
        [hashtable]$Headers
    )

    $invokeParams = @{
        Uri                = $Uri
        Method             = $Method
        MaximumRedirection = 0
        ErrorAction        = 'Stop'
        UseBasicParsing    = $true
    }

    if ($Headers) {
        $invokeParams.Headers = $Headers
    }

    try {
        $response = Invoke-WebRequest @invokeParams

        return [pscustomobject]@{
            StatusCode = [int]$response.StatusCode
            Headers    = $response.Headers
            Response   = $response
        }
    }
    catch {
        if ($_.Exception.Response) {
            return [pscustomobject]@{
                StatusCode = [int]$_.Exception.Response.StatusCode
                Headers    = $_.Exception.Response.Headers
                Response   = $_.Exception.Response
            }
        }

        if ($_.FullyQualifiedErrorId -like 'MaximumRedirectExceeded*' -or $_.Exception.Message -like '*MaximumRedirectExceeded*' -or $_.Exception.Message -like '*maximum redirection count has been exceeded*') {
            return [pscustomobject]@{
                StatusCode = 302
                Headers    = @{}
                Response   = $null
            }
        }

        throw
    }
}

function Write-Check {
    param(
        [string]$Name,
        [bool]$Pass,
        [string]$Details
    )

    if ($Pass) {
        Write-Host "[PASS] $Name - $Details" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] $Name - $Details" -ForegroundColor Red
    }
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Resolve-Url {
    param(
        [string]$Base,
        [string]$Path
    )

    $baseTrimmed = $Base.TrimEnd('/')
    if ($Path.StartsWith('/')) {
        return "$baseTrimmed$Path"
    }

    return "$baseTrimmed/$Path"
}

$summary = [ordered]@{
    Pass  = 0
    Fail  = 0
    Warn  = 0
}

function Track-Result {
    param([bool]$Pass)

    if ($Pass) {
        $summary.Pass++
    }
    else {
        $summary.Fail++
    }
}

$publicUrl = Resolve-Url -Base $BaseUrl -Path $PublicPath
$remindersUrl = Resolve-Url -Base $BaseUrl -Path "/api/reminders/send"
$pageContentsUrl = Resolve-Url -Base $BaseUrl -Path "/admin/page-contents"

Write-Host "Running security smoke checks against $BaseUrl" -ForegroundColor Cyan

# 1) Public page should answer and include basic security headers.
$publicResponse = Invoke-SafeWebRequest -Uri $publicUrl -Method GET

$statusOk = ($publicResponse.StatusCode -ge 200 -and $publicResponse.StatusCode -lt 400)
Write-Check -Name "Public route status" -Pass $statusOk -Details "HTTP $($publicResponse.StatusCode) on $PublicPath"
Track-Result -Pass $statusOk

$requiredHeaders = @(
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy"
)

foreach ($header in $requiredHeaders) {
    $exists = $null -ne $publicResponse.Headers[$header]
    Write-Check -Name "Header $header" -Pass $exists -Details ($(if ($exists) { $publicResponse.Headers[$header] } else { "missing" }))
    Track-Result -Pass $exists
}

# 2) HSTS should exist only on HTTPS responses.
$isHttps = $BaseUrl.Trim().ToLower().StartsWith("https://")
$hasHsts = $null -ne $publicResponse.Headers["Strict-Transport-Security"]

if ($isHttps) {
    Write-Check -Name "HSTS on HTTPS" -Pass $hasHsts -Details ($(if ($hasHsts) { $publicResponse.Headers["Strict-Transport-Security"] } else { "missing" }))
    Track-Result -Pass $hasHsts
}
else {
    if ($hasHsts) {
        Write-Warn -Message "HSTS present on HTTP base URL (unexpected in most setups)."
    }
    else {
        Write-Host "[INFO] HSTS skipped on HTTP base URL." -ForegroundColor DarkGray
    }
}

# 3) reminders endpoint should reject requests without token.
$noTokenResponse = Invoke-SafeWebRequest -Uri $remindersUrl -Method POST
$noTokenStatus = $noTokenResponse.StatusCode

$rejectedWithoutToken = @("401", "403", "419", "503") -contains [string]$noTokenStatus
Write-Check -Name "Reminders blocked without token" -Pass $rejectedWithoutToken -Details "HTTP $noTokenStatus"
Track-Result -Pass $rejectedWithoutToken

# 4) reminders endpoint with token: expect not 401/403/419/503.
if ([string]::IsNullOrWhiteSpace($CronToken)) {
    Write-Warn -Message "Cron token not provided; skipping authenticated reminders check."
    $summary.Warn++
}
else {
    $withTokenResponse = Invoke-SafeWebRequest -Uri $remindersUrl -Method POST -Headers @{ "X-Cron-Token" = $CronToken }
    $withTokenStatus = $withTokenResponse.StatusCode

    $tokenAccepted = -not (@("401", "403", "419", "503") -contains [string]$withTokenStatus)
    Write-Check -Name "Reminders accessible with token" -Pass $tokenAccepted -Details "HTTP $withTokenStatus"
    Track-Result -Pass $tokenAccepted
}

# 5) admin page-contents should not be publicly accessible.
$pageContentsResponse = Invoke-SafeWebRequest -Uri $pageContentsUrl -Method GET
$pageContentsStatus = $pageContentsResponse.StatusCode

$adminBlocked = @("302", "401", "403") -contains [string]$pageContentsStatus
Write-Check -Name "Admin page-contents blocked for anonymous" -Pass $adminBlocked -Details "HTTP $pageContentsStatus"
Track-Result -Pass $adminBlocked

Write-Host "" 
Write-Host "Summary: PASS=$($summary.Pass) FAIL=$($summary.Fail) WARN=$($summary.Warn)" -ForegroundColor Cyan

if ($FailOnWarnings -and $summary.Warn -gt 0) {
    exit 2
}

if ($summary.Fail -gt 0) {
    exit 1
}

exit 0
