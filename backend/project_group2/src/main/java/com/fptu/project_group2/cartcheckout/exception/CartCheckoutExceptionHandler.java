package com.fptu.project_group2.cartcheckout.exception;

import com.fptu.project_group2.cartcheckout.controller.CartController;
import com.fptu.project_group2.cartcheckout.controller.CheckoutController;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@lombok.extern.slf4j.Slf4j
@RestControllerAdvice(basePackageClasses = {CartController.class, CheckoutController.class})
public class CartCheckoutExceptionHandler {

    @ExceptionHandler(BaseBusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BaseBusinessException exception) {
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
        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        return ResponseBuilder.error(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED.getCode(),
                "Dữ liệu đầu vào không hợp lệ",
                errors
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException exception) {
        return ResponseBuilder.error(
                HttpStatus.FORBIDDEN,
                ErrorCode.ACCESS_DENIED.getCode(),
                ErrorCode.ACCESS_DENIED.getDefaultMessage(),
                null
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception exception) {
        log.error("Checkout request failed", exception);
        return ResponseBuilder.error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                "Đã xảy ra lỗi. Vui lòng thử lại với cùng yêu cầu.",
                null
        );
    }
}

