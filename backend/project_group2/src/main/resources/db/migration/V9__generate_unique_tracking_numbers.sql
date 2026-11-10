-- Allocate tracking numbers atomically across all backend instances.
-- Keep every existing number and continue above the reserved numeric prefix.
CREATE SEQUENCE shop.tracking_number_seq AS bigint START WITH 1 NO CYCLE;

SELECT setval('shop.tracking_number_seq',
    (coalesce(max(substring(tracking_number FROM '^VD-([0-9]+)$')::numeric), 0) + 1)::bigint,
    false)
FROM shop.goods_issues;

-- Multiple unexported issues may have NULL, but assigned numbers cannot repeat.
ALTER TABLE shop.goods_issues
    ADD CONSTRAINT uk_goods_issues_tracking_number UNIQUE (tracking_number);
