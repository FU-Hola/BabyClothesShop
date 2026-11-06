package com.fptu.project_group2.catalogstock.repository;

import com.fptu.project_group2.catalogstock.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByActiveTrueOrderByNameAsc();
}
