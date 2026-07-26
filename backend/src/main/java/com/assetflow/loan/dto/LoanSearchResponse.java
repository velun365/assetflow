package com.assetflow.loan.dto;

import com.assetflow.loan.LoanStatus;
import com.assetflow.member.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class LoanSearchResponse {
    private Long loanId;
    private LoanStatus loanStatus;
    private String memberName;
    private Long assetItemId;
    private String assetName;

    private LocalDate loanDate; //빌린날짜
    private LocalDate dueDate; //반납예정일
    private LocalDate returnDate; //실제반납일

}
