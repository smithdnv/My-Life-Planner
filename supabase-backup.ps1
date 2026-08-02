param(
    [string]$datestamp
)

$sqlFile = "backups\supabase-$datestamp.sql"
$logFile = "backups\supabase-$datestamp.log"
$runTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

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

# --- Check for password ---
$password = $env:SUPABASE_DB_PASSWORD

if (-not $password) {
    Write-Log "[WARN] Skipped: SUPABASE_DB_PASSWORD environment variable not set."
    Write-Log "To fix: run this once in Command Prompt (then reopen it):"
    Write-Log "  setx SUPABASE_DB_PASSWORD `"your-database-password`""
    Write-Log "Find your password: Supabase dashboard -> Project Settings -> Database"
    exit 1
}

# --- Build connection URL ---
$encodedPassword = [Uri]::EscapeDataString($password)
$dbUrl = "postgresql://postgres.rnxaimywzatywqdzgrzj:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

Write-Log "Connecting to Supabase (60 second timeout)..."

# --- Run dump ---
$tempErr = [System.IO.Path]::GetTempFileName()

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName        = "cmd.exe"
$psi.Arguments       = "/c npx supabase db dump --db-url `"$dbUrl`" -f `"$sqlFile`" 2>`"$tempErr`""
$psi.UseShellExecute = $false
$psi.CreateNoWindow  = $true

$proc = [System.Diagnostics.Process]::Start($psi)

if (-not $proc.WaitForExit(60000)) {
    $proc.Kill()
    Write-Log "[WARN] Timed out after 60 seconds and was cancelled."
    Add-Content -Path $logFile -Value "RESULT: TIMEOUT"
    Remove-Item $tempErr -ErrorAction SilentlyContinue
    exit 1
}

# --- Log result ---
$errContent = (Get-Content $tempErr -Raw -ErrorAction SilentlyContinue).Trim()
Remove-Item $tempErr -ErrorAction SilentlyContinue

if ($proc.ExitCode -eq 0) {
    $size = (Get-Item $sqlFile -ErrorAction SilentlyContinue).Length
    Write-Log "[OK] Saved: $sqlFile ($size bytes)"
    Add-Content -Path $logFile -Value "RESULT: SUCCESS"
    if ($errContent) {
        Add-Content -Path $logFile -Value "NOTES: $errContent"
    }
    exit 0
} else {
    Write-Log "[WARN] Backup failed (exit code: $($proc.ExitCode))"
    if ($errContent) {
        Write-Log "Error: $($errContent -replace `"`n`", ' ')"
    }
    Add-Content -Path $logFile -Value "RESULT: FAILED"
    exit 1
}
