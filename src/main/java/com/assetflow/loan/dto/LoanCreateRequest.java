package com.assetflow.loan.dto;

import com.assetflow.asset.AssetItem;
import com.assetflow.loan.LoanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class LoanCreateRequest {
    @NotBlank
    private Long memberId;
    @NotBlank
    private Long assetItemId;

}
