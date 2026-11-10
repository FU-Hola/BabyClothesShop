package com.fptu.project_group2.common.service.impl;

import com.fptu.project_group2.common.entity.RequestIdempotencyId;
import com.fptu.project_group2.common.entity.RequestIdempotencyRecord;
import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.repository.RequestIdempotencyRepository;
import com.fptu.project_group2.common.security.CurrentActorProvider;
import com.fptu.project_group2.common.service.RequestIdempotency;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class RequestIdempotencyService implements RequestIdempotency {

    private static final String IDEMPOTENCY_KEY_PATTERN = "[A-Za-z0-9._:-]{1,128}";

    private final RequestIdempotencyRepository requestIdempotencyRepository;
    private final ObjectMapper objectMapper;
    private final CurrentActorProvider currentActorProvider;

    @Override
    @Transactional
    public ResponseEntity<String> execute(
            String idempotencyKey,
            String operation,
            Object request,
            Supplier<? extends ResponseEntity<?>> action
    ) {
        validateIdempotencyKey(idempotencyKey);

        UUID actorId = currentActorProvider.currentActor().getId();
        String requestHash = createRequestHash(operation, request);

        int claimedRows = requestIdempotencyRepository.claimRequest(
                actorId,
                idempotencyKey,
                operation,
                requestHash
        );

        if (claimedRows == 0) {
            return replayResponse(actorId, idempotencyKey, operation, requestHash);
        }

        // The key, business changes and stored response commit or roll back together.
        ResponseEntity<?> actionResponse = action.get();

        if (!actionResponse.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Only successful actions may be cached");
        }

        int responseStatus = actionResponse.getStatusCode().value();
        String responseBody = objectMapper.writeValueAsString(actionResponse.getBody());

        requestIdempotencyRepository.saveResponse(
                actorId,
                idempotencyKey,
                responseStatus,
                responseBody
        );

        return buildResponse(responseStatus, responseBody);
    }

    private void validateIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null || !idempotencyKey.matches(IDEMPOTENCY_KEY_PATTERN)) {
            throw new BadRequestException("Idempotency-Key phải có 1–128 ký tự chữ, số hoặc . _ : -");
        }
    }

    private ResponseEntity<String> replayResponse(
            UUID actorId,
            String idempotencyKey,
            String operation,
            String requestHash
    ) {
        RequestIdempotencyId requestId = new RequestIdempotencyId(actorId, idempotencyKey);
        RequestIdempotencyRecord storedRequest = requestIdempotencyRepository.findById(requestId)
                .orElseThrow(() -> new IllegalStateException("Claimed idempotency request was not found"));

        if (!operation.equals(storedRequest.getOperation())
                || !requestHash.equals(storedRequest.getRequestHash())) {
            throw new BaseBusinessException(
                    ErrorCode.CONFLICT,
                    "Idempotency-Key đã được dùng cho nội dung hoặc thao tác khác"
            );
        }

        if (storedRequest.getResponseStatus() == null) {
            throw new BaseBusinessException(
                    ErrorCode.CONFLICT,
                    "Yêu cầu đang được xử lý; thử lại với cùng khóa"
            );
        }

        return buildResponse(storedRequest.getResponseStatus(), storedRequest.getResponseBody());
    }

    private ResponseEntity<String> buildResponse(int responseStatus, String responseBody) {
        return ResponseEntity.status(responseStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(responseBody);
    }

    private String createRequestHash(String operation, Object request) {
        String serializedRequest = objectMapper.writeValueAsString(request);
        String hashInput = operation + "\n" + serializedRequest;

        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = messageDigest.digest(hashInput.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
