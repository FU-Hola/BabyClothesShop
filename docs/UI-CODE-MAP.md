# Bản đồ UI — Baby Clothes Shop

Phân tích mã nguồn ngày 21/10/2026. Không sửa luồng nghiệp vụ hay dữ liệu.

## Đọc từ đâu

1. `frontend/src/main.jsx`: Bootstrap, global CSS, React StrictMode.
2. `frontend/src/App.jsx`: CartProvider bao RouterProvider.
3. `frontend/src/app/router/routes.js`: ghép bốn nhóm route.
4. `frontend/src/app/layouts`: bố cục khách hàng, admin, cửa hàng, kho.
5. `frontend/src/modules`: màn hình và xử lý theo nghiệp vụ.
6. `frontend/src/shared`: API client, hằng số, thành phần dùng chung, CSS nền.

## Bản đồ màn hình

| Khu vực | Entry / route | Các node chính |
| --- | --- | --- |
| Khách hàng | publicRoutes, PublicLayout | Home, ProductList, ProductDetail, OrderHistory, OrderDetail |
| Xác thực | /login, /register | LoginPage, LoginForm, RegisterPage, RegisterForm, authApi |
| Giỏ và thanh toán | cartCheckoutRoutes | CartProvider, useCart, CartPage, CheckoutPage, PaymentPage, OrderResultPage |
| Admin | /admin/staff, /admin/customers | AdminRoute, AdminLayout, AccountManagementPage, AccountList, AccountSummary, StaffFormModal, accountApi |
| Nhân viên cửa hàng | /store-staff | StoreStaffLayout, ProductManagement, ProductForm, StaffOrders |
| Kho | /warehouse-staff | WarehouseStaffLayout, StockOverview, GoodsReceiptListPage, PendingReceiptPage, PackingListPage, PackingPage |

## Luồng dữ liệu và mức hoàn thiện

- LoginForm → authApi → axiosClient; token/user lưu localStorage. AdminRoute kiểm tra token, role, status, deletedAt ở phía client.
- AccountManagementPage dùng accountApi, tách danh sách, thống kê, modal và định dạng dữ liệu. Có trạng thái loading/error và cấu hình dùng chung cho nhân viên/khách hàng.
- CartProvider quản lý cartItems/lastOrder, đồng bộ localStorage. Checkout kiểm tra form/tồn kho mô phỏng; tiền mặt đến kết quả, QR qua PaymentPage rồi đến kết quả.
- ProductList dùng danh sách cố định; prop slug từ route chưa được xử lý. Nút lọc và lựa chọn sắp xếp chưa nối xử lý dữ liệu.
- Lịch sử đơn khách hàng đọc orders.js; StaffOrders dùng bộ dữ liệu riêng. Các màn kho dùng các mảng mock và state cục bộ. Chưa có nguồn dữ liệu thống nhất xuyên suốt checkout → lịch sử → xử lý đơn → kho.

## Điểm cần lưu ý khi phát triển tiếp (chưa sửa)

- `/warehouse-operations` chuyển đến `/store-staff/goods-receipts` nhưng route hiện tại của phiếu nhập là `/warehouse-staff/goods-receipts`; menu cửa hàng cũng còn liên kết cũ.
- StoreStaffLayout và WarehouseStaffLayout chưa có guard tương đương AdminRoute. Login hiện chỉ phân biệt admin và các vai trò còn lại khi chuyển trang.
- ProductDetail hiện được gắn vào `/test`; danh mục chưa có liên kết sản phẩm động.
- `CartProvider.addToCart` nhánh thêm mới dùng `product.maxStock || 10`, khiến tồn kho 0 thành 10 và chưa kiểm tra lượng thêm so với tồn kho ở nhánh này.
- Sidebar staff rộng cố định 260px; cần một hạng mục responsive riêng nếu muốn sử dụng toàn bộ trang vận hành trên điện thoại.
- Đây là phân tích tĩnh và kiểm tra trực quan một số màn đại diện, không phải xác nhận toàn bộ nghiệp vụ chạy đúng.

## CodeGraph đã lưu

- Database chính: `.codegraph/codegraph.db` tại root repo SBA_Project.
- Index ban đầu: 124 file, 1.578 node, 2.962 edge (bao gồm script công cụ có trong repo).
- Bản xuất riêng `frontend/src`: `docs/ui-codegraph.json`, 500 node và 799 edge nội bộ UI.
- Bản JSON là snapshot tĩnh; database được cập nhật bằng CodeGraph. Quan hệ liên file được phân giải theo công cụ, không phải chứng minh luồng runtime.

Tra cứu từ thư mục gốc repo:

```bash
codegraph status
codegraph query CartProvider
codegraph context 'AccountManagementPage accountApi'
codegraph callers useCart
codegraph callees CheckoutPage
codegraph sync
```

Khi dùng MCP, truyền `projectPath: /home/hung/Documents/FPTU/Fall2026/SBA_Project` để trỏ đúng database.

## Hệ thống giao diện

`frontend/src/shared/styles/global.css` chứa token chung:

| Token | Giá trị / mục đích |
| --- | --- |
| --ui-font | SFUFutura có sẵn, fallback Segoe UI/Arial |
| --ui-primary | #284e70: nút và điểm nhấn chính |
| --ui-primary-hover | #1b3954 |
| --ui-background | #f4f7fa |
| --ui-surface | #ffffff |
| --ui-text | #243746 |
| --ui-text-muted | #586d7e: chữ phụ trên nền sáng |
| --ui-accent | #e5a96b: điểm nhấn cam trên sidebar navy |
| --ui-control-border | #8396a6: viền form |
| --ui-control-height | 44px |
| --ui-control-radius | 8px |

CSS Modules và warehouse.css tái sử dụng màu/font chung. Giữ nguyên màu ngữ nghĩa trạng thái thành công, cảnh báo và lỗi. Các layout staff có style inline được điều chỉnh bằng selector CSS theo cấu trúc hiện có; không sửa thuộc tính JSX. Nếu thay cấu trúc shell trong tương lai, cần cập nhật selector tương ứng.
