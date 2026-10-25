package com.fptu.project_group2.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Danh mục mã lỗi nghiệp vụ chuẩn hóa toàn hệ thống (Domain Error Code Catalog)
 */
@Getter
public enum ErrorCode {

    // ─── 1000 - 1999: Chung & Xác thực (Auth & Common) ──────────────────────────
    UNAUTHENTICATED(1001, HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập để thực hiện thao tác này"),
    ACCESS_DENIED(1002, HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này"),
    INVALID_CREDENTIALS(1003, HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác"),
    TOKEN_EXPIRED(1004, HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn hoặc không hợp lệ"),
    VALIDATION_FAILED(1005, HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    RESOURCE_NOT_FOUND(1006, HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"),
    BAD_REQUEST(1007, HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ"),

    // ─── 2000 - 2999: Tin đăng & Mua bán (Market Posts) ─────────────────────────
    POST_NOT_FOUND(2001, HttpStatus.NOT_FOUND, "Không tìm thấy bài đăng yêu cầu"),
    POST_ALREADY_SOLD(2002, HttpStatus.BAD_REQUEST, "Sản phẩm đã được bán hoặc không còn khả dụng"),
    POST_ACCESS_DENIED(2003, HttpStatus.FORBIDDEN, "Bạn không có quyền chỉnh sửa bài đăng này"),
    POST_IMAGE_UPLOAD_FAILED(2004, HttpStatus.BAD_REQUEST, "Tải ảnh sản phẩm thất bại"),

    // ─── 3000 - 3999: Chat & Tin nhắn (Messaging) ──────────────────────────────
    CONVERSATION_NOT_FOUND(3001, HttpStatus.NOT_FOUND, "Cuộc trò chuyện không tồn tại"),
    CANNOT_CHAT_WITH_SELF(3002, HttpStatus.BAD_REQUEST, "Bạn không thể trò chuyện với chính mình"),
    CHAT_MESSAGE_DELIVERY_FAILED(3003, HttpStatus.INTERNAL_SERVER_ERROR, "Không thể chuyển phát tin nhắn"),

    // ─── 9000 - 9999: Lỗi Kỹ Thuật & Hệ Thống (System & Technical) ──────────────
    INTERNAL_SERVER_ERROR(9999, HttpStatus.INTERNAL_SERVER_ERROR, "Đã có lỗi hệ thống xảy ra. Vui lòng liên hệ hỗ trợ kỹ thuật."),
    DATABASE_ERROR(9998, HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi kết nối hoặc xử lý cơ sở dữ liệu"),
    EXTERNAL_SERVICE_ERROR(9997, HttpStatus.BAD_GATEWAY, "Dịch vụ liên kết bên ngoài tạm thời không khả dụng");

    private final int code;
    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(int code, HttpStatus httpStatus, String defaultMessage) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }
}
