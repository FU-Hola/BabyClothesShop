package com.fptu.project_group2.catalogstock.service;

import com.fptu.project_group2.catalogstock.dto.response.CategoryResponse;

import java.util.List;

public interface ICategory {
    List<CategoryResponse> getAllActiveCategories();
}
