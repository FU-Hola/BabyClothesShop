package com.fptu.project_group2.catalogstock.dto.request;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.common.http.PagingRequest;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.UUID;

@Getter
@Setter
public class ProductSearchRequest extends PagingRequest {
    private String keyword;
    private UUID categoryId;
    private ProductStatus status;
    private Sort.Direction sortDirection = Sort.Direction.DESC;
}
