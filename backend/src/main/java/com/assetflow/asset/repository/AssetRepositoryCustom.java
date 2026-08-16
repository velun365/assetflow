package com.assetflow.asset.repository;

import com.assetflow.asset.dto.AssetSearchCondition;
import com.assetflow.asset.dto.AssetSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetRepositoryCustom {
    Page<AssetSearchResponse> searchAssets(AssetSearchCondition assetSearchCondition, Pageable pageable);
}
