package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.*;

import java.util.UUID;

@Builder
@Getter
@Setter
@Entity
@Table(name = "inventory")
@AllArgsConstructor
@NoArgsConstructor
public class Inventory extends BaseEntity {

    @Column(nullable = false)
    private Long quantity;

    @Column(nullable = false)
    private UUID variantId;
}
