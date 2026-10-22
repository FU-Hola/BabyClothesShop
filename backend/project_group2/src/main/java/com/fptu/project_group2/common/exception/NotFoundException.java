package com.fptu.project_group2.common.exception;

import lombok.Getter;

@Getter
public class NotFoundException extends BaseBusinessException {

    public NotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(ErrorCode.RESOURCE_NOT_FOUND,
                String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue));
    }

    public NotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }

    public NotFoundException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
