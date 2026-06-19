package com.assetflow.asset.service;

import com.assetflow.asset.dto.AssetItemCreateRequest;
import com.assetflow.asset.dto.AssetItemCreateResponse;
import com.assetflow.asset.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetItemService {
    private final AssetRepository assetRepository;

    public AssetItemCreateResponse AssetItemCreate(AssetItemCreateRequest request) {
        assetRepository.findById(request.getAssetId())
    }

}
