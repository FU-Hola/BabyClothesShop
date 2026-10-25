package com.fptu.project_group2.common.exception;

import lombok.Getter;

@Getter
public class BadRequestException extends BaseBusinessException {

    public BadRequestException(String message) {
        super(ErrorCode.BAD_REQUEST, message);
    }

    public BadRequestException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public BadRequestException(ErrorCode errorCode) {
        super(errorCode);
    }
}
