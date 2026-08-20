package com.assetflow.asset.dto;

import com.assetflow.asset.AssetItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AssetItemUpdateRequest {

    @NotBlank(message = "시리얼 번호를 입력해주세요.")
    private String serialNumber;

    @NotBlank(message = "위치를 입력해주세요.")
    private String location;

    @NotNull(message = "자산을 선택해주세요.")
    private Long assetId;

}