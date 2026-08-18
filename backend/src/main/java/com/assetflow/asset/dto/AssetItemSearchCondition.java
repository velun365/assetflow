package com.assetflow.asset.dto;

import com.assetflow.asset.AssetItemStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssetItemSearchCondition {
    private String serialNumber;
    private String assetName;
    private AssetItemStatus assetItemStatus;
}
