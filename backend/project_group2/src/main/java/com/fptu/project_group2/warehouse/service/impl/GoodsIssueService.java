package com.fptu.project_group2.warehouse.service.impl;

import com.fptu.project_group2.ordermanagement.common.PaymentStatus;
import com.fptu.project_group2.warehouse.service.IInventoryReservation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.util.Optional;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.IssueSearchRequest;
import com.fptu.project_group2.warehouse.utils.WarehouseSearch;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CreateGoodsIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.IssueVersionRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.UpdatePickingRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.PackIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.ExportIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CancelIssueRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueResponse;
import com.fptu.project_group2.warehouse.entity.GoodsIssue;
import com.fptu.project_group2.warehouse.entity.GoodsIssueItem;
import com.fptu.project_group2.warehouse.mapper.GoodsIssueMapper;
import com.fptu.project_group2.warehouse.repository.GoodsIssueRepository;
import com.fptu.project_group2.warehouse.service.IGoodsIssue;
import com.fptu.project_group2.common.security.CurrentActorProvider;
import com.fptu.project_group2.warehouse.utils.TrackingNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true, rollbackFor = Exception.class)
public class GoodsIssueService implements IGoodsIssue {

    private final OrderRepository orders;
    private final GoodsIssueRepository issues;
    private final IInventoryReservation reservations;
    private final CurrentActorProvider actors;
    private final GoodsIssueMapper mapper;
    private final TrackingNumberGenerator trackingNumbers;

    @Override
    @Transactional
    public GoodsIssueDetailResponse createGoodsIssue(CreateGoodsIssueRequest request) {

        Order order = lockOrder(request.orderId());

        requireOrderOpen(order);
        reservations.requireCommitted(order);

        // check exist và chưa bị cancel
        Optional<GoodsIssue> existing = issues.findFirstByOrderIdAndStatusNot(
                order.getId(),
                GoodsIssueStatus.CANCELLED
        );

        if (existing.isPresent()) {
            return mapper.detail(existing.get());
        }

        // kiểm tra phiếu đã hủy
        if (issues.existsByOrderId(order.getId())) {
            throw conflict("Đơn đã có phiếu hủy");
        }

        return createForOrder(order);
    }

    @Override
    public GoodsIssueDetailResponse getDetail(UUID id) {
        GoodsIssue issue = issues.findDetailById(id)
                .orElseThrow(() -> notFound(id));

        return mapper.detail(issue);
    }

    @Override
    public PageResponse<GoodsIssueResponse> search(
            IssueSearchRequest request,
            Pageable pageable
    ) {
        Page<GoodsIssueResponse> issuePage = issues.search(
                request.status(), request.orderId(), WarehouseSearch.pattern(request.keyword()), pageable
        ).map(mapper::summary);
        return PageResponse.oneBased(issuePage);
    }

    @Override
    @Transactional
    public GoodsIssueDetailResponse startPicking(
            UUID id,
            IssueVersionRequest request
    ) {
        GoodsIssue issue = lockIssue(id, request.version());

        requireStatus(issue, GoodsIssueStatus.PENDING);

        requireOrderOpen(issue.getOrder());

        issue.setAssignedTo(actors.currentActor());
        issue.setPickingStartedAt(Instant.now());
        issue.setStatus(GoodsIssueStatus.PICKING);

        return flushAndMap(issue);
    }

    @Override
    @Transactional
    public GoodsIssueDetailResponse updatePicking(
            UUID id,
            UpdatePickingRequest request
    ) {
        GoodsIssue issue = lockIssue(id, request.version());

        requireStatus(issue, GoodsIssueStatus.PICKING);
        requireAssignee(issue);
        requireOrderOpen(issue.getOrder());
        validateSource(issue);

        Map<UUID, GoodsIssueItem> map = new HashMap<>();
        issue.getItems().forEach(item -> map.put(item.getId(), item));
        Set<UUID> set = new HashSet<>();

        for (UpdatePickingRequest.Line line : request.items()) {

            GoodsIssueItem item = map.get(line.issueItemId());

            if (item == null || !set.add(line.issueItemId())) {
                throw badRequest("Dòng nhặt hàng không hợp lệ hoặc bị trùng");
            }

            if (line.pickedQuantity() > item.getOrderItem().getQuantity()) {
                throw badRequest("Không được nhặt vượt số lượng đặt");
            }
        }

        if (!set.equals(map.keySet())) {
            throw badRequest("Phải gửi đủ các dòng của phiếu");
        }

        for (UpdatePickingRequest.Line line : request.items()) {
            GoodsIssueItem item = map.get(line.issueItemId());
            item.setPickedQuantity(line.pickedQuantity());
        }

        issue.setPickingUpdatedAt(Instant.now());

        return flushAndMap(issue);
    }

