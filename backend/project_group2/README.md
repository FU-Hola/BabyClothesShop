# JWT cơ bản cho BabyClothesShop

Backend dùng Spring Security + JJWT, phù hợp với luồng bài học: đăng nhập bằng email/mật khẩu, cấp JWT vào cookie, xác minh JWT ở filter rồi tạo SecurityContext. Frontend chưa được chuyển sang cookie; hiện kiểm tra bằng Postman.

## Cấu hình và chạy

Tại thư mục backend/project_group2:

~~~powershell
Copy-Item .env.example .env
openssl rand -base64 32
~~~

Điền cấu hình PostgreSQL vào .env và đặt chuỗi Base64 vừa tạo vào JWT_SECRET_BASE64. Không commit .env hoặc khóa thật. Khởi động PostgreSQL theo ../../docker/postgres/README.md, sau đó chạy:

~~~powershell
.\mvnw.cmd spring-boot:run
~~~

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| JWT_ACCESS_TTL_SECONDS | 900 | Access token có hiệu lực 15 phút |
| JWT_REFRESH_TTL_SECONDS | 604800 | Refresh token có hiệu lực 7 ngày từ lần cấp mới nhất |
| JWT_ISSUER | baby-clothes-shop-api | Hệ thống cấp token |
| JWT_AUDIENCE | baby-clothes-shop | Ứng dụng nhận token |
| AUTH_COOKIE_SECURE | false | Dùng false cho HTTP localhost; true khi triển khai HTTPS |
| CORS_ALLOWED_ORIGINS | http://localhost:5173 | Origin frontend được phép gửi cookie |

Cấu hình phát triển đang dùng ddl-auto=create: mỗi lần khởi động backend sẽ tạo lại bảng và xóa dữ liệu cũ. Hai cột refresh_token_hash và refresh_token_expires_at được tạo trong users. Code không còn ánh xạ bảng auth_sessions; nếu database cũ còn bảng đó thì không còn được ứng dụng sử dụng. Không cần xóa thủ công để thử API.

## Luồng để học

**Đăng nhập:**

~~~text
AuthController nhận email/password
→ AuthService gọi AuthenticationManager
→ DaoAuthenticationProvider gọi DatabaseUserDetailsService
→ BCrypt đối chiếu mật khẩu
→ JwtService tạo access token và refresh token
→ lưu hash refresh token vào users
→ AuthCookieService đặt hai cookie HttpOnly
~~~

**Request tiếp theo:**

~~~text
Cookie accessToken
→ JwtAuthenticationFilter đọc cookie
→ JwtService.verifyAndExtract xác minh và trả claims
→ DatabaseUserDetailsService tải user theo email trong sub
→ kiểm tra tài khoản đang hoạt động
→ tạo Authentication với quyền hiện tại từ database
→ lưu vào SecurityContext
→ Spring kiểm tra quyền
→ controller xử lý nghiệp vụ
~~~

JWT được parse một lần mỗi request. JJWT kiểm tra chữ ký HS256 và thời hạn; ứng dụng kiểm tra thêm issuer, audience và token_type. Không đưa password hoặc role vào JWT; quyền được tải từ database.

STATELESS vẫn được giữ: Spring Security không dùng HTTP session để ghi nhớ đăng nhập. SecurityContext phục vụ request hiện tại; request sau phải xác minh token lại.

## Refresh và logout

Mỗi user giữ **một refresh token hiện tại**, được lưu dưới dạng hash SHA-256, cùng thời hạn. Không lưu chuỗi JWT thô.

- Login mới thay refresh token đang lưu của tài khoản.
- Refresh kiểm tra JWT, hash, thời hạn và trạng thái user, rồi thay bằng cặp token mới. Token refresh cũ không dùng lại được.
- Logout xóa hash/thời hạn refresh token và xóa hai cookie. Gọi lại logout vẫn thành công.
- Không có quản lý thiết bị, danh sách phiên hoặc thu hồi access token theo phiên.
- Access token đã sao chép có thể tiếp tục dùng đến exp sau logout, tối đa 15 phút với cấu hình mặc định. Trình duyệt/Postman bình thường đã bị xóa cookie nên không còn tự gửi token đó.

Hai query khóa dòng user chỉ giữ thao tác login/refresh/logout nhất quán khi request đến đồng thời; đây không phải cơ chế quản lý phiên đăng nhập.

