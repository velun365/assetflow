package com.assetflow.asset.dto;

import com.assetflow.asset.AssetItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetItemCreateRequest {
    private String serialNumber;
    @NotBlank
    private String location;
    @NotBlank
    private Long assetId;

}
