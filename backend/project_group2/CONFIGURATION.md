# Backend configuration

Run commands from `backend/project_group2` (the directory containing pom.xml).
Spring Boot reads `src/main/resources/application.yaml`; `properties.yaml` is
not an automatically loaded Spring Boot filename.

## Local setup

The local `.env` has generated credentials and must not be committed. A new
checkout should copy `.env.example` to `.env`, provision its own database/roles,
and replace all CHANGE_ME values. `.env` uses Java properties syntax: no
`export`, no surrounding quotes, and escape backslashes when necessary.
OS environment variables override values imported from `.env`.

```sh
mvn test
mvn spring-boot:run
```

The dotenv import supports both the repository root and this backend directory
as the IDE working directory. A `.env` in the current directory takes precedence.
For any other working directory, explicitly supply the absolute dotenv import, for example
`--spring.config.import=file:/absolute/path/to/.env[.properties]`.

## SBA PostgreSQL

Use the project-owned `../../docker-compose.yaml` at the repository root. Full commands and
lifecycle details: [docker/postgres/README.md](../../docker/postgres/README.md).

```sh
# Run from the repository root:
docker compose --env-file backend/project_group2/.env up -d --wait postgres
```

Container `sba-postgres` publishes `127.0.0.1:5433` and keeps data in its own
`sba_postgres-data` volume. The database/user are read from the backend `.env`
(currently `sba_project` / `sa`). The `shop` schema and migration account are
created on first initialization. Existing user passwords are retained. A new
Docker administrator password is stored as `POSTGRES_PASSWORD` in `.env`.

The application role has CREATE on schema shop to support your current
`ddl-auto: create`. Existing PostgreSQL containers are separate from this stack.

## Operational defaults

Your current configuration uses Hibernate `ddl-auto: create` and also enables
Flyway. Hibernate may recreate entity tables on startup; this choice was retained.
Coordinate DDL ownership before adding business migrations. Destructive Flyway clean,
automatic baselining and out-of-order migrations are disabled. Business tables
are not created until reviewed SQL migrations are added. Hikari has bounded
pool/timeouts; connections use UTC for Hibernate JDBC operations. Open Session
in View and SQL/bind logging are disabled. Shutdown drains for up to 30 seconds.
HTTP error responses do not expose stack traces, exception names or messages.

Spring Security dependencies are currently commented out in your pom.xml.
The existing security properties remain in YAML, but they do not activate
authentication without Spring Security. This choice was retained.

## Production deployment

Inject credentials with environment variables or a secret manager. Use a
separate database and unique credentials per environment. Set DB_SSL_MODE to
verify-full with a trusted PostgreSQL CA configured, and SESSION_COOKIE_SECURE
true behind HTTPS. Configure trusted proxy headers only for a controlled
proxy boundary. Tune pool limits against total replicas and database capacity.
For stricter isolation, run migrations in a deployment job and set
SPRING_FLYWAY_ENABLED=false in runtime instances so they receive only runtime
credentials. Configure backups/restore checks and monitoring separately.

No mail, payment or JWT secrets are invented because those integrations do not
yet exist in this backend. Add their required validated configuration alongside
the actual implementations.

Reference: https://docs.spring.io/spring-boot/reference/features/external-config.html
