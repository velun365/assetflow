package com.assetflow.asset.dto;

import com.assetflow.asset.AssetItemStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetItemResponse {
    private Long assetItemId;
    private String serialNumber;
    private String location;
    private AssetItemStatus assetItemStatus;
    private Long assetId;
    private String assetName;
    private boolean hasReadyReservation;
    private boolean readyByMe;
    private boolean borrowedByMe;
    private boolean reservedByMe;
}
