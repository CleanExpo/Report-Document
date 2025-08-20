@echo off
cls
echo.
echo ============================================================
echo    NEW PROJECT PATHWAY - Instant Setup
echo ============================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js not found. Please install from https://nodejs.org/
    echo.
    pause
    start https://nodejs.org/
    exit /b
)

:: Check for Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git not found. Please install from https://git-scm.com/
    echo.
    pause
    start https://git-scm.com/download/win
    exit /b
)

:: Get project name
set /p projectName="Enter project name (or press Enter for 'my-app'): "
if "%projectName%"=="" set projectName=my-app

echo.
echo Creating project: %projectName%
echo.

:: Create directory
if not exist %projectName% mkdir %projectName%
cd %projectName%

:: Clone repository
echo Downloading NEW PROJECT PATHWAY...
git init -b main >nul 2>nul
git remote add pathway https://github.com/yourusername/new-project-pathway.git >nul 2>nul
git fetch pathway >nul 2>nul
git checkout pathway/main -- . >nul 2>nul

:: Clean git
rd /s /q .git >nul 2>nul
git init -b main >nul 2>nul

:: Install
echo Installing dependencies...
call npm install --silent

:: Create .env
echo NODE_ENV=development > .env
echo NEXT_PUBLIC_APP_NAME=%projectName% >> .env
echo AI_SERVICE_URL=http://localhost:5051 >> .env

:: Success
cls
echo.
echo ============================================================
echo    SUCCESS! Your project is ready!
echo ============================================================
echo.
echo Next steps:
echo.
echo 1. Open Claude Code:
echo    claude .
echo.
echo 2. Select "Pathway Guide" agent
echo.
echo 3. Say "start" or paste a GitHub URL
echo.
echo 4. Answer 3 simple questions
echo.
echo 5. Watch it build your app!
echo.
echo ============================================================
echo.
echo Press any key to open Claude Code...
pause >nul

:: Try to open Claude Code
where claude >nul 2>nul
if %errorlevel% equ 0 (
    claude .
) else (
    echo Claude Code not found. Please open it manually.
    pause
)