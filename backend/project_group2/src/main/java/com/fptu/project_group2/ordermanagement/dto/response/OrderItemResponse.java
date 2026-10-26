
package com.fptu.project_group2.ordermanagement.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Product information captured at checkout, not the current catalog values.
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class OrderItemResponse {

    private String id;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String productNameSnapshot;
    private String skuSnapshot;
    private String colorSnapshot;
    private String sizeSnapshot;
    private String imageUrlSnapshot;
}
