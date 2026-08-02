@echo off
setlocal enabledelayedexpansion
:: git-save.bat — Safe git commit + push, with Supabase database backup
:: Usage: git-save "your commit message"

set MSG=%~1
if "%MSG%"=="" set MSG=manual save

set ERRORS=0

:: Get current date in YYYY-MM-DD format
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set datestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%

echo ============================================
echo  My Life Planner — git-save
echo  %date% %time%
echo ============================================

:: ─── STEP 1: Clear stale git locks ──────────────────────────
echo.
echo [1/3] Checking for stale git locks...
set LOCKS_CLEARED=0
if exist ".git\index.lock"           ( del /f ".git\index.lock"           & echo       Cleared: index.lock           & set LOCKS_CLEARED=1 )
if exist ".git\HEAD.lock"            ( del /f ".git\HEAD.lock"            & echo       Cleared: HEAD.lock            & set LOCKS_CLEARED=1 )
if exist ".git\refs\heads\main.lock" ( del /f ".git\refs\heads\main.lock" & echo       Cleared: refs\heads\main.lock & set LOCKS_CLEARED=1 )
if %LOCKS_CLEARED%==0 ( echo       [OK] No stale locks found. ) else ( echo       [OK] Stale locks cleared. )

:: ─── STEP 2: Git commit + push ───────────────────────────────
echo.
echo [2/3] Saving code to GitHub...

echo       Running: git add .
git add . 2>&1
if %errorlevel% neq 0 (
    echo       [ERROR] git add failed.
    set ERRORS=1
    goto :step3
)
echo       [OK] Files staged.

echo       Running: git commit
git commit -m "%MSG%" 2>&1
set COMMIT_ERR=%errorlevel%
if %COMMIT_ERR%==0 (
    echo       [OK] Committed successfully.
) else if %COMMIT_ERR%==1 (
    echo       [INFO] Nothing new to commit.
) else (
    echo       [ERROR] git commit failed ^(exit code: %COMMIT_ERR%^).
    set ERRORS=1
    goto :step3
)

echo       Running: git push
git push 2>&1
if %errorlevel%==0 (
    echo       [OK] Pushed to GitHub.
) else (
    echo       [ERROR] git push failed. Check internet connection or run "git-save" again.
    set ERRORS=1
)

:: ─── STEP 3: Supabase database backup (with 60s timeout) ─────
:step3
echo.
echo [3/3] Backing up Supabase database ^(60 second timeout^)...
echo       Please wait...

if not exist "backups" mkdir backups

:: Use PowerShell to run with a timeout
powershell -NonInteractive -Command ^
  "$proc = Start-Process 'npx' -ArgumentList 'supabase db dump --project-id rnxaimywzatywqdzgrzj' -RedirectStandardOutput 'backups\supabase-%datestamp%.sql' -RedirectStandardError 'backups\supabase-%datestamp%-error.log' -NoNewWindow -PassThru; ^
  if (-not $proc.WaitForExit(60000)) { ^
    $proc.Kill(); ^
    Write-Host '      [WARN] Supabase backup timed out after 60 seconds and was cancelled.'; ^
    Write-Host '      Tip: Run \"npx supabase login\" if not authenticated, then retry.'; ^
    exit 1 ^
  } elseif ($proc.ExitCode -eq 0) { ^
    Write-Host '      [OK] Database backup saved: backups\supabase-%datestamp%.sql' ^
  } else { ^
    Write-Host '      [WARN] Supabase backup failed. Check backups\supabase-%datestamp%-error.log'; ^
    exit 1 ^
  }"

if %errorlevel% neq 0 set ERRORS=1

:: ─── SUMMARY ─────────────────────────────────────────────────
echo.
echo ============================================
if %ERRORS%==0 (
    echo  ALL STEPS COMPLETED SUCCESSFULLY
) else (
    echo  COMPLETED WITH WARNINGS/ERRORS
    echo  Review the [WARN] and [ERROR] lines above.
)
echo ============================================
echo.
