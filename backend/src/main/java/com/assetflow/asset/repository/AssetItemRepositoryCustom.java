package com.assetflow.asset.repository;

import com.assetflow.asset.dto.AssetItemAdminResponse;
import com.assetflow.asset.dto.AssetItemSearchCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetItemRepositoryCustom {
    Page<AssetItemAdminResponse> searchAssetItems(
            AssetItemSearchCondition condition,
            Pageable pageable
    );
}
