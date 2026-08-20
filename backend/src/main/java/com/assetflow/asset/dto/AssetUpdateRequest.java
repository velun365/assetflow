package com.assetflow.asset.dto;

import com.assetflow.asset.Category;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AssetUpdateRequest {
    private String name;
    private String explanation;
    private Long categoryId;
}
