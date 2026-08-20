package com.assetflow.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AssetDetailResponse {
    private Long assetId;
    private String name;
    private String explanation;
    private String categoryName;
    private String imagePath;
    private int totalCount;
    private long availableCount;
    private List<AssetItemDetailResponse> assetItems;
}
