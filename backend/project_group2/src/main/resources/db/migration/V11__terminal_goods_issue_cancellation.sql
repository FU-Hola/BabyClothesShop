-- A cancelled issue ends its order. Keep its audit on the order as well.
ALTER TABLE shop.orders
    ADD COLUMN cancelled_by uuid REFERENCES shop.users(id),
    ADD COLUMN cancelled_at timestamptz,
    ADD COLUMN cancellation_reason varchar(1000);

-- Refuse ambiguous legacy history instead of deleting or choosing an issue.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM shop.goods_issues GROUP BY order_id HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Cannot enforce one goods issue per order: reconcile orders with multiple goods issues before migration';
    END IF;
END $$;

UPDATE shop.orders o
SET cancelled_by = g.cancelled_by,
    cancelled_at = g.cancelled_at,
    cancellation_reason = g.cancellation_reason
FROM shop.goods_issues g
WHERE g.order_id = o.id AND g.status = 'CANCELLED' AND o.status = 'CANCELLED';

-- Include cancelled issues: another key or direct insert cannot recreate one.
DROP INDEX shop.uk_goods_issues_active_order;
ALTER TABLE shop.goods_issues
    ADD CONSTRAINT uk_goods_issues_order UNIQUE (order_id);
