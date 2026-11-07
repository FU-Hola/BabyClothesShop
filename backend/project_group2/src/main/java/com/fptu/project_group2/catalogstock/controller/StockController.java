package com.fptu.project_group2.catalogstock.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.fptu.project_group2.catalogstock.dto.request.StockSearchRequest;
import com.fptu.project_group2.catalogstock.dto.response.StockResponse;
import com.fptu.project_group2.catalogstock.dto.response.StockSummaryResponse;
import com.fptu.project_group2.catalogstock.service.IStock;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasRole('WAREHOUSE_STAFF')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/warehouse-staff/stocks")
public class StockController {

    private final IStock stockService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StockResponse>>> searchStock(
            @ModelAttribute StockSearchRequest request
    ) {
        Page<StockResponse> stocks = stockService.searchStock(request);

        PageResponse<StockResponse> response = PageResponse.of(stocks);
        response.setPage(stocks.getNumber() + 1);

        return ResponseBuilder.ok(
                response,
                "Lấy danh sách tồn kho thành công"
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<StockSummaryResponse>> getStockSummary() {
        StockSummaryResponse response = stockService.getStockSummary();

        return ResponseBuilder.ok(
                response,
                "Lấy thống kê tồn kho thành công"
        );
    }
}
