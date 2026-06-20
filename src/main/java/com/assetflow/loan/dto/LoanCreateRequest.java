package com.assetflow.loan.dto;

import com.assetflow.asset.AssetItem;
import com.assetflow.loan.LoanStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class LoanCreateRequest {
    private Long memberId;
    private Long assetItemId;

}
