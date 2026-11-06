package com.fptu.project_group2.catalogstock.dto.request;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
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

    @NotNull
    private UUID categoryId;

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    private String description;

    @NotNull
    private ProductStatus status;

    @NotNull
    private List<@NotNull @Valid VariantRequest> variants;

    @Getter
    @Setter
    public static class VariantRequest {

        private UUID id;

        @NotBlank
        @Size(max = 64)
        private String sku;

        @NotBlank
        @Size(max = 100)
        private String color;

        @NotBlank
        @Size(max = 40)
        private String size;

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
        private BigDecimal price;

        @DecimalMin("0.0")
        private BigDecimal originalPrice;

        @NotNull
        private Boolean active;
    }
}