package com.fptu.project_group2.common.http;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiResponse<T> {
    private final boolean success;
    private final int status;
    private final Integer errorCode;   // Domain Error Code (e.g., 1001, 2001, 9999)
    private final String requestId;
    private final String timestamp;   // format: "yyyy-MM-dd HH:mm:ss"
    private final String message;
    private final String path;
    private final T data;
    private final Object errors;       // Map<String,String> or String
    private final String duration;
}
