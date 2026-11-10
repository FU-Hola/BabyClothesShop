-- Thêm cột version cho bảng products để chống ghi đè khi 2 người cùng sửa một sản phẩm (optimistic locking).
-- Mỗi lần lưu sản phẩm, version tăng thêm 1. Sản phẩm đã có sẵn bắt đầu từ version 0.
ALTER TABLE shop.products
    ADD COLUMN version bigint NOT NULL DEFAULT 0;
