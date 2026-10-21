package com.fptu.project_group2.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;


@Getter
public class BaseBusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Object details;

    public BaseBusinessException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage(), null, false, false);
        this.errorCode = errorCode;
        this.details = null;
    }

    public BaseBusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage != null ? customMessage : errorCode.getDefaultMessage(), null, false, false);
        this.errorCode = errorCode;
        this.details = null;
    }

    public BaseBusinessException(ErrorCode errorCode, String customMessage, Object details) {
        super(customMessage != null ? customMessage : errorCode.getDefaultMessage(), null, false, false);
        this.errorCode = errorCode;
        this.details = details;
    }

    public BaseBusinessException(ErrorCode errorCode, Object details) {
        super(errorCode.getDefaultMessage(), null, false, false);
        this.errorCode = errorCode;
        this.details = details;
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }

    public HttpStatus getHttpStatus() {
        return errorCode.getHttpStatus();
    }

    public int getStatusCode() {
        return errorCode.getHttpStatus().value();
    }
}