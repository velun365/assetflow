package com.assetflow.asset.dto;

import com.assetflow.asset.AssetItemStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetItemCreateRequest {
    private Long assetId;
    private String serialNumber;
    private String location;

}
