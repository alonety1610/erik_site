@echo off
cd /d "%~dp0"
git config core.editor "echo"
git pull origin HEAD --no-edit
git add .
git commit -m "update"
git push origin HEAD
pause
