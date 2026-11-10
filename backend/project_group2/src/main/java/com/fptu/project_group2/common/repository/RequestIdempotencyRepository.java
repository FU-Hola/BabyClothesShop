package com.fptu.project_group2.common.repository;

import com.fptu.project_group2.common.entity.RequestIdempotencyId;
import com.fptu.project_group2.common.entity.RequestIdempotencyRecord;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RequestIdempotencyRepository
        extends Repository<RequestIdempotencyRecord, RequestIdempotencyId> {

    Optional<RequestIdempotencyRecord> findById(RequestIdempotencyId id);

    @Modifying
    @Query(value = """
        INSERT INTO shop.warehouse_idempotency (
            actor_id, idempotency_key, operation, request_hash
        )
        VALUES (:actorId, :idempotencyKey, :operation, :requestHash)
        ON CONFLICT (actor_id, idempotency_key) DO NOTHING
        """, nativeQuery = true)
    int claimRequest(
            @Param("actorId") UUID actorId,
            @Param("idempotencyKey") String idempotencyKey,
            @Param("operation") String operation,
            @Param("requestHash") String requestHash
    );

    @Modifying
    @Query(value = """
        UPDATE shop.warehouse_idempotency
        SET response_status = :responseStatus, response_body = :responseBody
        WHERE actor_id = :actorId AND idempotency_key = :idempotencyKey
        """, nativeQuery = true)
    int saveResponse(
            @Param("actorId") UUID actorId,
            @Param("idempotencyKey") String idempotencyKey,
            @Param("responseStatus") int responseStatus,
            @Param("responseBody") String responseBody
    );
}
