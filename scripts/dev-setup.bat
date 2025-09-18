@echo off
setlocal enabledelayedexpansion

REM Acquisitions Development Setup Script for Windows
REM This script helps you set up the development environment quickly

echo 🚀 Setting up Acquisitions Development Environment
echo ==================================================

REM Check if Docker is running
docker info >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if .env.dev exists
if not exist ".env.dev" (
    echo 📋 Creating .env.dev from template...
    copy .env.development .env.dev >nul
    
    echo.
    echo ⚠️  IMPORTANT: Please edit .env.dev with your actual Neon credentials:
    echo    - NEON_API_KEY
    echo    - NEON_PROJECT_ID
    echo    - PARENT_BRANCH_ID
    echo    - ARCJET_KEY
    echo.
    
    pause
)

REM Create .neon_local directory
if not exist ".neon_local" (
    mkdir .neon_local
    echo 📁 Created .neon_local directory
)

REM Add .neon_local to .gitignore if not exists
findstr /c:".neon_local/" .gitignore >nul 2>&1
if !errorlevel! neq 0 (
    echo .neon_local/>> .gitignore
    echo 📝 Added .neon_local/ to .gitignore
)

REM Start the development environment
echo 🐳 Starting development environment...
docker-compose --env-file .env.dev -f docker-compose.dev.yml up --build -d

echo.
echo ✅ Development environment started successfully!
echo.
echo 🌐 Access your application:
echo    Application: http://localhost:3000
echo    Health Check: http://localhost:3000/health
echo    API: http://localhost:3000/api
echo.
echo 📊 Useful commands:
echo    View logs: docker-compose -f docker-compose.dev.yml logs -f
echo    Stop: docker-compose -f docker-compose.dev.yml down
echo    Restart: docker-compose -f docker-compose.dev.yml restart
echo.
echo 🎉 Happy coding!
pause