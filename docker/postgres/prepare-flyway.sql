-- Run as the database administrator, never as the application account.
-- Existing volumes do not rerun 01-init.sh. This idempotent ownership handoff
-- lets the separate Flyway role migrate former Hibernate-owned tables.
\set ON_ERROR_STOP on
\getenv app_user DB_USERNAME
\getenv migration_user DB_MIGRATION_USERNAME
\getenv database POSTGRES_DB

BEGIN;
SET LOCAL lock_timeout = '10s';
SELECT set_config('app.migration_role', :'migration_user', true);
SELECT set_config('app.runtime_role', :'app_user', true);
DO $$
DECLARE item record;
BEGIN
    IF current_setting('app.migration_role') = current_setting('app.runtime_role') THEN
        RAISE EXCEPTION 'Flyway and runtime must use separate roles';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles
               WHERE rolname = current_setting('app.runtime_role')
                 AND (rolsuper OR rolcreaterole OR rolcreatedb))
       OR pg_has_role(current_setting('app.runtime_role'), current_setting('app.migration_role'), 'MEMBER') THEN
        RAISE EXCEPTION 'Runtime role must not have administrator or migrator privileges';
    END IF;
    FOR item IN SELECT c.relname, pg_get_userbyid(c.relowner) AS owner
        FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='shop' AND c.relkind IN ('r','p','S')
    LOOP
        IF item.owner NOT IN (current_setting('app.migration_role'), current_setting('app.runtime_role')) THEN
            RAISE EXCEPTION 'Unexpected owner % for shop.%', item.owner, item.relname;
        END IF;
    END LOOP;
    FOR item IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='shop' AND c.relkind IN ('r','p')
    LOOP
        EXECUTE format('ALTER TABLE shop.%I OWNER TO %I', item.relname, current_setting('app.migration_role'));
    END LOOP;
    FOR item IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='shop' AND c.relkind='S'
    LOOP
        EXECUTE format('ALTER SEQUENCE shop.%I OWNER TO %I', item.relname, current_setting('app.migration_role'));
    END LOOP;
END $$;
ALTER SCHEMA shop OWNER TO :"migration_user";
REVOKE CREATE ON SCHEMA shop FROM PUBLIC, :"app_user";
GRANT USAGE ON SCHEMA shop TO :"app_user";
GRANT CONNECT ON DATABASE :"database" TO :"app_user", :"migration_user";
GRANT TEMPORARY ON DATABASE :"database" TO :"migration_user";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA shop TO :"app_user";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA shop TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"migration_user" IN SCHEMA shop
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"migration_user" IN SCHEMA shop
    GRANT USAGE, SELECT ON SEQUENCES TO :"app_user";
DO $$
DECLARE item record;
BEGIN
    FOR item IN SELECT tablename FROM pg_tables
        WHERE schemaname='shop' AND tablename LIKE 'flyway_schema_history%'
    LOOP
        EXECUTE format('REVOKE ALL ON TABLE shop.%I FROM %I', item.tablename, current_setting('app.runtime_role'));
    END LOOP;
END $$;
COMMIT;
