package com.assetflow.asset.dto;

import com.assetflow.asset.AssetType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetCreateResponse {
    private Long assetId;
    private String name;
    private String explanation;
    private AssetType assetType;
    private Long categoryId;
}
