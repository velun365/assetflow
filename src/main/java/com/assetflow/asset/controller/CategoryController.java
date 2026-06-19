package com.assetflow.asset.controller;

import com.assetflow.asset.dto.CategoryCreateRequest;
import com.assetflow.asset.dto.CategoryCreateResponse;
import com.assetflow.asset.repository.CategoryRepository;
import com.assetflow.asset.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.hibernate.sql.Delete;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping("/api/categories")
    public CategoryCreateResponse createCategory(@RequestBody CategoryCreateRequest request) {
        return categoryService.categoryCreate(request);
    }

    @DeleteMapping("/api/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("categoryId") Long categoryId) {
        categoryService.categoryDelete(categoryId);
        return ResponseEntity.noContent().build();
    }
}
