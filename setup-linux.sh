#!/bin/bash
set -e

echo -e "=== Установка и запуск проекта ==="

if [ "$EUID" -ne 0 ]; then
  echo -e "Пожалуйста, запустите скрипт с правами root: sudo ./setup.sh"
  exit 1
fi

if [ -n "$SUDO_USER" ]; then
    REAL_USER="$SUDO_USER"
else
    REAL_USER=$(whoami)
fi

if command -v apt-get &> /dev/null; then
    echo -e "Обновление списка пакетов apt..."
    apt-get update
fi

if ! command -v docker &> /dev/null; then
    echo -e "Docker не найден. Установка Docker."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "Docker успешно установлен."
else
    echo -e "Docker уже установлен."
fi

if ! docker compose version &>/dev/null; then
    echo -e "Plugin docker compose не найден. Установка docker compose"
    apt-get install --reinstall docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
fi

if command -v systemctl &>/dev/null; then
    systemctl start docker 2>/dev/null || true
    systemctl enable docker 2>/dev/null || true
fi

if getent group docker >/dev/null; then
    echo -e ""
else
    groupadd docker
fi

if id -nG "$REAL_USER" | grep -qw docker; then
    echo -e "Пользователь $REAL_USER уже в группе docker."
else
    echo -e "Добавление пользователя $REAL_USER в группу docker."
    usermod -aG docker "$REAL_USER"
    newgrp docker
fi

cd "$(dirname "$0")"

if [ ! -f "docker-compose.yml" ]; then
    echo -e "Файл docker-compose.yml не найден в текущей директории. Проверьте целостность файлов проекта."
    exit 1
fi

echo -e "Проверка SSL-сертификатов..."
mkdir -p ./nginx/ssl

if [ ! -f "./nginx/ssl/cert.pem" ]; then
    echo -e "Генерация самоподписанного SSL-сертификата..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout ./nginx/ssl/key.pem \
      -out ./nginx/ssl/cert.pem \
      -subj "/C=RU/ST=Irkutst/L=Irkutsk/O=Development/CN=localhost"
    
    chmod 644 ./nginx/ssl/cert.pem ./nginx/ssl/key.pem
fi

echo -e "Запуск контейнеров"
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e " Проект успешно запущен"
    docker compose ps
else
    echo -e " Ошибка при запуске"
    exit 1
fi
