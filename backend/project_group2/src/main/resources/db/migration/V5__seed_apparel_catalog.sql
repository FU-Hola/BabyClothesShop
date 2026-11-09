-- School-project demo catalog, applied transactionally by Flyway.
-- Source photos: product-images-preview/. No Cloudinary upload is performed.
-- Stable IDs also recognize the former manual seed without resetting prices/stock.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM shop.users WHERE email = 'store@babyshop.test') THEN
        RAISE EXCEPTION 'Apparel demo requires store@babyshop.test from V1; check the database baseline before migrating';
    END IF;
END $$;

CREATE TEMP TABLE apparel_seed (
    code text, name text, category_slug text, price numeric,
    original_price numeric, colors text[], color_codes text[], image_count integer
) ON COMMIT DROP;

INSERT INTO apparel_seed VALUES
    ('polo-girl', 'Áo Polo Bé Gái', 'ao-polo', 329000, 399000, ARRAY['Trắng'], ARRAY['white'], 2),
    ('polo-boy', 'Áo Polo Bé Trai', 'ao-polo', 329000, 399000, ARRAY['Trắng'], ARRAY['white'], 2),
    ('long-girl', 'Áo Thun Tay Dài Bé Gái', 'ao-thun', 249000, 299000, ARRAY['Trắng'], ARRAY['white'], 3),
    ('long-boy', 'Áo Thun Tay Dài Bé Trai', 'ao-thun', 249000, 299000, ARRAY['Nâu', 'Xám'], ARRAY['brown', 'grey'], 3),
    ('short-girl', 'Áo Thun Tay Ngắn Bé Gái', 'ao-thun', 199000, 249000, ARRAY['Xanh lá'], ARRAY['green'], 3),
    ('short-boy', 'Áo Thun Tay Ngắn Bé Trai', 'ao-thun', 199000, 249000, ARRAY['Đỏ', 'Xanh dương'], ARRAY['red', 'blue'], 3),
    ('hoodie-712810', 'Áo Hoodie Bé Gái Vintage Soft Oversized - 712810', 'ao-hoodie', 449000, 549000, ARRAY['Tím', 'Trắng'], ARRAY['purple', 'white'], 2),
    ('hoodie-590866', 'Áo Hoodie Bé Gái - 590866', 'ao-hoodie', 449000, 549000, ARRAY['Be', 'Hồng'], ARRAY['beige', 'pink'], 2),
    ('hoodie-712497', 'Áo Hoodie Bé Trai Logo - 712497', 'ao-hoodie', 449000, 549000, ARRAY['Đen', 'Vàng'], ARRAY['black', 'yellow'], 2),
    ('hoodie-712624', 'Áo Hoodie Bé Trai - 712624', 'ao-hoodie', 449000, 549000, ARRAY['Đen', 'Đỏ'], ARRAY['black', 'red'], 2),
    ('hoodie-1184268', 'Áo Hoodie Bé Trai Logo Relaxed - 1184268', 'ao-hoodie', 449000, 549000, ARRAY['Xám', 'Đỏ'], ARRAY['grey', 'red'], 2),
    ('pants-915796', 'Quần Dài Bé Trai Joggers - 915796', 'quan-dai', 329000, 399000, ARRAY['Be', 'Xanh dương'], ARRAY['beige', 'blue'], 2),
    ('pants-901041', 'Quần Dài Bé Trai Relaxed Straight - 901041', 'quan-dai', 329000, 399000, ARRAY['Be', 'Đen', 'Xanh dương'], ARRAY['beige', 'black', 'blue'], 2),
    ('pants-756728', 'Quần Dài Trẻ Em Relaxed - 756728', 'quan-dai', 329000, 399000, ARRAY['Be', 'Xanh dương'], ARRAY['beige', 'blue'], 2),
    ('pants-712511', 'Quần Thun Dài Bé Trai - 712511', 'quan-dai', 329000, 399000, ARRAY['Trắng', 'Vàng'], ARRAY['white', 'yellow'], 2),
    ('pants-772098', 'Quần Thun Dài Bé Trai Logo - 772098', 'quan-dai', 329000, 399000, ARRAY['Nâu', 'Đỏ'], ARRAY['brown', 'red'], 1),
    ('pants-550068', 'Quần Thun Dài Bé Trai Logo Jogger - 550068', 'quan-dai', 329000, 399000, ARRAY['Xanh dương', 'Xám', 'Đỏ'], ARRAY['blue', 'grey', 'red'], 1),
    ('pants-712523', 'Quần Thun Dài Bé Trai Vintage Soft Star Wars Joggers - 712523', 'quan-dai', 329000, 399000, ARRAY['Tím', 'Đỏ'], ARRAY['purple', 'red'], 2),
    ('pants-522684', 'Quần Thun Dài Em Bé Logo - 522684', 'quan-dai', 329000, 399000, ARRAY['Xanh dương', 'Hồng'], ARRAY['blue', 'pink'], 2),
    ('pants-560431', 'Quần Vải Dài Bé Trai Baggy - 560431', 'quan-dai', 329000, 399000, ARRAY['Xanh dương', 'Nâu'], ARRAY['blue', 'brown'], 2),
    ('pants-707988', 'Quần Vải Dài Bé Trai Jogger - 707988', 'quan-dai', 329000, 399000, ARRAY['Đen', 'Xanh lá'], ARRAY['black', 'green'], 1),
    ('pants-422061', 'Quần Vải Dài Trẻ Em - 422061', 'quan-dai', 329000, 399000, ARRAY['Be', 'Xanh lá'], ARRAY['beige', 'green'], 2);

