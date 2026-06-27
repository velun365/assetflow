package com.assetflow.loan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@AllArgsConstructor
public class LoanCreateRequest {
    @NotNull
    private Long memberId;
    @NotNull
    private Long assetItemId;

}
