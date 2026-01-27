@echo off
echo ============================================================
echo   SENTRA MEMORY SERVICE
echo   Persistent Memory for AI Agents
echo ============================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

REM Start PostgreSQL if not running
echo Starting PostgreSQL with pgvector...
docker-compose up -d

REM Wait for database
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

REM Start the service
echo.
echo Starting Memory Service on http://localhost:9420
echo API Docs: http://localhost:9420/docs
echo.
echo Press Ctrl+C to stop
echo ============================================================
echo.

python -m uvicorn memory_service.main:app --host 127.0.0.1 --port 9420 --reload