    @Override
    @Transactional
    public GoodsIssueDetailResponse pack(
            UUID id,
            PackIssueRequest request
    ) {
        GoodsIssue issue = lockIssue(id, request.version());
        requireStatus(issue, GoodsIssueStatus.PICKING);
        requireAssignee(issue);
        requireOrderOpen(issue.getOrder());
        requireFullyPicked(issue);

        issue.setPackagingType(request.packagingType());
        issue.setPackedBy(actors.currentActor());
        issue.setPackedAt(Instant.now());
        issue.setStatus(GoodsIssueStatus.PACKED);
        issue.getOrder().setStatus(OrderStatus.PACKED);
        return flushAndMap(issue);
    }

    @Override
    @Transactional
    public GoodsIssueDetailResponse export(
            UUID id,
            ExportIssueRequest request
    ) {
        GoodsIssue issue = lockIssue(id, request.version());
        requireStatus(issue, GoodsIssueStatus.PACKED);
        requireAssignee(issue);

        if (issue.getOrder().getStatus() != OrderStatus.PACKED) {
            throw conflict("Đơn hàng chưa sẵn sàng xuất kho");
        }

        requireFullyPicked(issue);

        reservations.consume(issue.getOrder());

        // Chỉ ghi nhận xuất và chuyển đơn sang SHIPPING sau khi trừ đủ tất cả dòng.
        issue.setCarrierName(request.carrierName().trim());
        issue.setTrackingNumber(trackingNumbers.next());
        issue.setNote(trimNullable(request.note()));
        issue.setExportedBy(actors.currentActor());
        issue.setExportedAt(Instant.now());
        issue.setStatus(GoodsIssueStatus.EXPORTED);
        issue.getOrder().setStatus(OrderStatus.SHIPPING);
        return flushAndMap(issue);
    }

    @Override
    @Transactional
    public GoodsIssueDetailResponse cancel(
            UUID id,
            CancelIssueRequest request
    ) {
        GoodsIssue issue = lockIssue(id, request.version());
        if (issue.getStatus() == GoodsIssueStatus.EXPORTED
                || issue.getStatus() == GoodsIssueStatus.CANCELLED) {
            throw conflict("Phiếu đã xuất hoặc đã hủy, không thể hủy tiếp");
        }
        requireOrderOpen(issue.getOrder());
        if(issue.getAssignedTo()!=null) requireAssignee(issue);
        String reason = request.reason() == null ? "" : request.reason().strip();
        if (reason.isBlank() || reason.length() > 1000) {
            throw badRequest("Lý do hủy phải có từ 1 đến 1000 ký tự");
        }
        if (!Boolean.TRUE.equals(request.stockRecovered())) {
            throw badRequest("Cần xác nhận đã kiểm tra và thu hồi hàng của phiếu trước khi hủy");
        }
        reservations.release(issue.getOrder());
        var actor = actors.currentActor();
        Instant cancelledAt = Instant.now();
        issue.setCancelledBy(actor);
        issue.setCancelledAt(cancelledAt);
        issue.setCancellationReason(reason);
        issue.setStatus(GoodsIssueStatus.CANCELLED);
        // Physical balance stays unchanged; release the allocation in this transaction.
        issue.getOrder().setStatus(OrderStatus.CANCELLED);
        issue.getOrder().setCancelledBy(actor);
        issue.getOrder().setCancelledAt(cancelledAt);
        issue.getOrder().setCancellationReason(reason);

        return flushAndMap(issue);
    }

