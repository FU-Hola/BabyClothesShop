package com.fptu.project_group2.catalogstock.exception;

import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.fptu.project_group2.catalogstock.controller")
public class CatalogExceptionHandler {
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeException(MaxUploadSizeExceededException exception) {
        return ResponseBuilder.error(
                HttpStatus.valueOf(413),
                ErrorCode.VALIDATION_FAILED.getCode(),
                "File ảnh hoặc tổng dung lượng request vượt quá giới hạn cho phép",
                null
        );
    }

    @ExceptionHandler(BaseBusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BaseBusinessException exception) {
        return ResponseBuilder.error(exception.getHttpStatus(), exception.getErrorCode().getCode(),
                exception.getMessage(), exception.getDetails());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        return ResponseBuilder.error(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED.getCode(),
                "Dữ liệu đầu vào không hợp lệ", errors);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleInvalidRequest(Exception exception) {
        return ResponseBuilder.error(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED.getCode(),
                "Dữ liệu đầu vào không hợp lệ", null);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLock(OptimisticLockingFailureException exception) {
        return ResponseBuilder.error(HttpStatus.CONFLICT, ErrorCode.CONFLICT.getCode(),
                "Sản phẩm vừa được người khác cập nhật. Vui lòng tải lại trang rồi thử lại", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        return ResponseBuilder.error(HttpStatus.CONFLICT, ErrorCode.CONFLICT.getCode(),
                "Dữ liệu không hợp lệ hoặc đã tồn tại. Vui lòng kiểm tra lại", null);
    }
}
