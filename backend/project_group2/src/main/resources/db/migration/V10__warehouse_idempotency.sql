-- A key belongs to an authenticated actor across all warehouse write endpoints.
-- The reservation, stock/receipt changes and response commit in one transaction.
CREATE TABLE shop.warehouse_idempotency (
    actor_id uuid NOT NULL REFERENCES shop.users(id),
    idempotency_key varchar(128) NOT NULL,
    operation varchar(160) NOT NULL,
    request_hash varchar(64) NOT NULL,
    response_status integer,
    response_body text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_warehouse_idempotency PRIMARY KEY (actor_id, idempotency_key),
    CONSTRAINT ck_warehouse_idempotency_response CHECK (
        (response_status IS NULL AND response_body IS NULL) OR
        (response_status IS NOT NULL AND response_status BETWEEN 200 AND 299 AND response_body IS NOT NULL)
    )
);
