package com.fptu.project_group2.catalogstock.service;

import com.fptu.project_group2.catalogstock.dto.request.StockSearchRequest;
import com.fptu.project_group2.catalogstock.dto.response.StockResponse;
import com.fptu.project_group2.catalogstock.dto.response.StockSummaryResponse;
import org.springframework.data.domain.Page;

public interface IStock {
    Page<StockResponse> searchStock(StockSearchRequest request);

    StockSummaryResponse getStockSummary();
}
