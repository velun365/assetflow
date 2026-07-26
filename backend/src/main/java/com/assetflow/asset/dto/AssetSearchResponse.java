package com.assetflow.asset.dto;

import com.assetflow.asset.AssetType;
import com.assetflow.asset.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetSearchResponse {
    private Long assetId;
    private String name;
    private AssetType assetType;
    private String categoryName;


}
