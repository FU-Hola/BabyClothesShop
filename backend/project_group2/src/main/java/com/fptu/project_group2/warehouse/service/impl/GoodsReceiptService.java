package com.fptu.project_group2.warehouse.service.impl;

import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import com.fptu.project_group2.warehouse.dto.request.ConfirmReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.entity.GoodsReceipt;
import com.fptu.project_group2.warehouse.entity.GoodsReceiptItem;
import com.fptu.project_group2.warehouse.repository.GoodsReceiptRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import com.fptu.project_group2.warehouse.service.IGoodsReceipt;
import lombok.RequiredArgsConstructor;
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

    @Transactional
    @Override
    public void createGoodsReceipt(CreateReceiptRequest request, UUID userId) {

        //TODO: check người dùng có tồn tại hay ko

        if(request.expectedDate().isBefore(LocalDate.now())){
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Ngày nhập không được trong quá khứ");
        }

        List<CreateReceiptRequest.Line> sortedLine = request.items().stream().sorted(
                Comparator.comparing(CreateReceiptRequest.Line::variantId)
        ).toList();

        Set<UUID> uniqVariant = new HashSet<>();
        for(CreateReceiptRequest.Line line : sortedLine){
            if(!uniqVariant.add(line.variantId())){
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Sản phẩm đã được thêm vào phiếu");
            }
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
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Phiếu nhập đang ở trạng thái không thể xác nhận");
        }

        if(!request.version().equals(goodsReceipt.getVersion())){
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Dữ liệu đã bị thay đổi");
        }

        Map<UUID, GoodsReceiptItem> map = goodsReceipt.getItems().stream()
                .collect(Collectors.toMap(GoodsReceiptItem::getId, Function.identity()));

        for(ConfirmReceiptRequest.Line line : request.items()){
            GoodsReceiptItem item = map.get(line.receiptItemId());
            if(item == null){
                throw new BaseBusinessException(ErrorCode.BAD_REQUEST, "Mã phiếu nhập không hợp lệ");
            }


            if(line.receivedQuantity() > 0){
                item.setReceivedQuantity(line.receivedQuantity());
                inventoryRepository.increaseStock(item.getVariantId(), item.getReceivedQuantity());
            }
        }

        goodsReceipt.setGoodsReceiptStatus(GoodsReceiptStatus.fromString(request.goodsReceiptStatus()));
        goodsReceipt.setDiscrepancyNote(request.discrepancyNote());
        goodsReceipt.setCreatedBy(userId);
        goodsReceipt.setConfirmAt(Instant.now());
    }


    private String generateReceiptCode(){
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int randomSuffix = ThreadLocalRandom.current().nextInt(10000, 99999);
        return String.format("GR-%s-%d", datePart, randomSuffix);
    }
}
