package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.IssueSearchRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CreateGoodsIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.IssueVersionRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.UpdatePickingRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.PackIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.ExportIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CancelIssueRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface IGoodsIssue {
    GoodsIssueDetailResponse createGoodsIssue(CreateGoodsIssueRequest request);
    GoodsIssueDetailResponse getDetail(UUID id);
    PageResponse<GoodsIssueResponse> search(IssueSearchRequest request, Pageable pageable);
    GoodsIssueDetailResponse startPicking(UUID id, IssueVersionRequest request);
    GoodsIssueDetailResponse updatePicking(UUID id,  UpdatePickingRequest request);
    GoodsIssueDetailResponse pack(UUID id, PackIssueRequest request);
    GoodsIssueDetailResponse export(UUID id,  ExportIssueRequest request);
    GoodsIssueDetailResponse cancel(UUID id, CancelIssueRequest request);
    GoodsIssueDetailResponse recreate(UUID id,IssueVersionRequest request);
}
