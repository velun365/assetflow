package com.assetflow.asset.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.dto.AssetItemCreateRequest;
import com.assetflow.asset.dto.AssetItemCreateResponse;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.asset.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AssetItemService {
    private final AssetItemRepository assetItemRepository;
    private final AssetRepository assetRepository;

    @Transactional
    public AssetItemCreateResponse createAssetItem(AssetItemCreateRequest request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new IllegalStateException("해당 자산은 자산목록에 없습니다."));
        AssetItem assetItem = new AssetItem(
                request.getSerialNumber(),
                request.getLocation(),
                asset
        );
        assetItemRepository.save(assetItem);
        AssetItemCreateResponse response = new AssetItemCreateResponse(
                assetItem.getId(),
                assetItem.getSerialNumber(),
                assetItem.getLocation(),
                request.getAssetId(),
                assetItem.getAssetItemStatus()
        );

        return response;
    }
}
