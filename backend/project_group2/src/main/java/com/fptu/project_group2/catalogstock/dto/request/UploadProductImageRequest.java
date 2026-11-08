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
    @NotNull(message = "Vui lòng chọn file ảnh")
    private MultipartFile file;
    @NotBlank(message = "Vui lòng chọn màu ảnh")
    @Size(max = 100, message = "Màu ảnh tối đa 100 ký tự")
    private String color;
    @NotNull(message = "Thứ tự ảnh không được để trống")
    @Min(value = 0, message = "Thứ tự ảnh không được âm")
    private Integer sortOrder = 0;
}
