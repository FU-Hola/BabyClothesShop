-- V1-V7 are immutable. Reconcile legacy Hibernate-generated constraint names
-- as well as databases created entirely by Flyway. No application rows change.
SET LOCAL lock_timeout = '10s';

DO $$
DECLARE
    target text;
    item record;
    status_column smallint;
BEGIN
    FOREACH target IN ARRAY ARRAY['orders', 'goods_issues'] LOOP
        SELECT attnum INTO STRICT status_column
        FROM pg_attribute
        WHERE attrelid = format('shop.%I', target)::regclass AND attname = 'status';
        -- A stale ORM CHECK can still reject CANCELLED even after adding a
        -- second CHECK. Replace every CHECK involving the status column.
        FOR item IN SELECT conname FROM pg_constraint
            WHERE conrelid = format('shop.%I', target)::regclass
              AND contype = 'c' AND status_column = ANY(conkey)
        LOOP
            EXECUTE format('ALTER TABLE shop.%I DROP CONSTRAINT %I', target, item.conname);
        END LOOP;
    END LOOP;
END $$;

-- Default DML grants also apply when Flyway creates its history table on a
-- fresh database. Only the migrator may change that history.
DO $$
DECLARE item record;
BEGIN
    FOR item IN SELECT DISTINCT grantee FROM information_schema.table_privileges
        WHERE table_schema = 'shop' AND table_name = 'flyway_schema_history'
          AND grantee <> current_user
    LOOP
        EXECUTE format('REVOKE ALL ON TABLE shop.flyway_schema_history FROM %s',
            CASE WHEN item.grantee = 'PUBLIC' THEN 'PUBLIC' ELSE quote_ident(item.grantee) END);
    END LOOP;
END $$;

ALTER TABLE shop.orders ADD CONSTRAINT orders_status_check CHECK (
    status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'PACKED',
               'SHIPPING', 'DELIVERED', 'CANCELLED')
);
ALTER TABLE shop.goods_issues ADD CONSTRAINT goods_issues_status_check CHECK (
    status IN ('PENDING', 'PICKING', 'PACKED', 'EXPORTED', 'CANCELLED')
);

DO $$
DECLARE
    item record;
    order_column smallint;
    order_item_column smallint;
BEGIN
    SELECT attnum INTO STRICT order_column FROM pg_attribute
    WHERE attrelid = 'shop.goods_issues'::regclass AND attname = 'order_id';
    SELECT attnum INTO STRICT order_item_column FROM pg_attribute
    WHERE attrelid = 'shop.goods_issue_items'::regclass AND attname = 'order_item_id';

    -- Single-column uniqueness prevents keeping a cancelled issue alongside
    -- its replacement. Constraint names differ across former ORM databases.
    FOR item IN SELECT conrelid::regclass AS tbl, conname FROM pg_constraint
        WHERE contype = 'u' AND (
            (conrelid = 'shop.goods_issues'::regclass AND conkey = ARRAY[order_column]) OR
            (conrelid = 'shop.goods_issue_items'::regclass AND conkey = ARRAY[order_item_column])
        )
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', item.tbl, item.conname);
    END LOOP;

    -- Also replace standalone unique indexes on order_id, including duplicate
    -- partial indexes from manual fixes, with one canonical partial index.
    FOR item IN SELECT i.indexrelid::regclass AS idx FROM pg_index i
        WHERE i.indrelid = 'shop.goods_issues'::regclass
          AND i.indisunique AND NOT i.indisprimary AND i.indnkeyatts = 1
          AND i.indkey[0] = order_column
    LOOP
        EXECUTE format('DROP INDEX %s', item.idx);
    END LOOP;
    FOR item IN SELECT i.indexrelid::regclass AS idx FROM pg_index i
        WHERE i.indrelid = 'shop.goods_issue_items'::regclass
          AND i.indisunique AND NOT i.indisprimary AND i.indnkeyatts = 1
          AND i.indkey[0] = order_item_column
    LOOP
        EXECUTE format('DROP INDEX %s', item.idx);
    END LOOP;
END $$;

CREATE UNIQUE INDEX uk_goods_issues_active_order
    ON shop.goods_issues(order_id) WHERE status <> 'CANCELLED';

-- Canonicalize equivalent composite UNIQUE constraints instead of stacking
-- another index on databases previously managed by Hibernate.
DO $$
DECLARE
    target record;
    item record;
    column_numbers smallint[];
BEGIN
    FOR target IN SELECT * FROM (VALUES
        ('goods_issue_items', ARRAY['goods_issue_id', 'order_item_id'], 'uk_issue_order_item'),
        ('goods_receipt_items', ARRAY['goods_receipt_id', 'variant_id'], 'uk_receipt_variant'),
        ('inventory', ARRAY['variant_id'], 'uk_inventory_variant')
    ) AS t(tbl, columns, constraint_name)
    LOOP
        SELECT array_agg(attnum ORDER BY attnum) INTO column_numbers
        FROM pg_attribute
        WHERE attrelid = format('shop.%I', target.tbl)::regclass
          AND attname = ANY(target.columns);
        FOR item IN SELECT conname FROM pg_constraint
            WHERE conrelid = format('shop.%I', target.tbl)::regclass AND contype = 'u'
              AND (SELECT array_agg(n ORDER BY n) FROM unnest(conkey) AS n) = column_numbers
        LOOP
            EXECUTE format('ALTER TABLE shop.%I DROP CONSTRAINT %I', target.tbl, item.conname);
        END LOOP;
        EXECUTE format('ALTER TABLE shop.%I ADD CONSTRAINT %I UNIQUE (%s)',
            target.tbl, target.constraint_name,
            (SELECT string_agg(format('%I', col), ', ') FROM unnest(target.columns) AS col));
    END LOOP;
END $$;
