param(
    [string]$datestamp
)

$backupFile = "backups\supabase-$datestamp.json"
$logFile    = "backups\supabase-$datestamp.log"
$runTime    = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

if (-not (Test-Path "backups")) { New-Item -ItemType Directory -Path "backups" | Out-Null }

# --- Log rotation (1 MB limit, keep 9 generations) ---
$logRotateBytes = 1MB
if ((Test-Path $logFile) -and (Get-Item $logFile).Length -ge $logRotateBytes) {
    for ($i = 9; $i -ge 2; $i--) {
        $src = "$logFile.bak$($i - 1)"
        $dst = "$logFile.bak$i"
        if (Test-Path $src) { Move-Item -Path $src -Destination $dst -Force }
    }
    Move-Item -Path $logFile -Destination "$logFile.bak1" -Force
    Add-Content -Path $logFile -Value "Log rotated -- previous log saved to: $logFile.bak1"
}

# --- Append run header to log ---
$divider = "=" * 60
$header = @"

$divider
RUN: $runTime
$divider
"@
Add-Content -Path $logFile -Value $header

function Write-Log {
    param([string]$msg)
    Write-Host "      $msg"
    Add-Content -Path $logFile -Value $msg
}

# --- Check for Node.js ---
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Log "[WARN] Skipped: node not found in PATH."
    Write-Log "Node.js is required. Download from https://nodejs.org/"
    Add-Content -Path $logFile -Value "RESULT: SKIPPED (node not installed)"
    exit 1
}

# --- Check for secret key ---
$secretKey = $env:SUPABASE_SECRET_KEY
if (-not $secretKey) {
    $secretKey = [System.Environment]::GetEnvironmentVariable("SUPABASE_SECRET_KEY", "User")
}

if (-not $secretKey) {
    Write-Log "[WARN] Skipped: SUPABASE_SECRET_KEY environment variable not set."
    Write-Log "Run once in Command Prompt, then reopen it:"
    Write-Log "  setx SUPABASE_SECRET_KEY `"your-secret-key`""
    Write-Log "Find it: Supabase dashboard -> Project Settings -> API -> Secret key"
    Add-Content -Path $logFile -Value "RESULT: SKIPPED (no secret key)"
    exit 1
}

# --- Run export ---
Write-Log "Exporting via Supabase REST API..."

$scriptPath = Join-Path $PSScriptRoot "supabase-export.js"

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName               = $node.Source
$psi.Arguments              = "`"$scriptPath`" `"$backupFile`""
$psi.UseShellExecute        = $false
$psi.CreateNoWindow         = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.EnvironmentVariables["SUPABASE_SECRET_KEY"] = $secretKey

$proc = [System.Diagnostics.Process]::Start($psi)

if (-not $proc.WaitForExit(60000)) {
    $proc.Kill()
    Write-Log "[WARN] Timed out after 60 seconds and was cancelled."
    Add-Content -Path $logFile -Value "RESULT: TIMEOUT"
    exit 1
}

$stdout = $proc.StandardOutput.ReadToEnd().Trim()
$stderr = $proc.StandardError.ReadToEnd().Trim()
$combined = @($stdout, $stderr) | Where-Object { $_ } | ForEach-Object { $_.Split("`n") }

foreach ($line in $combined) {
    $trimmed = $line.Trim()
    if ($trimmed) { Write-Log $trimmed }
}

if ($proc.ExitCode -eq 0) {
    Add-Content -Path $logFile -Value "RESULT: SUCCESS"
    exit 0
} else {
    Add-Content -Path $logFile -Value "RESULT: FAILED"
    exit 1
}
