-- Reconcile cancellations made before goods issue cancellation also cancelled its order.
-- Keep shipped/delivered orders and orders with an active replacement issue intact.
UPDATE shop.orders o
SET status = 'CANCELLED', updated_at = now()
WHERE o.status IN ('CONFIRMED', 'PACKED')
  AND EXISTS (
      SELECT 1 FROM shop.goods_issues g
      WHERE g.order_id = o.id AND g.status = 'CANCELLED'
  )
  AND NOT EXISTS (
      SELECT 1 FROM shop.goods_issues g
      WHERE g.order_id = o.id AND g.status <> 'CANCELLED'
  );
