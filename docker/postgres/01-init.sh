#!/bin/sh
set -eu

# The official entrypoint runs this only when initializing an empty volume.
# psql quotes values/identifiers instead of interpolating shell text into SQL.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
\getenv app_user DB_USERNAME
\getenv app_password DB_PASSWORD
\getenv migration_user DB_MIGRATION_USERNAME
\getenv migration_password DB_MIGRATION_PASSWORD
\getenv database POSTGRES_DB

CREATE ROLE :"app_user" LOGIN PASSWORD :'app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE ROLE :"migration_user" LOGIN PASSWORD :'migration_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
REVOKE ALL ON DATABASE :"database" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"database" TO :"app_user", :"migration_user";
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA shop AUTHORIZATION :"migration_user";
-- The current application.yaml uses Hibernate ddl-auto=create.
GRANT USAGE, CREATE ON SCHEMA shop TO :"app_user";
ALTER ROLE :"app_user" IN DATABASE :"database" SET search_path TO shop;
ALTER ROLE :"migration_user" IN DATABASE :"database" SET search_path TO shop;
ALTER DEFAULT PRIVILEGES FOR ROLE :"migration_user" IN SCHEMA shop
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"migration_user" IN SCHEMA shop
    GRANT USAGE, SELECT ON SEQUENCES TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"app_user" IN SCHEMA shop
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"migration_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"app_user" IN SCHEMA shop
    GRANT USAGE, SELECT ON SEQUENCES TO :"migration_user";
SQL
