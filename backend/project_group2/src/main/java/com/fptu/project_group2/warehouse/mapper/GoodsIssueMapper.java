package com.fptu.project_group2.warehouse.mapper;

import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.ordermanagement.entity.Order;
import java.util.List;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.warehouse.entity.GoodsIssue;
import com.fptu.project_group2.warehouse.entity.GoodsIssueItem;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueItemResponse;
import org.springframework.stereotype.Component;
import java.util.Comparator;
import java.util.UUID;

@Component
public class GoodsIssueMapper {
    public GoodsIssueResponse summary(GoodsIssue g) {
        return new GoodsIssueResponse(g.getId(), g.getCode(), g.getOrder().getId(),
                g.getOrder().getOrderCode(), g.getStatus(), userId(g.getAssignedTo()), g.getCreatedAt(), g.getVersion());
    }

    public GoodsIssueDetailResponse detail(GoodsIssue g) {
        Order order = g.getOrder();
        // Sắp xếp ổn định để frontend giữ đúng thứ tự dòng khi tải lại phiếu.
        List<GoodsIssueItemResponse> items = g.getItems().stream()
                .sorted(Comparator.comparing(GoodsIssueItem::getId))
                .map(this::item)
                .toList();
        return new GoodsIssueDetailResponse(
                g.getId(),
                g.getCode(),
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                g.getStatus(),
                g.getVersion(),
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getReceiverAddress(),
                userId(g.getAssignedTo()),
                g.getPickingStartedAt(),
                userId(g.getPackedBy()),
                g.getPackedAt(),
                g.getPackagingType(),
                userId(g.getExportedBy()),
                g.getExportedAt(),
                g.getCarrierName(),
                g.getTrackingNumber(),
                g.getNote(),
                userId(g.getCancelledBy()),
                g.getCancelledAt(),
                g.getCancellationReason(),
                g.getCreatedAt(),
                items
        );
    }

    private GoodsIssueItemResponse item(GoodsIssueItem item) {
        // Dùng snapshot trên đơn để tên, SKU và phân loại lịch sử không bị thay đổi theo catalog.
        OrderItem source = item.getOrderItem();
        return new GoodsIssueItemResponse(
                item.getId(),
                source.getId(),
                source.getVariant().getId(),
                source.getSkuSnapshot(),
                source.getProductNameSnapshot(),
                source.getColorSnapshot(),
                source.getSizeSnapshot(),
                source.getQuantity(),
                item.getPickedQuantity()
        );
    }

    private UUID userId(User user) {
        return user == null ? null : user.getId();
    }
}
