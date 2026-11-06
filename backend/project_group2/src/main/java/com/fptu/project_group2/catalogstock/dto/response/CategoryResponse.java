package com.fptu.project_group2.catalogstock.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String name;
    private String slug;
}
