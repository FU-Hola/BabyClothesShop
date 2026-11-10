SET LOCAL lock_timeout = '10s';

ALTER TABLE shop.inventory ADD COLUMN reserved_quantity bigint NOT NULL DEFAULT 0;
ALTER TABLE shop.inventory ADD CONSTRAINT inventory_reserved_balance_check
    CHECK (reserved_quantity >= 0 AND quantity >= reserved_quantity);
ALTER TABLE shop.carts ADD COLUMN revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0);
ALTER TABLE shop.orders
    ADD COLUMN cart_id uuid REFERENCES shop.carts(id),
    ADD COLUMN cart_revision bigint,
    ADD COLUMN payment_expires_at timestamptz,
    ADD CONSTRAINT uk_orders_cart_revision UNIQUE(cart_id,cart_revision),
    ADD CONSTRAINT orders_checkout_identity_check CHECK ((cart_id IS NULL) = (cart_revision IS NULL));
ALTER TABLE shop.orders DROP CONSTRAINT orders_status_check;
ALTER TABLE shop.orders ADD CONSTRAINT orders_status_check CHECK
    (status IN ('PENDING_PAYMENT','EXPIRED','PENDING_CONFIRMATION','CONFIRMED','PACKED','SHIPPING','DELIVERED','CANCELLED'));
DO $$
DECLARE item record; column_number smallint;
BEGIN
    SELECT attnum INTO STRICT column_number FROM pg_attribute
      WHERE attrelid='shop.orders'::regclass AND attname='payment_status';
    FOR item IN SELECT conname FROM pg_constraint WHERE conrelid='shop.orders'::regclass
      AND contype='c' AND column_number=ANY(conkey)
    LOOP EXECUTE format('ALTER TABLE shop.orders DROP CONSTRAINT %I',item.conname); END LOOP;
END $$;
ALTER TABLE shop.orders ADD CONSTRAINT orders_payment_status_check
    CHECK(payment_status IN ('UNPAID','PAID','FAILED','EXPIRED'));
ALTER TABLE shop.orders ADD CONSTRAINT orders_pending_payment_check CHECK
    (status <> 'PENDING_PAYMENT' OR (payment_status='UNPAID' AND payment_expires_at IS NOT NULL AND cart_id IS NOT NULL));
CREATE INDEX idx_orders_payment_expiry ON shop.orders(payment_expires_at,id) WHERE status='PENDING_PAYMENT';
CREATE INDEX idx_orders_pending_cart ON shop.orders(cart_id) WHERE status='PENDING_PAYMENT';
CREATE SEQUENCE shop.order_code_seq;
SELECT setval('shop.order_code_seq', GREATEST(COALESCE((
    SELECT max(substring(order_code FROM '^ORD-([0-9]{12})$')::bigint)
    FROM shop.orders WHERE order_code ~ '^ORD-[0-9]{12}$'
),0)+1,1),false);

CREATE TABLE shop.inventory_reservations (
    order_item_id uuid PRIMARY KEY REFERENCES shop.order_items(id),
    order_id uuid NOT NULL REFERENCES shop.orders(id),
    variant_id uuid NOT NULL REFERENCES shop.product_variants(id),
    quantity bigint NOT NULL CHECK(quantity>0),
    status varchar(16) NOT NULL CHECK(status IN ('HELD','COMMITTED','CONSUMED','RELEASED')),
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    CHECK(status <> 'HELD' OR expires_at IS NOT NULL)
);
CREATE INDEX idx_inventory_reservations_order ON shop.inventory_reservations(order_id,variant_id);
CREATE TABLE shop.inventory_ledger (
    id bigserial PRIMARY KEY,
    variant_id uuid NOT NULL REFERENCES shop.product_variants(id),
    source_line_id uuid NOT NULL,
    effect varchar(16) NOT NULL CHECK(effect IN ('OPENING','RESERVE','RELEASE','SHIP','RECEIVE')),
    quantity_delta bigint NOT NULL,
    reserved_delta bigint NOT NULL,
    document_id uuid,
    actor_id uuid REFERENCES shop.users(id),
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uk_inventory_ledger_effect UNIQUE(source_line_id,effect)
);
CREATE INDEX idx_inventory_ledger_variant ON shop.inventory_ledger(variant_id,id);
CREATE FUNCTION shop.inventory_ledger_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Inventory ledger is append-only'; END $$;
CREATE TRIGGER inventory_ledger_immutable BEFORE UPDATE OR DELETE ON shop.inventory_ledger
    FOR EACH ROW EXECUTE FUNCTION shop.inventory_ledger_immutable();

-- Do not fabricate stock to satisfy existing paid demand. Migration rolls back on shortage.
DO $$
BEGIN
    IF EXISTS (
        SELECT oi.variant_id FROM shop.order_items oi JOIN shop.orders o ON o.id=oi.order_id
        LEFT JOIN shop.inventory i ON i.variant_id=oi.variant_id
        WHERE o.payment_status='PAID' AND o.status IN ('PENDING_CONFIRMATION','CONFIRMED','PACKED')
        GROUP BY oi.variant_id,i.quantity HAVING i.quantity IS NULL OR sum(oi.quantity)>i.quantity
    ) THEN RAISE EXCEPTION 'Reservation backfill blocked: reconcile stock for existing paid open orders'; END IF;
    IF EXISTS (SELECT 1 FROM shop.orders o WHERE o.payment_status='PAID'
        AND o.status IN ('PENDING_CONFIRMATION','CONFIRMED','PACKED')
        AND NOT EXISTS (SELECT 1 FROM shop.order_items oi WHERE oi.order_id=o.id))
    THEN RAISE EXCEPTION 'Reservation backfill blocked: paid open order has no items'; END IF;
END $$;
INSERT INTO shop.inventory_ledger(variant_id,source_line_id,effect,quantity_delta,reserved_delta)
SELECT variant_id,id,'OPENING',quantity,0 FROM shop.inventory;
INSERT INTO shop.inventory_reservations(order_item_id,order_id,variant_id,quantity,status)
SELECT oi.id,o.id,oi.variant_id,oi.quantity,'COMMITTED' FROM shop.order_items oi
JOIN shop.orders o ON o.id=oi.order_id
WHERE o.payment_status='PAID' AND o.status IN ('PENDING_CONFIRMATION','CONFIRMED','PACKED');
UPDATE shop.inventory i SET reserved_quantity=r.quantity FROM
    (SELECT variant_id,sum(quantity) AS quantity FROM shop.inventory_reservations GROUP BY variant_id) r
WHERE r.variant_id=i.variant_id;
INSERT INTO shop.inventory_ledger(variant_id,source_line_id,effect,quantity_delta,reserved_delta,document_id)
SELECT variant_id,order_item_id,'RESERVE',0,quantity,order_id FROM shop.inventory_reservations;
