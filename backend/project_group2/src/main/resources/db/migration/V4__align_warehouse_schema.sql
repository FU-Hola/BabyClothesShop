-- Align the existing warehouse tables with the merged warehouse entities.
-- Nullable columns preserve all existing goods issues.
ALTER TABLE shop.goods_issues
    ADD COLUMN IF NOT EXISTS cancelled_by uuid,
    ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
    ADD COLUMN IF NOT EXISTS cancellation_reason varchar(1000),
    ADD COLUMN IF NOT EXISTS picking_updated_at timestamptz;

ALTER TABLE shop.goods_issues
    ADD CONSTRAINT fk_goods_issues_cancelled_by
        FOREIGN KEY (cancelled_by) REFERENCES shop.users(id);

ALTER TABLE shop.goods_issues
    DROP CONSTRAINT IF EXISTS goods_issues_status_check;
ALTER TABLE shop.goods_issues
    ADD CONSTRAINT goods_issues_status_check
        CHECK (status IN ('PENDING', 'PICKING', 'PACKED', 'EXPORTED', 'CANCELLED'));

-- Keep cancelled issues as history when a replacement issue is created.
ALTER TABLE shop.goods_issues
    DROP CONSTRAINT IF EXISTS goods_issues_order_id_key;
CREATE UNIQUE INDEX uk_goods_issues_active_order
    ON shop.goods_issues(order_id) WHERE status <> 'CANCELLED';

ALTER TABLE shop.goods_issue_items
    DROP CONSTRAINT IF EXISTS goods_issue_items_order_item_id_key;
ALTER TABLE shop.goods_issue_items
    ADD CONSTRAINT uk_issue_order_item UNIQUE (goods_issue_id, order_item_id);

ALTER TABLE shop.inventory
    ADD CONSTRAINT uk_inventory_variant UNIQUE (variant_id),
    ADD CONSTRAINT fk_inventory_variant
        FOREIGN KEY (variant_id) REFERENCES shop.product_variants(id);
