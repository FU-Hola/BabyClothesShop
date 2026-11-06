# Goods receipt & packing

Module được tổ chức theo nghiệp vụ (feature-first). Một thay đổi của nhập kho thường chỉ cần sửa trong `features/receipts`; tương tự với xuất kho và tồn kho.

```text
goods-receipt-packing/
├── routes/                    # Ghép route, lazy loading, redirect URL cũ
├── features/
│   ├── receipts/              # Tạo, xem, xác nhận/hủy nhập và chọn product/SKU
│   │   ├── api/               # Endpoint adapter và response contracts
│   │   ├── schemas/           # Validation form và bộ lọc
│   │   ├── queries/           # Query hooks cho nhập kho
│   │   ├── components/        # ReceiptProductPicker
│   │   └── pages/             # Các màn nhập kho
│   ├── issues/                # Soạn, đóng gói, xuất, hủy/tạo lại phiếu xuất
│   │   ├── api/
│   │   ├── schemas/
│   │   ├── queries/
│   │   └── pages/
│   └── inventory/             # Tồn kho và thống kê
│       ├── index.js           # Entry point cho StockOverview của catalog-stock
│       ├── api/
│       ├── schemas/
│       ├── queries/
│       └── pages/
└── application/               # Điều phối các nghiệp vụ
    ├── api/                   # Ghép domain API; factory nhận client để kiểm thử
    ├── query/                 # Ghi, cache invalidation và query chi tiết phiếu
    └── components/            # ActionForm, WarehouseDetail

src/shared/                    # File dùng chung nằm trong các thư mục tương ứng
    ├── api/                   # Axios, envelope, lỗi, primitive response contracts
    ├── schemas/               # UUID, version, quantity, text, kiểm tra đủ dòng
    ├── query/                 # Cache keys thống nhất
    ├── components/            # Input, bảng, phân trang, lọc, loading và guard
    ├── hooks/                 # URL pagination/filter và bảo vệ bản nháp
    ├── context/
    ├── utils/
    └── styles/
```

## Quy tắc phụ thuộc

- `src/shared` chỉ phụ thuộc thư viện bên ngoài và các file dùng chung trong `src/shared`; không phụ thuộc module nghiệp vụ.
- Mỗi feature sở hữu API, response contracts, validation và query của mình; không import trực tiếp feature khác.
- `api`, `schemas`, `queries` của feature không phụ thuộc UI hoặc `application`.
- Pages và components của feature ghép UI dùng chung với workflow của `application`.
- `application` dùng API của các feature để điều phối mutation và cập nhật cache giữa nhập, xuất và tồn kho. Không import màn hình của feature.
- `routes/warehouse.routes.jsx` là nơi khai báo route duy nhất. Các màn vẫn dùng dynamic import để giữ lazy loading.
- Ngoài module, layout import trực tiếp `src/shared/components/WarehouseWorkGuard.jsx`, router dùng route entry, `catalog-stock` dùng `features/inventory/index.js`. Không mở barrel export toàn bộ pages vì dễ kéo tất cả màn vào bundle ban đầu.
- Không có vòng lặp import. Quy tắc và đường dẫn import được kiểm tra trong `tests/warehouse.architecture.test.mjs`.

## Thêm chức năng

1. Chọn feature sở hữu chức năng. Đặt response contract ở `api/*.contracts.js`, endpoint ở `api/*.api.js` và request validation ở `schemas/`.
2. Thêm query đọc dữ liệu ở `queries/`. Dùng các key trong `src/shared/query/warehouse.keys.js`.
3. Với thao tác ghi ảnh hưởng nhiều nghiệp vụ, cập nhật workflow ở `application/query/warehouse.mutations.js`. Không tự invalidation rải rác trong component.
4. Ghép page/component của feature, rồi khai báo route lazy khi cần.
5. Chạy các kiểm tra bên dưới. Chỉ đưa phần thật sự dùng chung vào `src/shared`.

## Kiểm tra

Chạy từ thư mục `frontend`:

```sh
npm run test:warehouse
npx eslint src/modules/goods-receipt-packing src/shared src/app/layouts/WarehouseStaffLayout.jsx src/modules/catalog-stock/pages/StockOverview.jsx
npm run build
```

Giữ nguyên endpoint, URL màn hình, query keys và các quy tắc xác nhận thao tác/bảo vệ bản nháp. Kiểm tra tự động bao gồm nghiệp vụ, API adapter, cập nhật cache và ranh giới kiến trúc; không thay thế E2E với database thật.