INSERT INTO shop.categories (id, created_at, updated_at, name, slug, is_active)
VALUES
    (md5('apparel:category:ao-polo')::uuid, now(), now(), 'Áo Polo', 'ao-polo', true),
    (md5('apparel:category:ao-thun')::uuid, now(), now(), 'Áo Thun', 'ao-thun', true),
    (md5('apparel:category:ao-hoodie')::uuid, now(), now(), 'Áo Hoodie', 'ao-hoodie', true),
    (md5('apparel:category:quan-dai')::uuid, now(), now(), 'Quần Dài', 'quan-dai', true)
ON CONFLICT (slug) DO NOTHING;

-- Preserve original products/order references, but hide mismatched legacy categories.
UPDATE shop.categories SET is_active = false, updated_at = now()
WHERE slug IN ('demo-cham-soc', 'demo-quan-ao', 'demo-do-choi', 'demo-an-uong')
  AND is_active = true;

INSERT INTO shop.products (id, created_at, updated_at, category_id, name, description, status, created_by)
SELECT md5('apparel:product:' || s.code)::uuid, now(), now(), c.id, s.name,
       s.name || '. Có các kích cỡ S, M, L, XL, XXL. Giá và tồn kho là dữ liệu demo của đồ án.',
       'ACTIVE', (SELECT id FROM shop.users WHERE email = 'store@babyshop.test')
FROM apparel_seed s JOIN shop.categories c ON c.slug = s.category_slug
ON CONFLICT (id) DO NOTHING;

INSERT INTO shop.product_variants
    (id, created_at, updated_at, product_id, sku, color, size, price, original_price, is_active)
SELECT md5('apparel:variant:' || s.code || ':' || color.code || ':' || size)::uuid,
       now(), now(), md5('apparel:product:' || s.code)::uuid,
       upper('APP-' || s.code || '-' || color.code || '-' || size),
       color.name, size, s.price, s.original_price, true
FROM apparel_seed s
CROSS JOIN LATERAL unnest(s.colors, s.color_codes) AS color(name, code)
CROSS JOIN unnest(ARRAY['S', 'M', 'L', 'XL', 'XXL']) AS size
ON CONFLICT (id) DO NOTHING;

INSERT INTO shop.inventory (id, created_at, updated_at, variant_id, quantity)
SELECT md5('apparel:inventory:' || v.id::text)::uuid, now(), now(), v.id, 20
FROM shop.product_variants v
JOIN apparel_seed s ON v.product_id = md5('apparel:product:' || s.code)::uuid
ON CONFLICT (variant_id) DO NOTHING;

INSERT INTO shop.product_images
    (id, created_at, updated_at, product_id, image_url, color, sort_order)
SELECT md5('apparel:image:' || s.code || ':' || color.code || ':' || position)::uuid,
       now(), now(), md5('apparel:product:' || s.code)::uuid,
       '/images/products/apparel/' || s.code || '/' ||
           (ARRAY['first', 'second', 'third'])[position] || '-' || color.code || '.jpg',
       color.name, (color.ordinality::integer - 1) * 3 + position - 1
FROM apparel_seed s
CROSS JOIN LATERAL unnest(s.colors, s.color_codes) WITH ORDINALITY AS color(name, code, ordinality)
CROSS JOIN LATERAL generate_series(1, s.image_count) AS position
ON CONFLICT (id) DO NOTHING;
