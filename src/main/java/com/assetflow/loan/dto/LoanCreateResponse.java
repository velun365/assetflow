package com.assetflow.loan.dto;

import com.assetflow.asset.AssetItem;
import com.assetflow.loan.LoanStatus;
import com.assetflow.member.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class LoanCreateResponse {
    private Long lonaId;
    private LoanStatus loanStatus;
    private Long memberId;
    private Long assetItemId;
    private LocalDate loanDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
}
