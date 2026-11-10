package com.fptu.project_group2.catalogstock.dto.request;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class UpdateProductRequest {

    @NotNull(message = "Vui lòng chọn danh mục")
    private UUID categoryId;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm tối đa 255 ký tự")
    private String name;

    @NotBlank(message = "Mô tả sản phẩm không được để trống")
    @Size(max = 1000, message = "Mô tả sản phẩm tối đa 1000 ký tự")
    private String description;

    @NotNull(message = "Vui lòng chọn trạng thái kinh doanh")
    private ProductStatus status;

    @NotNull(message = "Thiếu phiên bản dữ liệu, vui lòng tải lại trang")
    private Long version;

    @NotNull(message = "Danh sách biến thể không được để trống")
    private List<@NotNull(message = "Biến thể không được để trống") @Valid VariantRequest> variants;

    @Getter
    @Setter
    public static class VariantRequest {

        private UUID id;

        @NotBlank(message = "SKU không được để trống")
        @Size(max = 64, message = "SKU tối đa 64 ký tự")
        private String sku;

        @NotBlank(message = "Màu sắc không được để trống")
        @Size(max = 100, message = "Màu sắc tối đa 100 ký tự")
        private String color;

        @NotBlank(message = "Kích cỡ không được để trống")
        @Size(max = 40, message = "Kích cỡ tối đa 40 ký tự")
        private String size;

        @NotNull(message = "Giá bán không được để trống")
        @DecimalMin(value = "0", inclusive = false, message = "Giá bán phải lớn hơn 0")
        @Digits(integer = 17, fraction = 0, message = "Giá bán phải là số nguyên, tối đa 17 chữ số")
        private BigDecimal price;

        @DecimalMin(value = "0", message = "Giá trước giảm không được âm")
        @Digits(integer = 17, fraction = 0, message = "Giá trước giảm phải là số nguyên, tối đa 17 chữ số")
        private BigDecimal originalPrice;

        @NotNull(message = "Vui lòng chọn trạng thái biến thể")
        private Boolean active;
    }
}
