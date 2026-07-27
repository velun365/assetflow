package com.assetflow.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AssetCreateRequest {
    @NotBlank
    private String name;
    private String explanation;
    @NotNull
    private Long categoryId;
}
