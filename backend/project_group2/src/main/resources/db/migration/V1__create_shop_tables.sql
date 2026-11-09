-- Initial schema for the current JPA entities. The shop schema is created by
-- docker/postgres/01-init.sh; Flyway runs with default-schema=shop.
-- UUIDs are assigned by Hibernate (GenerationType.UUID), not by the database.

CREATE TABLE shop.users (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    email varchar(254) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    full_name varchar(255) NOT NULL,
    phone varchar(32),
    role varchar(32) NOT NULL CHECK (role IN ('ADMIN', 'STORE_STAFF', 'WAREHOUSE_STAFF', 'CUSTOMER')),
    status varchar(32) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    employee_code varchar(40) UNIQUE,
    position varchar(100),
    created_by uuid REFERENCES shop.users(id),
    deleted_at timestamptz
);

CREATE TABLE shop.categories (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    name varchar(100) NOT NULL UNIQUE,
    slug varchar(150) NOT NULL UNIQUE,
    is_active boolean NOT NULL
);

CREATE TABLE shop.products (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    category_id uuid NOT NULL REFERENCES shop.categories(id),
    name varchar(255) NOT NULL,
    description text NOT NULL,
    status varchar(32) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_by uuid NOT NULL REFERENCES shop.users(id)
);
CREATE INDEX idx_products_category ON shop.products(category_id);

CREATE TABLE shop.product_variants (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    product_id uuid NOT NULL REFERENCES shop.products(id),
    sku varchar(64) NOT NULL UNIQUE,
    color varchar(100) NOT NULL,
    size varchar(40) NOT NULL,
    price numeric(19, 2) NOT NULL,
    original_price numeric(19, 2),
    is_active boolean NOT NULL,
    CONSTRAINT uk_variant_product_color_size UNIQUE (product_id, color, size),
    CHECK (price >= 0 AND (original_price IS NULL OR original_price >= price))
);

CREATE TABLE shop.product_images (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    product_id uuid NOT NULL REFERENCES shop.products(id),
    image_url varchar(2048) NOT NULL,
    sort_order integer NOT NULL CHECK (sort_order >= 0)
);
CREATE INDEX idx_product_images_product ON shop.product_images(product_id);

CREATE TABLE shop.carts (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    customer_id uuid NOT NULL UNIQUE REFERENCES shop.users(id)
);

CREATE TABLE shop.cart_items (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    cart_id uuid NOT NULL REFERENCES shop.carts(id),
    variant_id uuid NOT NULL REFERENCES shop.product_variants(id),
    quantity integer NOT NULL CHECK (quantity > 0),
    CONSTRAINT uk_cart_item_variant UNIQUE (cart_id, variant_id)
);
CREATE INDEX idx_cart_items_variant ON shop.cart_items(variant_id);

CREATE TABLE shop.orders (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    order_code varchar(40) NOT NULL UNIQUE,
    customer_id uuid NOT NULL REFERENCES shop.users(id),
    checkout_key varchar(100) NOT NULL UNIQUE,
    receiver_name varchar(255) NOT NULL,
    receiver_phone varchar(32) NOT NULL,
    receiver_address varchar(1000) NOT NULL,
    customer_note varchar(1000),
    shipping_fee numeric(19, 2) NOT NULL CHECK (shipping_fee >= 0),
    status varchar(32) NOT NULL CHECK (status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'PACKED', 'SHIPPING', 'DELIVERED')),
    payment_method varchar(32) NOT NULL CHECK (payment_method IN ('SIMULATED')),
    payment_status varchar(32) NOT NULL CHECK (payment_status IN ('UNPAID', 'PAID')),
    paid_at timestamptz,
    confirmed_by uuid REFERENCES shop.users(id),
    confirmed_at timestamptz,
    delivered_by uuid REFERENCES shop.users(id),
    delivered_at timestamptz,
    version bigint NOT NULL
);
CREATE INDEX idx_orders_customer_created ON shop.orders(customer_id, created_at);
CREATE INDEX idx_orders_status_created ON shop.orders(status, created_at);

