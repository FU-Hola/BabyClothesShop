package com.fptu.project_group2.catalogstock.service.impl;

import com.fptu.project_group2.catalogstock.dto.response.CategoryResponse;
import com.fptu.project_group2.catalogstock.repository.CategoryRepository;
import com.fptu.project_group2.catalogstock.service.ICategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService implements ICategory {
    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllByActiveTrueOrderByNameAsc()
                .stream()
                .map(category -> new CategoryResponse(category.getId(), category.getName(), category.getSlug()))
                .toList();
    }
}
