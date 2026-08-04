package com.assetflow.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetSearchResponse {
    private Long assetId;
    private String name;
    private String categoryName;
    private Long totalCount;
    private Long availableCount;


}
