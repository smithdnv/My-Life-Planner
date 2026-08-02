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

# --- Find pg_dump (no Docker needed, unlike Supabase CLI) ---
$pgDump = $null

# Check PATH first
$inPath = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($inPath) {
    $pgDump = $inPath.Source
} else {
    # Search common PostgreSQL install locations on Windows
    $searchRoots = @(
        "$env:ProgramFiles\PostgreSQL",
        "${env:ProgramFiles(x86)}\PostgreSQL",
        "$env:ProgramW6432\PostgreSQL"
    )
    foreach ($root in $searchRoots) {
        if (Test-Path $root) {
            $found = Get-ChildItem "$root\*\bin\pg_dump.exe" -ErrorAction SilentlyContinue | Sort-Object -Descending | Select-Object -First 1
            if ($found) { $pgDump = $found.FullName; break }
        }
    }
}

if (-not $pgDump) {
    Write-Log "[WARN] Skipped: pg_dump not found."
    Write-Log "To fix: install PostgreSQL client tools from https://www.postgresql.org/download/windows/"
    Write-Log "During install, you only need 'Command Line Tools' -- not the full server."
    Write-Log "After installing, reopen Command Prompt and run git-save again."
    Add-Content -Path $logFile -Value "RESULT: SKIPPED (pg_dump not installed)"
    exit 1
}

Write-Log "Using pg_dump: $pgDump"

# --- Check for password ---
$password = $env:SUPABASE_DB_PASSWORD
if (-not $password) {
    $password = [System.Environment]::GetEnvironmentVariable("SUPABASE_DB_PASSWORD", "User")
}

if (-not $password) {
    Write-Log "[WARN] Skipped: SUPABASE_DB_PASSWORD environment variable not set."
    Write-Log "To fix: run this once in Command Prompt (then reopen it):"
    Write-Log "  setx SUPABASE_DB_PASSWORD `"your-database-password`""
    Write-Log "Find your password: Supabase dashboard -> Project Settings -> Database"
    Add-Content -Path $logFile -Value "RESULT: SKIPPED (no password)"
    exit 1
}

# --- Build connection URL and run pg_dump ---
$encodedPassword = [Uri]::EscapeDataString($password)
$dbUrl = "postgresql://postgres.rnxaimywzatywqdzgrzj:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

Write-Log "Connecting to Supabase (60 second timeout)..."

$tempErr = [System.IO.Path]::GetTempFileName()

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName        = $pgDump
$psi.Arguments       = "`"$dbUrl`" -f `"$sqlFile`" --no-password"
$psi.UseShellExecute = $false
$psi.CreateNoWindow  = $true
$psi.RedirectStandardError = $true

$proc = [System.Diagnostics.Process]::Start($psi)
$errContent = ""

$errTask = [System.Threading.Tasks.Task]::Run([System.Func[string]]{ $proc.StandardError.ReadToEnd() })

if (-not $proc.WaitForExit(60000)) {
    $proc.Kill()
    Write-Log "[WARN] Timed out after 60 seconds and was cancelled."
    Add-Content -Path $logFile -Value "RESULT: TIMEOUT"
    exit 1
}

$errContent = $errTask.Result.Trim()

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
        Write-Log "Error: $($errContent -replace [char]10, ' ')"
    }
    Add-Content -Path $logFile -Value "RESULT: FAILED"
    exit 1
}
