package com.fptu.project_group2.authaccount.exception;

import com.fptu.project_group2.authaccount.controller.AuthController;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

// Xử lý lỗi từ AuthController/AuthService; lỗi ở JWT filter được ghi bằng SecurityErrorWriter.
@RestControllerAdvice(basePackageClasses = AuthController.class)
public class AuthExceptionHandler {
    // JSON sai kiểu, field không được phép hoặc UUID sai đều phải trả lỗi 400 thống nhất.
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleInvalidRequest(Exception exception) {
        return ResponseBuilder.error(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED.getCode(),
                "Dữ liệu đầu vào không hợp lệ hoặc chứa trường không được phép", null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException exception) {
        // AuthenticationManager ném lỗi khi mật khẩu sai hoặc tài khoản không hoạt động.
        return ResponseBuilder.error(
                HttpStatus.UNAUTHORIZED,
                ErrorCode.INVALID_CREDENTIALS.getCode(),
                ErrorCode.INVALID_CREDENTIALS.getDefaultMessage(),
                null
        );
    }

    @ExceptionHandler(BaseBusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BaseBusinessException exception) {
        // Giữ mã lỗi nghiệp vụ, ví dụ email đã tồn tại hoặc refresh token không hợp lệ.
        return ResponseBuilder.error(
                exception.getHttpStatus(),
                exception.getErrorCode().getCode(),
                exception.getMessage(),
                exception.getDetails()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return ResponseBuilder.error(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED.getCode(),
                ErrorCode.VALIDATION_FAILED.getDefaultMessage(),
                errors
        );
    }
}
