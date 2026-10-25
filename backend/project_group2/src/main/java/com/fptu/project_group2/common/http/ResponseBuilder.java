package com.fptu.project_group2.common.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public final class ResponseBuilder {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final ZoneId APP_ZONE =
            ZoneId.of("Asia/Ho_Chi_Minh");

    private ResponseBuilder() {
        // Prevent instantiation
    }

    // =========================================================
    // SUCCESS RESPONSES
    // =========================================================

    /**
     * HTTP 200 OK with data.
     */
    public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ok(data, "OK");
    }

    /**
     * HTTP 200 OK with data and custom message.
     */
    public static <T> ResponseEntity<ApiResponse<T>> ok(
            T data,
            String message
    ) {
        return build(
                HttpStatus.OK,
                true,
                null,
                message,
                data,
                null
        );
    }

    /**
     * HTTP 200 OK without data.
     */
    public static ResponseEntity<ApiResponse<Void>> ok() {
        return ResponseBuilder.<Void>build(
                HttpStatus.OK,
                true,
                null,
                "OK",
                null,
                null
        );
    }

    /**
     * HTTP 201 Created with data.
     */
    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return created(data, "Created");
    }

    /**
     * HTTP 201 Created with data and custom message.
     */
    public static <T> ResponseEntity<ApiResponse<T>> created(
            T data,
            String message
    ) {
        return build(
                HttpStatus.CREATED,
                true,
                null,
                message,
                data,
                null
        );
    }

    /**
     * HTTP 204 No Content.
     *
     * A 204 response must not contain a response body.
     */
    public static ResponseEntity<Void> noContent() {
        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // COMMON ERROR RESPONSES
    // =========================================================

    /**
     * HTTP 400 Bad Request.
     */
    public static ResponseEntity<ApiResponse<Void>> badRequest(
            String message
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                message,
                null
        );
    }

    /**
     * HTTP 400 Bad Request with a domain error code and error details.
     */
    public static ResponseEntity<ApiResponse<Void>> badRequest(
            Integer errorCode,
            String message,
            Object errors
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                errorCode,
                message,
                errors
        );
    }

    /**
     * HTTP 401 Unauthorized.
     */
    public static ResponseEntity<ApiResponse<Void>> unauthorized(
            String message
    ) {
        return error(
                HttpStatus.UNAUTHORIZED,
                message,
                null
        );
    }

    /**
     * HTTP 403 Forbidden.
     */
    public static ResponseEntity<ApiResponse<Void>> forbidden(
            String message
    ) {
        return error(
                HttpStatus.FORBIDDEN,
                message,
                null
        );
    }

    /**
     * HTTP 404 Not Found.
     */
    public static ResponseEntity<ApiResponse<Void>> notFound(
            String message
    ) {
        return error(
                HttpStatus.NOT_FOUND,
                message,
                null
        );
    }

    /**
     * HTTP 404 Not Found with a default message.
     */
    public static ResponseEntity<ApiResponse<Void>> notFound() {
        return notFound("Resource not found");
    }

    /**
     * HTTP 409 Conflict.
     */
    public static ResponseEntity<ApiResponse<Void>> conflict(
            String message
    ) {
        return error(
                HttpStatus.CONFLICT,
                message,
                null
        );
    }

    /**
     * HTTP 422 Unprocessable Entity.
     */
    public static ResponseEntity<ApiResponse<Void>> unprocessableEntity(
            String message
    ) {
        return error(
                HttpStatus.UNPROCESSABLE_CONTENT,
                message,
                null
        );
    }

    /**
     * HTTP 500 Internal Server Error.
     */
    public static ResponseEntity<ApiResponse<Void>> internalServerError() {
        return internalServerError("Internal server error");
    }

    /**
     * HTTP 500 Internal Server Error with a custom message.
     */
    public static ResponseEntity<ApiResponse<Void>> internalServerError(
            String message
    ) {
        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                message,
                null
        );
    }


    // =========================================================
    // GENERIC ERROR RESPONSE
    // =========================================================

    /**
     * Build a generic error response without a domain error code.
     *
     * The errors field can contain:
     * - A String
     * - A Map<String, String>
     * - A list of validation errors
     * - Another object that Jackson can serialize
     */
    public static ResponseEntity<ApiResponse<Void>> error(
            HttpStatus status,
            String message,
            Object errors
    ) {
        return error(
                status,
                null,
                message,
                errors
        );
    }

    /**
     * Build a generic error response with a domain error code.
     *
     * Only HTTP 4xx and 5xx statuses are accepted.
     */
    public static ResponseEntity<ApiResponse<Void>> error(
            HttpStatus status,
            Integer errorCode,
            String message,
            Object errors
    ) {
        validateErrorStatus(status);

        ApiResponse<Void> body = buildBody(
                status,
                false,
                errorCode,
                message,
                null,
                errors
        );

        return ResponseEntity.status(status).body(body);
    }


    // =========================================================
    // INTERNAL BUILDERS
    // =========================================================

    /**
     * Centralized response builder.
     *
     * All response fields are initialized consistently here.
     */
    private static <T> ResponseEntity<ApiResponse<T>> build(
            HttpStatus status,
            boolean success,
            Integer errorCode,
            String message,
            T data,
            Object errors
    ) {
        ApiResponse<T> body = buildBody(
                status,
                success,
                errorCode,
                message,
                data,
                errors
        );

        return ResponseEntity.status(status).body(body);
    }

    /**
     * Construct the standard ApiResponse body.
     */
    private static <T> ApiResponse<T> buildBody(
            HttpStatus status,
            boolean success,
            Integer errorCode,
            String message,
            T data,
            Object errors
    ) {
        return ApiResponse.<T>builder()
                .success(success)
                .status(status.value())
                .errorCode(errorCode)
                .requestId(UUID.randomUUID().toString())
                .timestamp(getCurrentTimestamp())
                .message(resolveMessage(status, message))
                .path(getCurrentPath())
                .data(data)
                .errors(errors)
                .duration(null)
                .build();
    }


    // =========================================================
    // HELPER METHODS
    // =========================================================

    /**
     * Get the current timestamp in the configured application timezone.
     *
     * Format: yyyy-MM-dd HH:mm:ss
     */
    private static String getCurrentTimestamp() {
        return LocalDateTime.now(APP_ZONE).format(FORMATTER);
    }

    /**
     * Get the current HTTP request path.
     *
     * Returns null when there is no active HTTP request,
     * for example, when called from a background task.
     */
    private static String getCurrentPath() {
        RequestAttributes attributes =
                RequestContextHolder.getRequestAttributes();

        if (!(attributes instanceof ServletRequestAttributes)) {
            return null;
        }

        ServletRequestAttributes servletAttributes =
                (ServletRequestAttributes) attributes;

        return servletAttributes.getRequest().getRequestURI();
    }

    /**
     * Use the supplied message when it is not blank.
     * Otherwise, fall back to the HTTP status reason phrase.
     */
    private static String resolveMessage(
            HttpStatus status,
            String message
    ) {
        if (message != null && !message.trim().isEmpty()) {
            return message;
        }

        return status.getReasonPhrase();
    }

    /**
     * Prevent accidentally creating an error response with a
     * successful or redirect HTTP status.
     */
    private static void validateErrorStatus(HttpStatus status) {
        if (status == null || !status.isError()) {
            throw new IllegalArgumentException(
                    "Error response requires an HTTP 4xx or 5xx status."
            );
        }
    }
}