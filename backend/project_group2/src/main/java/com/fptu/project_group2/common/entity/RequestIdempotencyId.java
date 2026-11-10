package com.fptu.project_group2.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Embeddable
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class RequestIdempotencyId implements Serializable {

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "idempotency_key", nullable = false, length = 128)
    private String idempotencyKey;
}
