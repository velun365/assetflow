package com.assetflow.loan.dto;

import com.assetflow.loan.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoanReturnRequestResponse {
    private Long loanId;
    private LoanStatus loanStatus;
}