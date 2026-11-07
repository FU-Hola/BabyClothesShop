# Warehouse frontend

## Chạy với BE thật

Tại thư mục `frontend`, chạy `npm ci` nếu chưa có dependencies, sau đó `npm run dev`.
Mở `/warehouse-staff/stock`. FE gọi `/api/v1/warehouse-staff`; Vite chuyển tiếp `/api/v1` tới `http://127.0.0.1:8080`.
BE cần chạy và kết nối cơ sở dữ liệu. Các thao tác ghi vẫn dùng nhân viên cố định do `WarehouseActorProvider` của BE cấp; FE không gửi ID người thao tác.

Nếu BE chạy cổng khác, tạo `.env.local` (không commit thông tin riêng):

```dotenv
WAREHOUSE_PROXY_TARGET=http://127.0.0.1:8080
```

Nếu gọi BE qua địa chỉ riêng thay vì proxy:

```dotenv
VITE_WAREHOUSE_API_URL=https://your-api.example/api/v1/warehouse-staff
```

Khi dùng URL riêng, BE/gateway phải cấu hình CORS cho origin FE. Bản production cần reverse proxy `/api/v1` đến BE hoặc cung cấp `VITE_WAREHOUSE_API_URL` lúc build. Vite proxy chỉ hoạt động khi phát triển.

## Quy tắc đã nối

- PageRequest/PageResponse đều từ trang **1**; `size` là số dòng. Kích thước SKU dùng `variantSize`.
- Chọn hàng nhập qua `/receipt-options/products` rồi `/receipt-options/products/{id}/variants`. Không chọn SKU từ trang tồn kho hiện tại. BE quyết định điều kiện ACTIVE, variant active và Inventory tồn tại.
- Tạo phiếu nhập chưa tăng tồn. Xác nhận gửi đủ các dòng với `receivedQuantity`; cho phép 0 và vượt dự kiến, bắt buộc ghi chú nếu lệch. Hủy nhập gửi `version` và `note` không bắt buộc.
- Hàng ngừng hoạt động vẫn xử lý được trên phiếu nhập đã tạo trước đó. Không lọc lại các dòng lịch sử bằng API chọn hàng mới.
- Xuất kho: PENDING → PICKING → PACKED → EXPORTED. Lưu số lượng soạn là số tuyệt đối, đủ các dòng; không vượt lượng đặt. Chỉ đóng gói khi BE đã lưu đủ soạn.
- Bao bì chỉ CARTON/PE_BAG. Xuất cần carrierName; trackingNumber/note không bắt buộc. BE kiểm tra tồn và trừ tồn khi xuất, không giữ hàng.
- Hủy xuất không hủy đơn, không sửa tồn. Tạo lại có thể trả ID phiếu khác; UI cung cấp link mở phiếu hiện tại và giữ cache lịch sử.
- Không tự gọi tạo phiếu xuất từ Warehouse; Order module chịu trách nhiệm khởi tạo như đã thống nhất.
- Mutation không retry và không tăng/trừ tồn giả trên FE. Sau khi thành công, làm mới các danh sách/chi tiết liên quan. Lỗi GET sau ghi thành công hiển thị cảnh báo, không cho gửi lại như một lần ghi thất bại.
- 409/mất mạng/5xx/response sai: giữ bản nhập, khóa xử lý và yêu cầu đối chiếu lại. Không tự thay version rồi gửi lại. Với tạo mới chưa rõ kết quả, kiểm tra danh sách trước khi tạo lại.
- Các form có dữ liệu chưa lưu được bảo vệ khi chuyển trang/tải lại. Thao tác ghi có bước xác nhận và chặn double click.

## Kiểm tra

```sh
npm run build
npx eslint src/modules/goods-receipt-packing src/shared src/modules/catalog-stock/pages/StockOverview.jsx src/app/router/warehouse-staff.routes.jsx src/app/router/store-staff.routes.jsx src/app/layouts/WarehouseStaffLayout.jsx src/main.jsx src/shared/provider/QueryProvider.jsx vite.config.js
```

Kiểm tra trình duyệt đã chạy với máy chủ fixture riêng (không nằm trong mã runtime, không seed dữ liệu vào hệ thống): tạo nhập qua chọn product/SKU, xác nhận lệch dự kiến, cảnh báo rời trang, chặn double submit, bắt đầu soạn, lưu đủ hàng, đóng gói và xuất kho; hủy nhập/xuất, giữ nội dung khi gặp 409, tải lại version và mở đúng ID phiếu tạo lại. Đây không phải E2E trên database BE thật.

Checklist khi chạy với BE và dữ liệu thật:

1. Tạo phiếu với SKU có tồn 0, sản phẩm/SKU active. Thử chọn trùng, chọn SKU mới bị ngừng hoạt động hoặc thiếu Inventory.
2. Phiếu PENDING: nhập đủ mọi dòng, thử trống/âm/lẻ, nhận 0, nhận vượt, ghi chú chênh lệch. Kiểm tra tồn tăng đúng thực nhận.
3. Hủy phiếu PENDING có/không có note; kiểm tra tồn không thay đổi. Phiếu hoàn tất/hủy không hiện form xử lý.
4. Mở cùng phiếu trong hai tab, xử lý ở tab đầu; tab thứ hai nhận 409, giữ số lượng và chỉ xử lý tiếp sau khi tải lại.
5. Phiếu xuất: lưu tiến độ chưa đủ, kiểm tra không đóng gói được; lưu đủ, đóng gói CARTON/PE_BAG, xuất có đơn vị vận chuyển. Kiểm tra Order SHIPPING và tồn giảm đủ.
6. Thử xuất khi SKU thiếu tồn; không đổi trạng thái/tồn một phần. Kiểm tra thông báo BE và tải lại để đối chiếu.
7. Hủy ở PENDING/PICKING/PACKED, kiểm tra Order/tồn giữ nguyên. Tạo lại phiếu, mở đúng ID mới.
8. Tắt mạng lúc ghi, không gửi lại tự động; bật mạng và đối chiếu trạng thái. Nếu GET tải lại lỗi sau ghi, kiểm tra UI vẫn báo thao tác thành công kèm cảnh báo.
9. Tìm kiếm, lọc, đổi số dòng/trang, back/forward, danh sách trống và lỗi mạng; kiểm tra trên màn hình nhỏ.

## Cấu trúc

Module dùng cấu trúc feature-first: `features/receipts`, `features/issues`, `features/inventory` sở hữu API, contract, validation, query và page của từng nghiệp vụ. `src/shared` giữ hạ tầng/UI dùng chung của kho trong thư mục shared toàn ứng dụng; `application` điều phối thao tác ghi và cache giữa các nghiệp vụ; `routes` giữ route lazy và redirect cũ.

Xem [cấu trúc và quy tắc phụ thuộc](../src/modules/goods-receipt-packing/README.md).

Không thay đổi BE, Entity hay tích hợp auth trong lần hoàn thiện FE này. Không tạo Inventory thuộc Product module.
