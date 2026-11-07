# BabyClothesShop

Ứng dụng bán quần áo trẻ em: frontend React/Vite, backend Spring Boot và PostgreSQL.

## Cấu trúc

- `frontend/src/modules`: Auth, Account, Catalog–Stock, Cart–Checkout, Order Management, Goods Receipt–Packing.
- `backend/project_group2/src/main/java/com/fptu/project_group2`: backend theo các module tương ứng.
- `backend/project_group2/src/test`: test Auth, Order và Warehouse; integration test dùng PostgreSQL cô lập.
- `docker-compose.yaml`: PostgreSQL local. `compose.deploy.yaml` và `deploy.sh`: triển khai backend/frontend.

## Chạy local

Tạo `backend/project_group2/.env` từ `.env.example`, điền cấu hình database và JWT; không commit file `.env`.

```bash
docker compose --env-file backend/project_group2/.env up -d --wait postgres
cd backend/project_group2
./mvnw spring-boot:run
```

Ở terminal khác:

```bash
cd frontend
npm ci
npm run dev
```

Frontend dùng `VITE_API_BASE_URL` (mặc định `http://localhost:8080/api/v1`). Khi dùng Vite proxy, đặt `/api/v1`. Kho dùng đường dẫn tương đối `/warehouse-staff` dưới API base. Auth dùng cookie, CSRF và phân quyền theo tài khoản đăng nhập.

## Kiểm tra

```bash
cd backend/project_group2
./mvnw test
# Nếu không dùng Docker cho test database:
./mvnw test -Dtest.database=embedded
```

```bash
cd frontend
npm run build
npm run lint
```

Kiểm thử database dùng `IntegrationTestSupport`, không dùng database ứng dụng. Giữ các migration SQL trong `src/main/resources/db/migration`; không chỉnh migration đã áp dụng.

## Luồng kho

- Tồn kho dùng module Catalog–Stock.
- Checkout tạo đơn PENDING_CONFIRMATION; Store Staff xác nhận trước khi kho xử lý phiếu.
- Kho soạn, đóng gói và tự xuất hàng trong transaction; xuất hàng yêu cầu mã vận đơn, gom số lượng theo SKU rồi trừ tồn có điều kiện. Không gọi `OrderService.shipOrder`.
- Database cũ có unique trên `goods_issues.order_id` hoặc `goods_issue_items.order_item_id` cần migration phù hợp trước khi tạo lại phiếu đã hủy.

Xem [DEPLOYMENT.md](DEPLOYMENT.md) để triển khai.
