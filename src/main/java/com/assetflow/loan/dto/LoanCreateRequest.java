package com.assetflow.loan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class LoanCreateRequest {
    @NotNull
    private Long memberId;
    @NotNull
    private Long assetItemId;

}
