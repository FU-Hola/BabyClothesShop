package com.fptu.project_group2.common.service;

import org.springframework.http.ResponseEntity;

import java.util.function.Supplier;

public interface RequestIdempotency {

    ResponseEntity<String> execute(
            String idempotencyKey,
            String operation,
            Object request,
            Supplier<? extends ResponseEntity<?>> action
    );
}
