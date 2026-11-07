package com.fptu.project_group2.warehouse.exception;

import java.util.Map;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import java.util.LinkedHashMap;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.PessimisticLockingFailureException;

@RestControllerAdvice(basePackages = "com.fptu.project_group2.warehouse.controller")
public class WarehouseExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(WarehouseExceptionHandler.class);
    @ExceptionHandler(BaseBusinessException.class)
    public ResponseEntity<ApiResponse<Void>> business(BaseBusinessException ex) {
        return ResponseBuilder.error(ex.getHttpStatus(), ex.getErrorCode().getCode(), ex.getMessage(), ex.getDetails());
    }
    @ExceptionHandler({OptimisticLockingFailureException.class, DataIntegrityViolationException.class, PessimisticLockingFailureException.class})
    public ResponseEntity<ApiResponse<Void>> conflict(Exception ex) {
        return ResponseBuilder.error(HttpStatus.CONFLICT, ErrorCode.CONFLICT.getCode(),
                "Dữ liệu đã thay đổi hoặc vi phạm ràng buộc. Vui lòng tải lại phiếu.", null);
    }
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> constraint(ConstraintViolationException ex) {
        Map<String, String> fields = new LinkedHashMap<String, String>();
        ex.getConstraintViolations().forEach(v -> fields.putIfAbsent(v.getPropertyPath().toString(), v.getMessage()));
        return ResponseBuilder.badRequest(ErrorCode.VALIDATION_FAILED.getCode(), "Dữ liệu đầu vào không hợp lệ", fields);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Object errors = null;
        String message = status.is4xxClientError() ? "Yêu cầu không hợp lệ" : "Lỗi hệ thống";
        // Trả lỗi theo tên trường để frontend hiển thị ngay cạnh ô nhập tương ứng.
        if (ex instanceof MethodArgumentNotValidException validation) {
            Map<String, String> fields = new LinkedHashMap<String, String>();
            validation.getBindingResult().getFieldErrors().forEach(error ->
                    fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
            errors = fields;
            message = "Dữ liệu đầu vào không hợp lệ";
        }
        ResponseEntity<ApiResponse<Void>> response = ResponseBuilder.error(HttpStatus.valueOf(status.value()),
                status.is4xxClientError() ? ErrorCode.BAD_REQUEST.getCode() : ErrorCode.INTERNAL_SERVER_ERROR.getCode(), message, errors);
        return new ResponseEntity<>(response.getBody(), headers, status);
    }
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> denied(Exception ex) {
        return ResponseBuilder.error(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED.getCode(), "Không có quyền truy cập", null);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> unexpected(Exception ex) {
        // Chỉ ghi chi tiết lỗi vào log; response không để lộ SQL hoặc stack trace.
        log.error("Unhandled request failure", ex);
        return ResponseBuilder.error(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                ErrorCode.INTERNAL_SERVER_ERROR.getDefaultMessage(), null);
    }
}
