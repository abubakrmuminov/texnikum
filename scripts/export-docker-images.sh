#!/bin/bash
set -e

echo "=========================================="
echo "  Сборка и экспорт Docker-образов портала  "
echo "=========================================="

# Проверка Docker
if ! docker info > /dev/null 2>&1; then
    echo "[ОШИБКА] Docker Daemon не запущен!"
    exit 1
fi

echo -e "\n[1/4] Сборка производственных Docker-образов..."
docker compose build

RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/release"
mkdir -p "$RELEASE_DIR"

echo -e "\n[2/4] Экспорт образа API в release/college-portal-api.tar..."
docker save -o "$RELEASE_DIR/college-portal-api.tar" college-portal-api:latest

echo -e "\n[3/4] Экспорт образа Web в release/college-portal-web.tar..."
docker save -o "$RELEASE_DIR/college-portal-web.tar" college-portal-web:latest

echo -e "\n[4/4] Подготовка конфигурации для клиента..."
cp "$(dirname "${BASH_SOURCE[0]}")/../docker-compose.prod.yml" "$RELEASE_DIR/docker-compose.yml"
cp "$(dirname "${BASH_SOURCE[0]}")/../.env.example" "$RELEASE_DIR/.env.example"

cat << 'EOF' > "$RELEASE_DIR/README.txt"
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
EOF

echo "=========================================="
echo " [ГОТОВО] Все образы успешно экспортированы в: $RELEASE_DIR"
echo "=========================================="
