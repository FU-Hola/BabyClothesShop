-- Keep the existing statuses and allow warehouse cancellation of an order.
-- Hibernate ddl-auto=update does not replace existing enum CHECK constraints.
SET LOCAL lock_timeout = '5s';

ALTER TABLE shop.orders
    DROP CONSTRAINT IF EXISTS orders_status_check,
    ADD CONSTRAINT orders_status_check CHECK (
        status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'PACKED',
                   'SHIPPING', 'DELIVERED', 'CANCELLED')
    );
