package com.assetflow.loan.dto;

import com.assetflow.loan.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class MyLoanListResponse {

    private Long loanId;
    private LoanStatus loanStatus;

    private Long assetItemId;
    private String assetName;
    private String serialNumber;

    private LocalDate loanDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
}