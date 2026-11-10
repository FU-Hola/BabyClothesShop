package com.fptu.project_group2.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "warehouse_idempotency", schema = "shop")
public class RequestIdempotencyRecord {

    @EmbeddedId
    private RequestIdempotencyId id;

    @Column(nullable = false, length = 160)
    private String operation;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "response_body", columnDefinition = "text")
    private String responseBody;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
