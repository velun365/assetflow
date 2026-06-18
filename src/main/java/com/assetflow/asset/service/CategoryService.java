package com.assetflow.asset.service;

import com.assetflow.asset.Category;
import com.assetflow.asset.dto.CategoryCreateRequest;
import com.assetflow.asset.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public void categoryCreate(CategoryCreateRequest request) {
        String name = request.getName();
        Category category = new Category(name);
        categoryRepository.save(category);

    }
}
