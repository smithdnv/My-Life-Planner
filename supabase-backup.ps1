param(
    [string]$datestamp,
    [string]$projectId = "rnxaimywzatywqdzgrzj"
)

$outputFile = "backups\supabase-$datestamp.sql"
$errorFile  = "backups\supabase-$datestamp-error.log"

if (-not (Test-Path "backups")) { New-Item -ItemType Directory -Path "backups" | Out-Null }

Write-Host "      Running npx supabase db dump (60 second timeout)..."

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName               = "cmd.exe"
$psi.Arguments              = "/c npx supabase db dump --project-id $projectId > `"$outputFile`" 2> `"$errorFile`""
$psi.UseShellExecute        = $false
$psi.CreateNoWindow         = $true

$proc = [System.Diagnostics.Process]::Start($psi)

if (-not $proc.WaitForExit(60000)) {
    $proc.Kill()
    Write-Host "      [WARN] Backup timed out after 60 seconds and was cancelled."
    Write-Host "      Tip: Run 'npx supabase login' to authenticate, then retry git-save."
    exit 1
}

if ($proc.ExitCode -eq 0) {
    Write-Host "      [OK] Saved: $outputFile"
    Remove-Item $errorFile -ErrorAction SilentlyContinue
    exit 0
} else {
    $errContent = Get-Content $errorFile -ErrorAction SilentlyContinue
    Write-Host "      [WARN] Backup failed. Error: $errContent"
    Write-Host "      Full log: $errorFile"
    exit 1
}
