package com.assetflow.loan.dto;

import com.assetflow.loan.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class LoanReturnResponse {
    private Long lonaId;
    private LoanStatus loanStatus;
    private Long memberId;
    private Long assetItemId;
    private LocalDate returnDate;
}
