package com.assetflow.asset.repository;

import com.assetflow.asset.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {
}
