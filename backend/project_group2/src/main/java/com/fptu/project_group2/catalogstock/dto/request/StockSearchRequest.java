package com.fptu.project_group2.catalogstock.dto.request;

import com.fptu.project_group2.catalogstock.common.StockStatus;
import com.fptu.project_group2.common.http.PagingRequest;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class StockSearchRequest extends PagingRequest {

    private String keyword;

    private UUID categoryId;

    private String variantSize;

    private StockStatus status;
}