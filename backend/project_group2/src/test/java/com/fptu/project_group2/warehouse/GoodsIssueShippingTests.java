package com.fptu.project_group2.warehouse;

import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import jakarta.validation.Validation;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.ExportIssueRequest;
import com.fptu.project_group2.warehouse.entity.GoodsIssue;
import com.fptu.project_group2.warehouse.entity.GoodsIssueItem;
import com.fptu.project_group2.warehouse.mapper.GoodsIssueMapper;
import com.fptu.project_group2.warehouse.repository.GoodsIssueRepository;
import com.fptu.project_group2.warehouse.service.impl.GoodsIssueService;
import com.fptu.project_group2.warehouse.utils.WarehouseActorProvider;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class GoodsIssueShippingTests {
    private final OrderRepository orders = mock(OrderRepository.class);
    private final GoodsIssueRepository issues = mock(GoodsIssueRepository.class);
    private final InventoryRepository inventory = mock(InventoryRepository.class);
    private final WarehouseActorProvider actors = mock(WarehouseActorProvider.class);
    private final GoodsIssueMapper mapper = mock(GoodsIssueMapper.class);
    private final GoodsIssueService service = new GoodsIssueService(orders, issues, inventory, actors, mapper);

    private GoodsIssue packedIssue() {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setStatus(OrderStatus.PACKED);
        OrderItem line = new OrderItem();
        line.setId(UUID.randomUUID());
        line.setQuantity(2);
        ProductVariant variant = new ProductVariant();
        variant.setId(UUID.randomUUID());
        line.setVariant(variant);
        order.addOrderItem(line);
        GoodsIssue issue = new GoodsIssue();
        issue.setId(UUID.randomUUID());
        issue.setVersion(3L);
        issue.setOrder(order);
        issue.setStatus(GoodsIssueStatus.PACKED);
        GoodsIssueItem picked = new GoodsIssueItem();
        picked.setOrderItem(line);
        picked.setPickedQuantity(2);
        issue.addGoodsIssueItem(picked);
        when(issues.findOrderId(issue.getId())).thenReturn(Optional.of(order.getId()));
        when(orders.findByIdForUpdate(order.getId())).thenReturn(Optional.of(order));
        when(issues.findByIdForUpdate(issue.getId())).thenReturn(Optional.of(issue));
        return issue;
    }

    @Test
    void exportAggregatesRepeatedSkuAndRecordsAudit() {
        GoodsIssue issue = packedIssue();
        OrderItem extra = new OrderItem();
        extra.setId(UUID.randomUUID());
        extra.setVariant(issue.getOrder().getItems().get(0).getVariant());
        extra.setQuantity(3);
        issue.getOrder().addOrderItem(extra);
        GoodsIssueItem picked = new GoodsIssueItem();
        picked.setOrderItem(extra);
        picked.setPickedQuantity(3);
        issue.addGoodsIssueItem(picked);
        UUID variantId = extra.getVariant().getId();
        when(inventory.decreaseStockIfAvailable(variantId, 5L)).thenReturn(1);
        User actor = new User();
        when(actors.currentActor()).thenReturn(actor);

        service.export(issue.getId(), new ExportIssueRequest(3L, " GHN ", " TRACK-001 ", " Note "));

        verify(inventory, times(1)).decreaseStockIfAvailable(variantId, 5L);
        assertSame(actor, issue.getExportedBy());
        assertEquals("Note", issue.getNote());
        assertEquals("TRACK-001", issue.getTrackingNumber());
        assertEquals(GoodsIssueStatus.EXPORTED, issue.getStatus());
        assertEquals(OrderStatus.SHIPPING, issue.getOrder().getStatus());
        assertNotNull(issue.getExportedAt());
    }

    @Test
    void insufficientStockDoesNotMarkIssueExported() {
        GoodsIssue issue = packedIssue();
        assertThrows(BaseBusinessException.class, () -> service.export(issue.getId(),
                new ExportIssueRequest(3L, "GHN", "TRACK-001", null)));
        assertEquals(GoodsIssueStatus.PACKED, issue.getStatus());
        assertEquals(OrderStatus.PACKED, issue.getOrder().getStatus());
        verify(mapper, never()).detail(any());
    }

    @Test
    void trackingNumberIsRequired() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            for (String tracking : new String[]{null, "", "   "}) {
                assertTrue(validator.validate(new ExportIssueRequest(3L, "GHN", tracking, null))
                        .stream().anyMatch(v -> v.getPropertyPath().toString().equals("trackingNumber")));
            }
            assertTrue(validator.validate(new ExportIssueRequest(3L, "GHN", "TRACK-001", null)).isEmpty());
        }
    }
}
