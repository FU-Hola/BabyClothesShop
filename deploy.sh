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

(cd backend/project_group2 && bash ./mvnw -DskipTests package)
(cd frontend && VITE_API_BASE_URL=/api \
    VITE_WAREHOUSE_API_URL=/api/v1/warehouse-staff npm run build)

"${compose[@]}" up -d --build --wait --wait-timeout 120 postgres backend mock web
"${compose[@]}" ps
echo "Local web: http://127.0.0.1:8088"
echo "Cloudflare service: HTTP / sba-web:80 (connector must join proxy_net)"
