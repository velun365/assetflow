package com.assetflow.asset.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.Category;
import com.assetflow.asset.dto.AssetCreateRequest;
import com.assetflow.asset.dto.AssetCreateResponse;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.asset.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public AssetCreateResponse createAsset(AssetCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalStateException("존재하지않는 카테고리 입니다."));
        Asset asset = new Asset(
                request.getName(),
                request.getExplanation(),
                request.getAssetType()
        );
        asset.changeCategory(category);
        assetRepository.save(asset);
        AssetCreateResponse response = new AssetCreateResponse(
                asset.getId(),
                asset.getName(),
                asset.getExplanation(),
                asset.getAssetType(),
                category.getId()
        );
        return response;
    }

    @Transactional
    public void assetDelete(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("존재 하지않는 자산입니다."));

        assetRepository.delete(asset);
    }
}
