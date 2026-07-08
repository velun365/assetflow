package com.assetflow.loan.dto;

import com.assetflow.loan.LoanStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LoanSearchCondition {
    private LoanStatus loanStatus;
    private String memberName;
    private Long assetItemId;

    private LocalDate loanDateFrom;
    private LocalDate loanDateTo;
}
