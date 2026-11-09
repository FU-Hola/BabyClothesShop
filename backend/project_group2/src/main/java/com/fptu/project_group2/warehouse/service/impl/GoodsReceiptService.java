package com.fptu.project_group2.warehouse.service.impl;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import org.springframework.data.domain.Sort;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ReceiptSearchRequest;
import com.fptu.project_group2.warehouse.utils.WarehouseSearch;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptItemResponse;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CancelReceiptRequest;
import com.fptu.project_group2.catalogstock.repository.ProductVariantRepository;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ConfirmReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptResponse;
import com.fptu.project_group2.warehouse.entity.GoodsReceipt;
import com.fptu.project_group2.warehouse.entity.GoodsReceiptItem;
import com.fptu.project_group2.warehouse.repository.GoodsReceiptItemRepository;
import com.fptu.project_group2.warehouse.repository.GoodsReceiptRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import com.fptu.project_group2.warehouse.service.IGoodsReceipt;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService implements IGoodsReceipt {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final InventoryRepository inventoryRepository;
    private final GoodsReceiptItemRepository goodsReceiptItemRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    @Override
    public void createGoodsReceipt(CreateReceiptRequest request, UUID userId) {

        if(request.expectedDate().isBefore(LocalDate.now())){
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Ngày nhập không được trong quá khứ");
        }

        List<CreateReceiptRequest.Line> sortedLine = request.items().stream().sorted(
                Comparator.comparing(CreateReceiptRequest.Line::variantId)
        ).toList();

        // Kiểm tra trùng trước, sau đó kiểm tra toàn bộ SKU
        Set<UUID> uniqVariant = new HashSet<>();
        for (CreateReceiptRequest.Line line : sortedLine) {
            if (!uniqVariant.add(line.variantId())) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                        "Biến thể đã được thêm vào phiếu");
            }
        }


        Set<UUID> receivableIds = new HashSet<>(
                productVariantRepository.findReceivableIds(uniqVariant, ProductStatus.ACTIVE)
        );


        if (!receivableIds.equals(uniqVariant)) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                    "Mặt hàng phải có trong kho, sản phẩm và biến thể phải đang hoạt động");
        }

        GoodsReceipt goodsReceipt = GoodsReceipt.builder()
                .code(generateReceiptCode())
                .supplierName(request.supplierName().trim())
                .expectedDate(request.expectedDate())
                .note(request.note())
                .createdBy(userId)
                .goodsReceiptStatus(GoodsReceiptStatus.PENDING)
                .build();

        for(CreateReceiptRequest.Line line : sortedLine){
            GoodsReceiptItem goodsReceiptItem = GoodsReceiptItem.builder()
                    .expectedQuantity(line.expectedQuantity())
                    .variantId(line.variantId())
                    .build();


            goodsReceipt.addItem(goodsReceiptItem);
        }

        goodsReceiptRepository.save(goodsReceipt);
    }

    @Transactional
    @Override
    public void confirmReceipt(ConfirmReceiptRequest request, UUID userId, UUID goodsReceiptId) {

        GoodsReceipt goodsReceipt = goodsReceiptRepository.findById(goodsReceiptId).orElseThrow(
                () -> new NotFoundException("GoodsReceipt", "goodsReceiptId", goodsReceiptId)
        );

        if(!GoodsReceiptStatus.PENDING.equals(goodsReceipt.getGoodsReceiptStatus())){
            throw new BaseBusinessException(ErrorCode.CONFLICT, "Phiếu nhập đang ở trạng thái không thể xác nhận");
        }

        if(!request.version().equals(goodsReceipt.getVersion())){
            throw new BaseBusinessException(ErrorCode.CONFLICT, "Dữ liệu đã bị thay đổi");
        }

        GoodsReceiptStatus target;
        try {
            target = GoodsReceiptStatus.fromString(request.goodsReceiptStatus());
        } catch (IllegalArgumentException ex) {
            throw new BaseBusinessException(ErrorCode.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
        if (target != GoodsReceiptStatus.COMPLETED) {
            throw new BaseBusinessException(ErrorCode.BAD_REQUEST, "Xác nhận phải là COMPLETED; dùng API cancel để hủy");
        }
        Map<UUID, GoodsReceiptItem> map = goodsReceipt.getItems().stream()
                .collect(Collectors.toMap(GoodsReceiptItem::getId, Function.identity()));
        Set<UUID> ids = new HashSet<>();

        boolean discrepancy = false;

        for (ConfirmReceiptRequest.Line line : request.items()) {
            GoodsReceiptItem item = map.get(line.receiptItemId());
            if(line.receivedQuantity() > item.getExpectedQuantity()){
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Số lượng nhập không được lớn hơn số lượng mua");
            }

            if (item == null || !ids.add(line.receiptItemId())) {
                throw new BaseBusinessException(ErrorCode.BAD_REQUEST, "Dòng phiếu không hợp lệ hoặc bị trùng");
            }

            discrepancy = discrepancy || !Objects.equals(
                    item.getExpectedQuantity(),
                    line.receivedQuantity()
            );

        }
        if (!ids.equals(map.keySet())) {
            throw new BaseBusinessException(ErrorCode.BAD_REQUEST, "Phải kiểm nhận đủ các dòng của phiếu");
        }
        if (discrepancy && (request.discrepancyNote() == null || request.discrepancyNote().isBlank())) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Cần ghi chú khi số lượng thực nhận chênh lệch");
        }

        List<ConfirmReceiptRequest.Line> lines = request.items().stream()
                .sorted(Comparator.comparing(line -> map.get(line.receiptItemId()).getVariantId())).toList();

        for (ConfirmReceiptRequest.Line line : lines) {
            GoodsReceiptItem item = map.get(line.receiptItemId());

            item.setReceivedQuantity(line.receivedQuantity());
            if (line.receivedQuantity() > 0 && inventoryRepository.increaseStock(
                    item.getVariantId(), line.receivedQuantity()) != 1) {
                throw new BaseBusinessException(ErrorCode.CONFLICT, "Không tìm thấy tồn kho cho biến thể " + item.getVariantId());
            }
        }

        goodsReceipt.setGoodsReceiptStatus(GoodsReceiptStatus.COMPLETED);
        goodsReceipt.setDiscrepancyNote(request.discrepancyNote());
        goodsReceipt.setConfirmAt(Instant.now());
    }

    @Transactional
    @Override
    public void cancelReceipt(CancelReceiptRequest request,
                              UUID userId, UUID id) {
        GoodsReceipt receipt = goodsReceiptRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("GoodsReceipt", "id", id));
        if (receipt.getGoodsReceiptStatus() != GoodsReceiptStatus.PENDING
                || !Objects.equals(request.version(), receipt.getVersion())) {
            throw new BaseBusinessException(ErrorCode.CONFLICT, "Phiếu đã được xử lý hoặc version đã thay đổi");
        }
        // Hủy phiếu không cộng tồn và không ghi đè ghi chú lúc lập phiếu.
        receipt.setGoodsReceiptStatus(GoodsReceiptStatus.CANCELLED);
        receipt.setDiscrepancyNote(request.note());
        receipt.setConfirmAt(Instant.now());
    }

    @Transactional(readOnly = true)
    @Override
    public GoodsReceiptDetailResponse getReceipt(UUID id) {
        GoodsReceipt g = goodsReceiptRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("GoodsReceipt", "id", id));
        List<GoodsReceiptItemResponse> items = goodsReceiptItemRepository.getAllItem(id, Pageable.unpaged(
                Sort.by("id"))).getContent();
        return new GoodsReceiptDetailResponse(
                g.getId(), g.getCode(), g.getSupplierName(), g.getExpectedDate(), g.getNote(),
                g.getGoodsReceiptStatus(), g.getCreatedBy(), g.getCreatedAt(), g.getConfirmAt(),
                g.getDiscrepancyNote(), g.getVersion(), items);
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<GoodsReceiptResponse> getAllGoodsReceipt(
            ReceiptSearchRequest request, Pageable pageable
    ) {
        // Lọc tại DB để danh sách PENDING và tổng số trang không phụ thuộc trang FE đang mở.
        Page<GoodsReceiptResponse> goodsReceiptResponse =
                goodsReceiptRepository.getAllGoodsReceipt(
                        request.status(), WarehouseSearch.pattern(request.keyword()), pageable);

        return PageResponse.oneBased(goodsReceiptResponse);
    }


    private String generateReceiptCode(){
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int randomSuffix = ThreadLocalRandom.current().nextInt(10000, 99999);
        return String.format("GR-%s-%d", datePart, randomSuffix);
    }
}
