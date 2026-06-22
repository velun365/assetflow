package com.assetflow.loan.dto;

import com.assetflow.loan.LoanStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Getter
@RequiredArgsConstructor
public class LoanListRequest {
    private Long memberId;
    private Long assetItemId;
}
