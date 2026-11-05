package com.fptu.project_group2.catalogstock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class ProductImageResponse {

    private UUID id;

    private UUID productId;

    private String imageUrl;

    private String color;

    private Integer sortOrder;
}
