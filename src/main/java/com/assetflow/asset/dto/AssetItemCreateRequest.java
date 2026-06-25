package com.assetflow.asset.dto;

import com.assetflow.asset.AssetItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetItemCreateRequest {
    @NotBlank
    private String serialNumber;
    @NotBlank
    private String location;
    @NotNull
    private Long assetId;

}
