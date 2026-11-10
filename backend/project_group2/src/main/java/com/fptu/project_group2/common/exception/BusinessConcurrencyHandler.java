package com.fptu.project_group2.common.exception;

import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Apply consistently to checkout, Store and Warehouse, including shared service errors. */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages={"com.fptu.project_group2.cartcheckout.controller",
        "com.fptu.project_group2.ordermanagement.controllers", "com.fptu.project_group2.warehouse.controller"})
public class BusinessConcurrencyHandler {
    @ExceptionHandler(BaseBusinessException.class)
    public ResponseEntity<ApiResponse<Void>> business(BaseBusinessException error) {
        return ResponseBuilder.error(error.getHttpStatus(),error.getErrorCode().getCode(),error.getMessage(),error.getDetails());
    }

    @ExceptionHandler({org.springframework.web.bind.MissingRequestHeaderException.class,
            org.springframework.http.converter.HttpMessageNotReadableException.class})
    public ResponseEntity<ApiResponse<Void>> badRequest(Exception error) {
        return ResponseBuilder.badRequest(ErrorCode.BAD_REQUEST.getCode(), "Thiếu header bắt buộc hoặc nội dung JSON không hợp lệ", null);
    }

    @ExceptionHandler(ConcurrencyFailureException.class)
    public ResponseEntity<ApiResponse<Void>> concurrent(ConcurrencyFailureException error) {
        return ResponseBuilder.conflict("Dữ liệu đang được xử lý hoặc đã thay đổi. Tải lại dữ liệu; nếu chưa rõ kết quả, thử lại với cùng Idempotency-Key.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> duplicate(DataIntegrityViolationException error) {
        return ResponseBuilder.conflict("Thao tác trùng hoặc dữ liệu không còn hợp lệ. Vui lòng kiểm tra lại trạng thái.");
    }
}
