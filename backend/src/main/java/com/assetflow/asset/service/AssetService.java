package com.assetflow.asset.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.Category;
import com.assetflow.asset.dto.*;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.asset.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
                category

        );
        assetRepository.save(asset);
        return new AssetCreateResponse(
                asset.getId(),
                asset.getName(),
                asset.getExplanation(),
                category.getId()
        );
    }

    public AssetDetailResponse getAssetDetail(Long assetId) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() ->
                new IllegalStateException("존재하지 않는 자산입니다."));
        List<AssetItemDetailResponse> assetItems =
                asset.getAssetItems().stream().map(assetItem ->
                        new AssetItemDetailResponse(
                                assetItem.getId(),
                                assetItem.getSerialNumber(),
                                assetItem.getLocation(),
                                assetItem.getAssetItemStatus()
                        )).toList();

        int totalCount = assetItems.size();
        long availableCount = assetItems.stream().filter(assetItem -> assetItem.getAssetItemStatus() == AssetItemStatus.AVAILABLE).count();

        return new AssetDetailResponse(
                asset.getId(),
                asset.getName(),
                asset.getExplanation(),
                asset.getCategory().getName(),
                totalCount,
                availableCount,
                assetItems
        );
    }

    @Transactional
    public void assetDelete(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("존재 하지않는 자산입니다."));

        assetRepository.delete(asset);
    }

    public Page<AssetSearchResponse> searchAssets(AssetSearchCondition condition, Pageable pageable) {
        return assetRepository.searchAssets(condition, pageable);
    }
}