CREATE TABLE shop.order_items (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    order_id uuid NOT NULL REFERENCES shop.orders(id),
    variant_id uuid NOT NULL REFERENCES shop.product_variants(id),
    quantity integer NOT NULL,
    unit_price numeric(19, 2) NOT NULL,
    product_name_snapshot varchar(255) NOT NULL,
    sku_snapshot varchar(64) NOT NULL,
    color_snapshot varchar(100) NOT NULL,
    size_snapshot varchar(40) NOT NULL,
    image_url_snapshot varchar(2048),
    CHECK (quantity > 0 AND unit_price >= 0)
);
CREATE INDEX idx_order_items_order ON shop.order_items(order_id);
CREATE INDEX idx_order_items_variant ON shop.order_items(variant_id);

-- Matches GoodsReceipt's singular @Table and UUID fields createdBy/confirmAt.
CREATE TABLE shop.goods_receipt (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    code varchar(40) NOT NULL UNIQUE,
    supplier_name varchar(255) NOT NULL,
    expected_date date,
    note varchar(1000),
    goods_receipt_status varchar(20) NOT NULL CHECK (goods_receipt_status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    created_by uuid NOT NULL,
    confirm_at timestamptz,
    discrepancy_note varchar(1000),
    version bigint NOT NULL
);

-- GoodsReceiptItem.variantId is a UUID scalar, not a JPA relationship.
CREATE TABLE shop.goods_receipt_items (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    goods_receipt_id uuid NOT NULL REFERENCES shop.goods_receipt(id),
    variant_id uuid NOT NULL,
    expected_quantity integer NOT NULL CHECK (expected_quantity > 0),
    received_quantity integer,
    UNIQUE (goods_receipt_id, variant_id)
);

-- Inventory.variantId is also a scalar UUID; the entity only tracks quantity.
CREATE TABLE shop.inventory (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    quantity bigint NOT NULL,
    variant_id uuid NOT NULL
);

CREATE TABLE shop.goods_issues (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    code varchar(40) NOT NULL UNIQUE,
    order_id uuid NOT NULL UNIQUE REFERENCES shop.orders(id),
    status varchar(32) NOT NULL CHECK (status IN ('PENDING', 'PICKING', 'PACKED', 'EXPORTED')),
    assigned_to uuid REFERENCES shop.users(id),
    picking_started_at timestamptz,
    packed_by uuid REFERENCES shop.users(id),
    packed_at timestamptz,
    packaging_type varchar(32) CHECK (packaging_type IN ('CARTON', 'PE_BAG')),
    exported_by uuid REFERENCES shop.users(id),
    exported_at timestamptz,
    carrier_name varchar(255),
    tracking_number varchar(100),
    note varchar(1000),
    version bigint NOT NULL
);
CREATE INDEX idx_goods_issues_status_created ON shop.goods_issues(status, created_at);
CREATE INDEX idx_goods_issues_assigned ON shop.goods_issues(assigned_to);

CREATE TABLE shop.goods_issue_items (
    id uuid PRIMARY KEY,
    created_at timestamptz,
    updated_at timestamptz,
    goods_issue_id uuid NOT NULL REFERENCES shop.goods_issues(id),
    order_item_id uuid NOT NULL UNIQUE REFERENCES shop.order_items(id),
    picked_quantity integer NOT NULL CHECK (picked_quantity >= 0)
);
CREATE INDEX idx_goods_issue_items_issue ON shop.goods_issue_items(goods_issue_id);

-- Development demo data. Snapshot of the standalone baby_shop_seed_postgresql.sql
-- without its BEGIN/COMMIT wrapper; Flyway manages the migration transaction.
-- All demo accounts use BabyShop@123. Do not apply V1 to production.
SET LOCAL search_path TO shop, public;

-- Fixed, distinct UUID namespaces per table keep foreign keys readable and stable.
CREATE FUNCTION pg_temp.demo_uuid(kind integer, number integer) RETURNS uuid
LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT ('00000000-0000-4000-8000-' || lpad(kind::text, 4, '0') ||
          lpad(number::text, 8, '0'))::uuid
$$;

DO $seed$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email = 'admin@babyshop.test') THEN
    RAISE NOTICE 'Baby Shop demo seed already exists; nothing changed.';
    RETURN;
  END IF;

  INSERT INTO users (id, email, password_hash, full_name, phone, role, status,
                     employee_code, position, created_by, created_at, updated_at)
  SELECT pg_temp.demo_uuid(1, n), email,
         '$2b$10$4GIOfC3716tQXAvrNzhW4.Vi8hBpmYy9JjTDVCrK0MnNHc1PU3fEW',
         full_name, phone, role, 'ACTIVE', employee_code, position,
         CASE WHEN n IN (2, 3) THEN pg_temp.demo_uuid(1, 1) END,
         '2026-10-10 08:00:00+00'::timestamptz, '2026-10-10 08:00:00+00'::timestamptz
  FROM (VALUES
    (1, 'admin@babyshop.test', 'Quản trị Baby Shop', '0900000001', 'ADMIN', 'DEMO-EMP-1', 'ADMIN'),
    (2, 'store@babyshop.test', 'Nhân viên cửa hàng', '0900000002', 'STORE_STAFF', 'DEMO-EMP-2', 'STORE_STAFF'),
    (3, 'warehouse@babyshop.test', 'Nhân viên kho', '0900000003', 'WAREHOUSE_STAFF', 'DEMO-EMP-3', 'WAREHOUSE_STAFF'),
    (4, 'customer1@babyshop.test', 'Nguyễn Minh Anh', '0900000004', 'CUSTOMER', NULL, NULL),
    (5, 'customer2@babyshop.test', 'Trần Thu Hà', '0900000005', 'CUSTOMER', NULL, NULL)
  ) AS demo(n, email, full_name, phone, role, employee_code, position);

  INSERT INTO categories (id, name, slug, is_active)
  SELECT pg_temp.demo_uuid(2, n), name, slug, true FROM (VALUES
    (1, 'Quần áo sơ sinh', 'demo-quan-ao'),
    (2, 'Đồ dùng ăn uống', 'demo-an-uong'),
    (3, 'Chăm sóc bé', 'demo-cham-soc'),
    (4, 'Đồ chơi cho bé', 'demo-do-choi')
  ) AS demo(n, name, slug);

  INSERT INTO products (id, category_id, name, description, status, created_by, created_at, updated_at)
  SELECT pg_temp.demo_uuid(3, n), pg_temp.demo_uuid(2, category), name,
         'Dữ liệu demo Baby Shop: ' || name || '. Ảnh minh họa tạm; giá dùng để kiểm thử.',
         'ACTIVE', pg_temp.demo_uuid(1, 2),
         '2026-10-11 08:00:00+00'::timestamptz, '2026-10-11 08:00:00+00'::timestamptz
  FROM (VALUES
    (1, 1, 'Bodysuit cotton sơ sinh'), (2, 1, 'Bộ quần áo dài tay'),
    (3, 1, 'Áo khoác nhẹ cho bé'), (4, 2, 'Yếm ăn silicone'),
    (5, 2, 'Bình uống nước cho bé'), (6, 3, 'Khăn tắm cotton'),
    (7, 3, 'Chăn mỏng cho bé'), (8, 4, 'Thú bông thỏ')
  ) AS demo(n, category, name);

  INSERT INTO product_images (id, product_id, image_url, sort_order)
  SELECT pg_temp.demo_uuid(4, (product - 1) * 2 + image), pg_temp.demo_uuid(3, product),
         'https://placehold.co/800x800/' || CASE WHEN image = 1 THEN 'FCE7F3/9D174D' ELSE 'DBEAFE/1E40AF' END ||
         '.png?text=Baby+Product+' || product || '+' || image, image - 1
  FROM generate_series(1, 8) AS product CROSS JOIN generate_series(1, 2) AS image;

  INSERT INTO product_variants (id, product_id, sku, color, size, price, original_price, is_active)
  SELECT pg_temp.demo_uuid(5, (product - 1) * 3 + option), pg_temp.demo_uuid(3, product),
         'DEMO-BS-' || lpad(product::text, 2, '0') || '-' || lpad(option::text, 2, '0'),
         (ARRAY['Hồng', 'Xanh', 'Kem'])[option],
         CASE WHEN product <= 3 THEN (ARRAY['0-3M', '3-6M', '6-12M'])[option] ELSE 'ONE_SIZE' END,
         (ARRAY[119000, 179000, 239000, 79000, 149000, 129000, 189000, 109000])[product]
           + option * 10000,
         (ARRAY[119000, 179000, 239000, 79000, 149000, 129000, 189000, 109000])[product]
           + option * 10000 + 30000, true
  FROM generate_series(1, 8) AS product CROSS JOIN generate_series(1, 3) AS option;

  INSERT INTO carts (id, customer_id, created_at, updated_at)
  SELECT pg_temp.demo_uuid(6, n), pg_temp.demo_uuid(1, n + 3),
         '2026-10-21 08:00:00+00'::timestamptz, '2026-10-22 08:00:00+00'::timestamptz
  FROM generate_series(1, 2) AS n;

  INSERT INTO cart_items (id, cart_id, variant_id, quantity, created_at, updated_at)
  SELECT pg_temp.demo_uuid(7, n), pg_temp.demo_uuid(6, cart), pg_temp.demo_uuid(5, variant), quantity,
         '2026-10-21 08:00:00+00'::timestamptz, '2026-10-22 08:00:00+00'::timestamptz
  FROM (VALUES (1, 1, 1, 2), (2, 1, 5, 1), (3, 2, 10, 1)) AS demo(n, cart, variant, quantity);

  INSERT INTO orders (id, order_code, customer_id, checkout_key, receiver_name,
                      receiver_phone, receiver_address, customer_note, shipping_fee,
                      status, payment_method, payment_status, paid_at,
                      confirmed_by, confirmed_at, delivered_by, delivered_at,
                      created_at, updated_at, version)
  SELECT pg_temp.demo_uuid(8, n), 'DEMO-ORD-' || lpad(n::text, 3, '0'),
         pg_temp.demo_uuid(1, customer), 'demo-checkout-' || lpad(n::text, 3, '0'),
         CASE WHEN customer = 4 THEN 'Nguyễn Minh Anh' ELSE 'Trần Thu Hà' END,
         CASE WHEN customer = 4 THEN '0900000004' ELSE '0900000005' END,
         CASE WHEN customer = 4 THEN '12 Nguyễn Trãi, Hà Nội' ELSE '25 Lê Lợi, TP. Hồ Chí Minh' END,
         'Đơn mẫu để test ' || status, 30000, status, 'SIMULATED', 'PAID',
         '2026-10-18 08:00:00+00'::timestamptz,
         CASE WHEN n > 1 THEN pg_temp.demo_uuid(1, 2) END,
         CASE WHEN n > 1 THEN '2026-10-18 09:00:00+00'::timestamptz END,
         CASE WHEN n = 5 THEN pg_temp.demo_uuid(1, 2) END,
         CASE WHEN n = 5 THEN '2026-10-21 08:00:00+00'::timestamptz END,
         '2026-10-18 08:00:00+00'::timestamptz, '2026-10-22 08:00:00+00'::timestamptz, 0
  FROM (VALUES
    (1, 4, 'PENDING_CONFIRMATION'), (2, 5, 'CONFIRMED'),
    (3, 4, 'PACKED'), (4, 5, 'SHIPPING'), (5, 4, 'DELIVERED')
  ) AS demo(n, customer, status);

  INSERT INTO order_items (id, order_id, variant_id, quantity, unit_price,
                           product_name_snapshot, sku_snapshot, color_snapshot,
                           size_snapshot, image_url_snapshot)
  SELECT pg_temp.demo_uuid(9, item.n), pg_temp.demo_uuid(8, item.order_no), variant.id,
         item.quantity, variant.price, product.name, variant.sku, variant.color, variant.size,
         image.image_url
  FROM (VALUES
    (1, 1, 1, 2), (2, 1, 11, 1), (3, 2, 2, 2), (4, 2, 12, 1),
    (5, 3, 3, 2), (6, 3, 13, 1), (7, 4, 4, 2), (8, 4, 14, 1),
    (9, 5, 5, 2), (10, 5, 15, 1)
  ) AS item(n, order_no, variant_no, quantity)
  JOIN product_variants variant ON variant.id = pg_temp.demo_uuid(5, item.variant_no)
  JOIN products product ON product.id = variant.product_id
  LEFT JOIN product_images image ON image.id = pg_temp.demo_uuid(4,
    ((item.variant_no - 1) / 3) * 2 + 1);

  -- GoodsReceipt uses singular goods_receipt, UUID created_by, confirm_at,
  -- and enum COMPLETED (not the old goods_receipts/CONFIRMED layout).
  INSERT INTO goods_receipt (id, code, supplier_name, expected_date, note,
                             goods_receipt_status, created_by, created_at, updated_at,
                             confirm_at, version)
  VALUES
    (pg_temp.demo_uuid(10, 1), 'DEMO-GR-001', 'Nhà cung cấp Demo Baby', '2026-10-12',
     'Nhập tồn ban đầu', 'COMPLETED', pg_temp.demo_uuid(1, 2),
     '2026-10-11 08:00:00+00', '2026-10-12 08:00:00+00', '2026-10-12 08:00:00+00', 0),
    (pg_temp.demo_uuid(10, 2), 'DEMO-GR-002', 'Nhà cung cấp Demo Baby', '2026-10-23',
     'Phiếu chờ xác nhận để test nhập kho', 'PENDING', pg_temp.demo_uuid(1, 2),
     '2026-10-22 08:00:00+00', '2026-10-22 08:00:00+00', NULL, 0);

  INSERT INTO goods_receipt_items (id, goods_receipt_id, variant_id,
                                   expected_quantity, received_quantity)
  SELECT pg_temp.demo_uuid(11, n), pg_temp.demo_uuid(10, 1), pg_temp.demo_uuid(5, n), 50, 50
  FROM generate_series(1, 24) AS n;
  INSERT INTO goods_receipt_items (id, goods_receipt_id, variant_id,
                                   expected_quantity, received_quantity)
  SELECT pg_temp.demo_uuid(11, n + 24), pg_temp.demo_uuid(10, 2),
         pg_temp.demo_uuid(5, n), 10, NULL
  FROM generate_series(1, 3) AS n;

  INSERT INTO goods_issues (id, code, order_id, status, created_at, updated_at,
                            assigned_to, picking_started_at, packed_by, packed_at,
                            packaging_type, exported_by, exported_at, carrier_name,
                            tracking_number, note, version)
  SELECT pg_temp.demo_uuid(12, n), 'DEMO-GI-' || lpad(n::text, 3, '0'),
         pg_temp.demo_uuid(8, n), status, '2026-10-18 09:00:00+00'::timestamptz,
         '2026-10-22 08:00:00+00'::timestamptz, pg_temp.demo_uuid(1, 3),
         CASE WHEN n >= 3 THEN '2026-10-19 10:00:00+00'::timestamptz END,
         CASE WHEN n >= 3 THEN pg_temp.demo_uuid(1, 3) END,
         CASE WHEN n >= 3 THEN '2026-10-19 11:00:00+00'::timestamptz END,
         CASE WHEN n >= 3 THEN 'CARTON' END,
         CASE WHEN n >= 4 THEN pg_temp.demo_uuid(1, 2) END,
         CASE WHEN n >= 4 THEN '2026-10-20 08:00:00+00'::timestamptz END,
         CASE WHEN n >= 4 THEN 'Vận chuyển Demo' END,
         CASE WHEN n >= 4 THEN 'DEMO-TRACK-' || lpad(n::text, 3, '0') END,
         'Phiếu xuất mẫu', 0
  FROM (VALUES (2, 'PENDING'), (3, 'PACKED'), (4, 'EXPORTED'), (5, 'EXPORTED')) AS demo(n, status);

  INSERT INTO goods_issue_items (id, goods_issue_id, order_item_id, picked_quantity)
  SELECT pg_temp.demo_uuid(13, n), pg_temp.demo_uuid(12, (n + 1) / 2),
         pg_temp.demo_uuid(9, n), CASE WHEN n <= 4 THEN 0 ELSE item.quantity END
  FROM generate_series(3, 10) AS n
  JOIN order_items item ON item.id = pg_temp.demo_uuid(9, n);

  -- The current Inventory entity has quantity, not physical/reserved quantities.
  -- Completed receipt adds 50; exported orders deduct the corresponding items.
  INSERT INTO inventory (id, variant_id, quantity, created_at, updated_at)
  SELECT pg_temp.demo_uuid(14, n), pg_temp.demo_uuid(5, n),
         50 - CASE n WHEN 4 THEN 2 WHEN 5 THEN 2 WHEN 14 THEN 1 WHEN 15 THEN 1 ELSE 0 END,
         '2026-10-12 08:00:00+00'::timestamptz, '2026-10-22 08:00:00+00'::timestamptz
  FROM generate_series(1, 24) AS n;
END;
$seed$;
