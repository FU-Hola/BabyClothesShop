package com.fptu.project_group2.common.service;

import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.security.CurrentActorProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class RequestIdempotency {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final CurrentActorProvider actors;

    @Transactional
    public ResponseEntity<String> execute(String key, String operation, Object request,
                                          Supplier<? extends ResponseEntity<?>> action) {
        if (key == null || !key.matches("[A-Za-z0-9._:-]{1,128}")) {
            throw new BadRequestException("Idempotency-Key phải có 1–128 ký tự chữ, số hoặc . _ : -");
        }
        var actor = actors.currentActor().getId();
        String hash = hash(operation + "\n" + json.writeValueAsString(request));
        // ON CONFLICT waits for a competing transaction to commit/rollback.
        // A failed action rolls back the reservation together with its writes.
        int claimed = jdbc.update("""
                INSERT INTO shop.warehouse_idempotency(actor_id,idempotency_key,operation,request_hash)
                VALUES (?,?,?,?) ON CONFLICT (actor_id,idempotency_key) DO NOTHING
                """, actor, key, operation, hash);
        if (claimed == 0) {
            return jdbc.queryForObject("""
                    SELECT operation,request_hash,response_status,response_body
                    FROM shop.warehouse_idempotency WHERE actor_id=? AND idempotency_key=?
                    """, (rs, row) -> {
                if (!operation.equals(rs.getString("operation")) || !hash.equals(rs.getString("request_hash"))) {
                    throw new BaseBusinessException(ErrorCode.CONFLICT,
                            "Idempotency-Key đã được dùng cho nội dung hoặc thao tác khác");
                }
                Integer status = rs.getObject("response_status", Integer.class);
                if (status == null) {
                    throw new BaseBusinessException(ErrorCode.CONFLICT, "Yêu cầu đang được xử lý; thử lại với cùng khóa");
                }
                return response(status, rs.getString("response_body"));
            }, actor, key);
        }

        var result = action.get();
        if (!result.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Only successful actions may be cached");
        }
        String body = json.writeValueAsString(result.getBody());
        jdbc.update("""
                UPDATE shop.warehouse_idempotency SET response_status=?,response_body=?
                WHERE actor_id=? AND idempotency_key=?
                """, result.getStatusCode().value(), body, actor, key);
        return response(result.getStatusCode().value(), body);
    }

    private ResponseEntity<String> response(int status, String body) {
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(body);
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }
}
