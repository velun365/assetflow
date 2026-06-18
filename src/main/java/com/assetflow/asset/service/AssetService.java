package com.assetflow.asset.service;

import com.assetflow.asset.Category;
import com.assetflow.asset.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final Category category;
    @Transactional
    public void createAsset() {

    }
}
