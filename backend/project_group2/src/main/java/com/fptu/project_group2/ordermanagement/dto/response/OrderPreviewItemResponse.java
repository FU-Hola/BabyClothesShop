package com.fptu.project_group2.ordermanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** First item shown on a customer's order history card. */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class OrderPreviewItemResponse {

    private String productName;
    private String color;
    private String size;
    private Integer quantity;
    private String imageUrl;
}
