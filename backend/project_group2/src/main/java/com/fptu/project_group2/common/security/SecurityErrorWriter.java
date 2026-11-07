package com.fptu.project_group2.common.security;

import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Ghi lỗi bảo mật trực tiếp vào HTTP response theo định dạng ApiResponse của dự án.
 * Filter chạy trước controller nên lỗi ở đây không được xử lý như lỗi controller.
 */
@Component
@RequiredArgsConstructor
public class SecurityErrorWriter {
    private final ObjectMapper objectMapper;

    public void write(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        var responseEntity = ResponseBuilder.error(
                errorCode.getHttpStatus(),
                errorCode.getCode(),
                errorCode.getDefaultMessage(),
                null
        );
        response.setStatus(errorCode.getHttpStatus().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), responseEntity.getBody());
    }
}
