-- Local school-project demo only. Run as baby_clothes_migrator after backing up.
-- Source photos: product-images-preview/. No Cloudinary upload is performed.
-- Repeat runs do not reset edited products, prices or stock.
BEGIN;

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
    ('short-boy', 'Áo Thun Tay Ngắn Bé Trai', 'ao-thun', 199000, 249000, ARRAY['Đỏ', 'Xanh dương'], ARRAY['red', 'blue'], 3);

INSERT INTO shop.categories (id, created_at, updated_at, name, slug, is_active)
VALUES
    (md5('apparel:category:ao-polo')::uuid, now(), now(), 'Áo Polo', 'ao-polo', true),
    (md5('apparel:category:ao-thun')::uuid, now(), now(), 'Áo Thun', 'ao-thun', true)
ON CONFLICT (slug) DO NOTHING;

-- Preserve original products/order references, but hide mismatched legacy categories.
UPDATE shop.categories SET is_active = false, updated_at = now()
WHERE slug IN ('demo-cham-soc', 'demo-quan-ao');

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

COMMIT;
