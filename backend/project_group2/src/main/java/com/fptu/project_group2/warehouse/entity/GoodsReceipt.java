package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Builder
@Getter
@Setter
@Entity
@Table(name = "goods_receipt")
@AllArgsConstructor
@NoArgsConstructor
public class GoodsReceipt extends BaseEntity {

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, length = 255)
    private String supplierName;

    private LocalDate expectedDate;

    @Column(length = 1000)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoodsReceiptStatus goodsReceiptStatus;

    @Column(nullable = false)
    private UUID createdBy;

    private Instant confirmAt;

    @Column(length = 1000)
    private String discrepancyNote;

    @Version
    private Long version;

    @Builder.Default
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "goodsReceipt", cascade = CascadeType.PERSIST)
    private Set<GoodsReceiptItem> items = new HashSet<>();


    public void addItem(GoodsReceiptItem item){
        items.add(item);
        item.setGoodsReceipt(this);
    }
}
