package com.fptu.project_group2.catalogstock.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UploadProductImageRequest {
    @NotNull
    private MultipartFile file;
    @NotBlank
    @Size(max = 100)
    private String color;
    @NotNull
    @Min(0)
    private Integer sortOrder = 0;
}
