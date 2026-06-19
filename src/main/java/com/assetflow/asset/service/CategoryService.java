package com.assetflow.asset.service;

import com.assetflow.asset.Category;
import com.assetflow.asset.dto.CategoryCreateRequest;
import com.assetflow.asset.dto.CategoryCreateResponse;
import com.assetflow.asset.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryCreateResponse categoryCreate(CategoryCreateRequest request) {
        String name = request.getName();
        validateDuplicateName(name);
        Category category = new Category(name);
        categoryRepository.save(category);
        CategoryCreateResponse response =
                new CategoryCreateResponse(
                category.getId(), category.getName()
        );
        return response;
    }

    private void validateDuplicateName(String name) {
        Optional<Category> findName = categoryRepository.findByName(name);
        if (findName.isPresent()) {
            throw new IllegalStateException(name +"은 이미 등록된 카테고리명입니다.");
        }
    }

    @Transactional
    public void categoryDelete(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리 입니다."));
        if (!category.getAssets().isEmpty()) {
            throw new IllegalStateException("등록된 자산이 있는 카테고리는 삭제할 수 없습니다.");
        }

        categoryRepository.delete(category);

    }
}
