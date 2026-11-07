package com.fptu.project_group2.ordermanagement.common;

public class OrderConflictException extends RuntimeException {
    public OrderConflictException(String message) {
        super(message);
    }
}
