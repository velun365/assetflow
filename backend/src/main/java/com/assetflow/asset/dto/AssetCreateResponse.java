package com.assetflow.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetCreateResponse {
    private Long assetId;
    private String name;
    private String explanation;
    private Long categoryId;
}
