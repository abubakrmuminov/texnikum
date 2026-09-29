# ==========================================
# Скрипт сборки и экспорта Docker-образов
# Создает готовую папку 'release' с tar-образами без исходного кода
# Автор: Abubakr Muminov
# ==========================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Сборка и экспорт Docker-образов портала  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Проверка работы Docker Daemon
try {
    docker info | Out-Null
} catch {
    Write-Host "`n[ОШИБКА] Docker Daemon не запущен!" -ForegroundColor Red
    Write-Host "Пожалуйста, запустите Docker Desktop и повторите запуск этого скрипта.`n" -ForegroundColor Yellow
    exit 1
}

# 2. Сборка образов
Write-Host "`n[1/4] Сборка производственных Docker-образов..." -ForegroundColor Green
docker compose build

# 3. Подготовка папки релиза
$releaseDir = Join-Path $PSScriptRoot "..\release"
if (-not (Test-Path $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir | Out-Null
}

# 4. Сохранение образов в tar-архивы
Write-Host "`n[2/4] Экспорт образа API в release/college-portal-api.tar..." -ForegroundColor Green
docker save -o (Join-Path $releaseDir "college-portal-api.tar") college-portal-api:latest

Write-Host "`n[3/4] Экспорт образа Web в release/college-portal-web.tar..." -ForegroundColor Green
docker save -o (Join-Path $releaseDir "college-portal-web.tar") college-portal-web:latest

# 5. Копирование файлов конфигурации для клиента
Write-Host "`n[4/4] Подготовка конфигурации для клиента..." -ForegroundColor Green
Copy-Item (Join-Path $PSScriptRoot "..\docker-compose.prod.yml") (Join-Path $releaseDir "docker-compose.yml") -Force
Copy-Item (Join-Path $PSScriptRoot "..\.env.example") (Join-Path $releaseDir ".env.example") -Force

# Инструкция для техникума
$deployReadme = @"
# Инструкция по развертыванию портала / Portalni o'rnatish yo'riqnomasi

В этом архиве находятся готовые скомпилированные образы веб-портала техникума.
Для работы требуется только установленный Docker и Docker Compose. Исходный код не требуется.

## Быстрый запуск на сервере техникума:

1. Скопируйте файл `.env.example` в `.env` и настройте параметры (Supabase URL, ключи):
   cp .env.example .env

2. Загрузите образы в Docker:
   docker load -i college-portal-api.tar
   docker load -i college-portal-web.tar

3. Запустите сервисы:
   docker compose up -d

4. Портал будет доступен:
   - Публичный сайт и админка: http://localhost:3000
   - REST API: http://localhost:4000/api/v1
   - Swagger документация API: http://localhost:4000/api/docs

Архитектор платформы: Abubakr Muminov
"@

Set-Content -Path (Join-Path $releaseDir "README.txt") -Value $deployReadme -Encoding UTF8

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " [ГОТОВО] Все образы успешно экспортированы!" -ForegroundColor Green
Write-Host " Папка для передачи клиенту: $releaseDir" -ForegroundColor Yellow
Write-Host " В ней лежат только .tar образы и docker-compose.yml, исходный код отсутствует!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan
