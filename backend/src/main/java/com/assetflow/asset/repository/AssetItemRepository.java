package com.assetflow.asset.repository;

import com.assetflow.asset.AssetItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetItemRepository extends JpaRepository<AssetItem, Long> {
}
