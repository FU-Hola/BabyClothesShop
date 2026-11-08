# Local apparel demo

`seed_apparel.sql` adds six products from `product-images-preview/`, two real
categories (`ao-polo`, `ao-thun`), 40 color/size variants and 22 ordered images.
Sizes S/M/L/XL/XXL, prices and stock (20 per variant) are illustrative school-project
data, not the source retailer's sizing or prices.

After backing up the local database, run from the repository root:

```sh
docker exec -i sba-postgres psql -v ON_ERROR_STOP=1 \
  -U baby_clothes_migrator -d sba_project \
  < backend/project_group2/src/main/resources/db/demo/seed_apparel.sql
```

The demo requires the existing `store@babyshop.test` user. It preserves old
products, carts and orders. The old `demo-cham-soc` and `demo-quan-ao` categories
are deactivated (not deleted); their products no longer appear in the public
catalog. Other categories remain unchanged. Repeat runs skip existing apparel
records rather than resetting prices or stock.

Images are served locally from `frontend/public/images/products/apparel/`.
`first`, `second`, `third` are ordered gallery views for each color, not separate
variants. Polo products have only two supplied views. Copied asset names normalize
`second-blud.jpg` to `second-blue.jpg` and `thirst-brown.jpg` to `third-brown.jpg`;
the source files are unchanged. No Cloudinary upload is performed. Image reuse
rights have not been verified; these assets are for the local demo.
