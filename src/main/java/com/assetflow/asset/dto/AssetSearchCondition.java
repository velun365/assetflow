package com.assetflow.asset.dto;

import com.assetflow.asset.AssetType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssetSearchCondition {
    private String name;
    private AssetType assetType;
    private String categoryName;

}
