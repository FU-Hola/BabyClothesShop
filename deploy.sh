#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ ! -f backend/project_group2/.env ]]; then
    echo "Missing backend/project_group2/.env" >&2
    exit 1
fi

compose=(docker compose --env-file backend/project_group2/.env
    -f docker-compose.yaml -f compose.deploy.yaml)
"${compose[@]}" config --quiet

(cd backend/project_group2 && bash ./mvnw -DskipTests clean package)
(cd frontend && VITE_API_BASE_URL=/api/v1 \
    VITE_WAREHOUSE_API_URL=/warehouse-staff npm run build)

"${compose[@]}" up -d --wait --wait-timeout 120 postgres
mkdir -p backups
backup="backups/sba-before-migrate-$(date +%Y%m%d-%H%M%S).dump"
(umask 077; "${compose[@]}" exec -T postgres sh -c \
    'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup")
"${compose[@]}" exec -T postgres pg_restore --list < "$backup" > /dev/null
echo "Database backup: $backup"
"${compose[@]}" exec -T postgres sh -c \
    'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
    < docker/postgres/prepare-flyway.sql

"${compose[@]}" up -d --build --wait --wait-timeout 120 postgres backend web
"${compose[@]}" ps
echo "Local web: http://127.0.0.1:8088"
echo "Cloudflare service: HTTP / sba-web:80 (connector must join proxy_net)"
