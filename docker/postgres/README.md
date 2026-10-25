# PostgreSQL riêng cho SBA

Chạy các lệnh Docker Compose dưới đây tại thư mục gốc dự án, nơi có `../../docker-compose.yaml`.
Docker Compose đọc biến từ file `.env` của backend qua `--env-file`; không cần
nhân bản mật khẩu sang file khác.

## Khởi động

Với checkout mới, sao chép `backend/project_group2/.env.example` thành `.env`
và thay tất cả `CHANGE_ME` bằng mật khẩu riêng trước khi chạy.

```bash
docker compose --env-file backend/project_group2/.env up -d --wait postgres
docker compose --env-file backend/project_group2/.env ps
docker compose --env-file backend/project_group2/.env logs --tail=50 postgres
```

- Container: `sba-postgres`, service Compose: `postgres`.
- Database: lấy từ `DB_NAME`, hiện là `sba_project`.
- Backend chạy trên máy: `127.0.0.1:5433`.
- Backend chạy trong cùng mạng Compose: `postgres:5432`.
- Volume dữ liệu: `sba_postgres-data`; mạng: `sba_default`.
- `POSTGRES_PASSWORD`: mật khẩu admin `postgres`, chỉ dành cho Docker/quản trị.
- User ứng dụng, mật khẩu và tài khoản Flyway lấy nguyên từ `.env` backend.

Port chỉ bind localhost. Đây là database local cho toàn dự án; frontend truy cập
thông qua backend, không kết nối thẳng PostgreSQL. Các container/database cũ
không bị dùng chung với SBA.

## Vào terminal / chạy SQL

```bash
docker exec -it sba-postgres sh
docker exec -it sba-postgres psql -U postgres -d sba_project
```

Trong `psql`: `\l` xem database, `\dn` xem schema, `\dt shop.*` xem bảng,
`\q` để thoát. Ví dụ DDL dùng schema `shop` như `CREATE TABLE shop.example (...)`.

## Dừng và chạy lại

```bash
docker compose --env-file backend/project_group2/.env stop postgres
docker compose --env-file backend/project_group2/.env start postgres
```

`docker compose ... down` xóa container/mạng nhưng giữ volume. **Không thêm
`-v` nếu cần giữ dữ liệu**: tùy chọn đó xóa cả volume database.

Script `01-init.sh` chỉ chạy khi volume trống. Đổi user/password/database trong
`.env` sau khi đã tạo volume không tự đổi dữ liệu hay tài khoản trong PostgreSQL;
cần thực hiện SQL quản trị tương ứng và đồng bộ cấu hình.

## Giữ cấu hình backend hiện tại

Giữ tên ứng dụng `sba_project`, `DB_NAME=sba_project`, user `sa`, schema `shop`,
tài khoản migration và việc tắt dependency Spring Security trong `pom.xml`.
Chỉ thay `DB_HOST`/`DB_PORT` sang PostgreSQL riêng và thêm `POSTGRES_PASSWORD`.

`application.yaml` hiện đặt `ddl-auto: create`: Hibernate có thể xóa/tạo lại bảng
entity mỗi lần khởi động. Vì vậy user ứng dụng được cấp CREATE trên schema shop.
Flyway vẫn bật theo cấu hình hiện tại. Hai cơ chế cùng quản lý DDL có thể xung đột
khi bắt đầu thêm entity/migration; cần nhóm thống nhất trước khi có dữ liệu cần giữ.
DDL ownership vẫn thuộc user tạo object; quyền DML không tự cho phép user khác
ALTER/DROP object đó.

Tài liệu chính thức:
- https://hub.docker.com/_/postgres
- https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/