    private GoodsIssueDetailResponse createForOrder(Order order) {
        if (order.getItems().isEmpty() || order.getItems().size() > 200) {
            throw conflict("Đơn phải có từ 1 đến 200 dòng");
        }
        GoodsIssue issue = new GoodsIssue();
        issue.setCode("GI-" + UUID.randomUUID());
        issue.setOrder(order);
        for (OrderItem o : order.getItems()) {
            if (o.getQuantity() == null || o.getQuantity() <= 0 || o.getVariant() == null) {
                throw conflict("Dòng đơn hàng không hợp lệ");
            }
            GoodsIssueItem item = new GoodsIssueItem();
            item.setOrderItem(o);
            issue.addGoodsIssueItem(item);
        }
        issues.save(issue);
        return mapper.detail(issue);
    }

    private Order lockOrder(UUID id) {
        return orders.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Order", "id", id));
    }

    private GoodsIssue lockIssue(UUID id, Long version) {
        UUID orderId = issues.findOrderId(id)
                .orElseThrow(() -> notFound(id));

        lockOrder(orderId);
        GoodsIssue issue = issues.findByIdForUpdate(id)
                .orElseThrow(() -> notFound(id));
        if (!version.equals(issue.getVersion())) {
            throw conflict("Version đã thay đổi; tải lại chi tiết phiếu");
        }
        return issue;
    }

    private void requireAssignee(GoodsIssue issue) {
        if(issue.getAssignedTo()==null || !issue.getAssignedTo().getId().equals(actors.currentActor().getId()))
            throw new BaseBusinessException(ErrorCode.ACCESS_DENIED,"Chỉ nhân viên nhận soạn phiếu được xử lý phiếu này");
    }

    private void requireOrderOpen(Order order) {
        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            throw conflict("Đơn hàng chưa thanh toán thành công");
        }
        // Chỉ xử lý phiếu khi đơn đã xác nhận hoặc đang đóng gói; đơn đã hủy là kết thúc.
        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PACKED) {
            throw conflict("Đơn phải ở trạng thái CONFIRMED hoặc PACKED để xử lý phiếu");
        }
    }

    private void requireStatus(GoodsIssue issue, GoodsIssueStatus expected) {
        if (issue.getStatus() != expected) {
            throw conflict("Phiếu phải ở trạng thái " + expected);
        }
    }

    private void validateSource(GoodsIssue issue) {

        // Đối chiếu phiếu với đơn nguồn để không xuất thiếu hoặc xuất nhầm dòng đơn.
        Set<UUID> expected = new HashSet<>();
        issue.getOrder().getItems().forEach(item -> expected.add(item.getId()));
        Set<UUID> actual = new HashSet<>();
        for (GoodsIssueItem item : issue.getItems()) {
            OrderItem source = item.getOrderItem();

            if (!Objects.equals(source.getOrder().getId(), issue.getOrder().getId())
                    || !actual.add(source.getId())
                    || source.getQuantity() == null
                    || source.getQuantity() <= 0) {
                throw conflict("Chi tiết phiếu không khớp đơn hàng");
            }

        }
        if (expected.isEmpty() || !actual.equals(expected)) {
            throw conflict("Phiếu không chứa đủ các dòng đơn hàng");
        }
    }

    private void requireFullyPicked(GoodsIssue issue) {
        validateSource(issue);
        boolean hasIncompleteItem = issue.getItems().stream()
                .anyMatch(item -> item.getPickedQuantity() != item.getOrderItem().getQuantity());

        if (hasIncompleteItem) {
            throw conflict("Phải nhặt đủ toàn bộ số lượng trước khi đóng gói hoặc xuất");
        }
    }

    private GoodsIssueDetailResponse flushAndMap(GoodsIssue issue) {
        issues.flush();
        return mapper.detail(issue);
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }

    private NotFoundException notFound(UUID id) {
        return new NotFoundException("GoodsIssue", "id", id);
    }

    private BaseBusinessException conflict(String message) {
        return new BaseBusinessException(ErrorCode.CONFLICT, message);
    }

    private BaseBusinessException badRequest(String message) {
        return new BaseBusinessException(ErrorCode.BAD_REQUEST, message);
    }
}
