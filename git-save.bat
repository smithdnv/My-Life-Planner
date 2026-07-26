@echo off
:: git-save.bat — Safe git commit + push for My Life Planner
:: Usage: git-save "your commit message"
:: Example: git-save "backup before changes"

set MSG=%~1
if "%MSG%"=="" set MSG=manual save

echo Clearing any stale git locks...
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock" del /f ".git\HEAD.lock"
if exist ".git\refs\heads\main.lock" del /f ".git\refs\heads\main.lock"

echo Committing changes...
git add .
git commit -m "%MSG%"

echo Pushing to GitHub...
git push

echo Done!
