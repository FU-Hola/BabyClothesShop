package com.fptu.project_group2.catalogstock.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CloudinaryUploadResponse {
    private String imageUrl;
    private String publicId;

}
