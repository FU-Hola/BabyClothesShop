# Deploy SBA trên laptop

## Cập nhật app

Chạy tại thư mục gốc project sau khi đã cài dependency frontend:

```bash
bash deploy.sh
```

Script build JAR và frontend rồi build/restart các service Compose. Không chạy
test tự động, không backup, không khởi động hoặc cấu hình Cloudflare Tunnel.
PostgreSQL tiếp tục dùng volume hiện có. Mock account API dùng volume riêng
`sba_mock-data` tại `/app/data`; rebuild không tự thay dữ liệu đã lưu trong volume.

## Địa chỉ

- Web local: http://127.0.0.1:8088
- Healthcheck Nginx: http://127.0.0.1:8088/healthz
- Backend local: http://127.0.0.1:8081
- Nginx `/api/v1/` chuyển sang Spring Boot `backend:8080`.
- Nginx `/api/` chuyển sang mock account server `mock:3000`.

Chưa bổ sung auth mới. Các chức năng đăng nhập/phân quyền và mock sẵn có của app
được giữ nguyên. Có thể truy cập trực tiếp API kho đang mở nếu public app.

## Cloudflare

Service `web` tham gia `proxy_net` với alias `sba-web`. Connector hiện có
`cloudflared-tunnel` cũng được cấu hình trên mạng này.

Trong tunnel đúng của laptop, thêm Published application:

- Subdomain: `sba`
- Domain: `hungnm.id.vn`
- Path: trống
- Type: HTTP
- URL: `sba-web:80`

Đây là cấu hình dự kiến; phải kiểm tra connector online và route/DNS đã lưu trước
khi xác nhận https://sba.hungnm.id.vn truy cập được. Tunnel hiện chưa được bật
trong lần triển khai local này do bộ kiểm duyệt tự động chặn thao tác khởi động
tunnel cũ khi chưa xác minh phạm vi các route khác.

## Xem trạng thái và log

```bash
docker compose --env-file backend/project_group2/.env -f docker-compose.yaml -f compose.deploy.yaml ps
docker compose --env-file backend/project_group2/.env -f docker-compose.yaml -f compose.deploy.yaml logs --tail=80 backend web mock
```

Restart policy chỉ có hiệu lực khi Docker daemon hoạt động. Chưa thay đổi cấu hình
tự chạy Docker sau reboot hoặc cấu hình sleep của laptop.
