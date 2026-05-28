#!/bin/bash
set -e

echo -e "=== Установка и запуск проекта (macOS) ==="

if ! command -v brew &> /dev/null; then
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -f /usr/local/bin/brew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
fi

if ! command -v brew &> /dev/null; then
    echo -e "Homebrew не найден. Установка Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -f /usr/local/bin/brew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo -e "Homebrew доступен и готов к работе."
fi

if ! command -v docker &> /dev/null; then
    echo -e "Docker не найден. Установка Docker Desktop через Homebrew..."
    brew install --cask docker
    echo -e "Docker успешно установлен."
else
    echo -e "Docker уже установлен."
fi

echo -e "Проверка статуса Docker daemon..."
if ! docker info &>/dev/null; then
    echo -e "Запуск Docker Desktop..."
    open -a Docker
    
    counter=0
    max_retries=30
    
    while ! docker info &>/dev/null; do
        echo -n "."
        sleep 2
        counter=$((counter + 1))
        if [ "$counter" -ge "$max_retries" ]; then
            echo -e "\n[Ошибка] Не удалось запустить Docker Desktop."
            echo -e "Пожалуйста, откройте Docker Desktop вручную из Applications и завершите его настройку."
            exit 1
        fi
    done
    echo -e "\nDocker успешно запущен."
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
      -subj "/C=RU/ST=Irkutsk/L=Irkutsk/O=Development/CN=localhost"
    chmod 644 ./nginx/ssl/key.pem ./nginx/ssl/cert.pem
fi

echo -e "Запуск контейнеров..."
if docker compose up -d --build; then
    echo -e " Проект успешно запущен"
    docker compose ps
else
    echo -e " Ошибка при запуске docker compose"
    exit 1
fi
