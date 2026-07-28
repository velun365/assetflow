package com.assetflow.asset.repository;

import com.assetflow.asset.AssetItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetItemRepository extends JpaRepository<AssetItem, Long> {
    List<AssetItem> findByAssetId(Long assetId);
}
