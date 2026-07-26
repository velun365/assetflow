package com.assetflow.asset.dto;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItemStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetItemCreateResponse {
    private Long assetItemId;
    private String serialNumber;
    private String location;
    private Long assetId;
    private AssetItemStatus assetItemStatus;
}
