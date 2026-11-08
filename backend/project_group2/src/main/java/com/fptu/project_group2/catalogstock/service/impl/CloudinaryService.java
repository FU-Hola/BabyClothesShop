package com.fptu.project_group2.catalogstock.service.impl;

import com.cloudinary.Cloudinary;
import com.fptu.project_group2.catalogstock.dto.response.CloudinaryUploadResponse;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryUploadResponse uploadImage(MultipartFile file) {
        validateConfiguration();
        validateFile(file);

        Map<?, ?> result;

        try {
            result = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of(
                            "resource_type", "image",
                            "allowed_formats", List.of("jpg", "jpeg", "png", "webp")
                    )
            );
        } catch (IOException | RuntimeException exception) {
            throw new BaseBusinessException(
                    ErrorCode.EXTERNAL_SERVICE_ERROR,
                    "Không thể upload ảnh lên Cloudinary. Vui lòng thử lại"
            );
        }

        return CloudinaryUploadResponse.builder()
                .imageUrl((String) result.get("secure_url"))
                .publicId((String) result.get("public_id"))
                .build();
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(cloudinary.config.cloudName)
                || !StringUtils.hasText(cloudinary.config.apiKey)
                || !StringUtils.hasText(cloudinary.config.apiSecret)) {
            throw new BaseBusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "Chưa cấu hình đầy đủ Cloudinary"
            );
        }
    }

    public void deleteImage(String publicId) {
        validateConfiguration();

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(
                    publicId,
                    Map.of("resource_type", "image", "invalidate", true)
            );

            if (!"ok".equals(result.get("result")) && !"not found".equals(result.get("result"))) {
                throw new IllegalStateException("Cloudinary chưa xác nhận xóa ảnh");
            }
        } catch (IOException | RuntimeException exception) {
            throw new BaseBusinessException(
                    ErrorCode.EXTERNAL_SERVICE_ERROR,
                    "Không thể xóa ảnh trên Cloudinary. Vui lòng thử lại"
            );
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BaseBusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Vui lòng chọn file ảnh"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !List.of(
                "image/jpeg",
                "image/png",
                "image/webp"
        ).contains(contentType)) {
            throw new BaseBusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP"
            );
        }
    }
}