## Test bằng Postman

Kiểm tra thủ công bằng Postman với baseUrl=http://localhost:8080/api/v1 theo bảng dưới đây. Postman tự lưu/gửi các cookie nhận từ Set-Cookie. Không chọn Bearer Token trong Authorization. Dùng email mới mỗi lần đăng ký.

| Request | Kết quả |
|---|---|
| GET /auth/csrf | 200; data.token và cookie XSRF-TOKEN |
| POST /auth/register | 201; tạo CUSTOMER |
| POST /auth/login thiếu CSRF | 403 |
| POST /auth/login sai password | 401 |
| POST /auth/login đúng | 200; profile trong data, JWT trong hai cookie HttpOnly |
| GET /auth/me | 200 nếu access cookie hợp lệ |
| GET /admin/probe với CUSTOMER | 403 |
| POST /auth/refresh | 200; thay hai cookie |
| Dùng lại refresh token cũ | 401 |
| POST /auth/logout | 200; xóa cookie và refresh token trong DB |
| GET /auth/me sau logout, không cookie | 401 |
| POST /auth/refresh sau logout | 401 |
| Gửi lại access token đã sao chép ngay sau logout | 200 trước exp; minh họa giới hạn đã chấp nhận |

Khi gửi thủ công:

1. Gọi GET /api/v1/auth/csrf; giữ cookie XSRF-TOKEN và lấy data.token.
2. Trước mỗi POST/PUT/PATCH/DELETE, gọi lại /auth/csrf rồi thêm X-XSRF-TOKEN bằng data.token mới nhất. Spring có thể xóa CSRF cookie khi xác thực request. Giá trị trong JSON đã được Spring mã hóa để chống BREACH; không chép trực tiếp giá trị cookie vào header.
3. Register/login gửi JSON; refresh/logout không cần body, backend đọc refreshToken từ cookie.
4. Login trả profile trong data, không trả JWT trong JSON. Kiểm tra JWT ở Cookies hoặc Set-Cookie.
5. Dùng cùng hostname, ví dụ luôn là localhost; không chuyển qua lại localhost và 127.0.0.1.

Khi cố tình gửi lại token cũ, tắt cookie jar riêng cho request đó để không trộn cookie thử nghiệm với cookie hiện tại. Chỉ lưu token vào biến Postman để minh họa kiểm thử; frontend sau này không đọc hoặc lưu JWT trong localStorage. Collection kiểm thử được giữ cục bộ theo quy ước không commit file test.

CSRF được bật cho cả login, register, refresh, logout và API thay đổi dữ liệu. JWT cookie được trình duyệt tự gửi nên STATELESS không thay thế CSRF protection. Tham khảo [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html) và [Postman cookie manager](https://learning.postman.com/docs/use/send-requests/response-data/cookies/).

## Phân quyền và mã lỗi

| Đường dẫn | Quyền |
|---|---|
| /api/v1/store-staff/** | STORE_STAFF |
| /api/v1/warehouse-staff/** | WAREHOUSE_STAFF |
| /api/v1/admin/** | ADMIN |

ADMIN không tự kế thừa quyền staff. GET /api/v1/categories và các endpoint auth trừ /me là public về authentication; các POST vẫn cần CSRF. Controller lấy user ID từ principal đã xác minh; X-User-Id không quyết định danh tính.

Response vẫn dùng ApiResponse. Mã lỗi: 1001 chưa đăng nhập, 1002 thiếu quyền hoặc CSRF không hợp lệ, 1003 sai thông tin đăng nhập, 1004 JWT/refresh token hết hạn hoặc không hợp lệ. Đăng ký luôn tạo CUSTOMER, không nhận role từ client.

## Đóng gói backend

~~~powershell
.\mvnw.cmd '-Dmaven.test.skip=true' package
~~~

Theo quy ước dự án, các file test được tạo mới hoặc chỉnh sửa không đi kèm commit JWT này. Các test đang được Git theo dõi vẫn dùng cấu trúc xác thực cũ và chưa đồng bộ với code cookie mới; lệnh mvn test hoặc mvn verify sẽ cần cập nhật test trước khi sử dụng. Lệnh trên bỏ cả biên dịch và chạy test để đóng gói code ứng dụng.
