@echo off
echo Starting Memory Service in background...

REM Start PostgreSQL
docker-compose up -d

REM Wait for database
timeout /t 3 /nobreak >nul

REM Start uvicorn in background (no window)
start /B pythonw -c "import uvicorn; uvicorn.run('memory_service.main:app', host='127.0.0.1', port=9420)"

echo.
echo Memory Service started on http://localhost:9420
echo Running in background - no terminal needed.
echo.
echo To stop: taskkill /F /IM pythonw.exe
