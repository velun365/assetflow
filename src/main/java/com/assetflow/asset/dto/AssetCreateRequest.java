package com.assetflow.asset.dto;

import com.assetflow.asset.AssetType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AssetCreateRequest {
    private String name;
    private String explanation;
    private AssetType assetType;
    private Long categoryId;
}
