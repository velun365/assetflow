package com.assetflow.loan.controller;

import com.assetflow.loan.Loan;
import com.assetflow.loan.dto.*;
import com.assetflow.loan.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;


    @PostMapping
    public LoanCreateResponse loanCreate(@RequestBody LoanCreateRequest request) {
        return loanService.createLoan(request);
    }

    @PostMapping("/{loanId}/return")
    public LoanReturnResponse loanReturn(@PathVariable("loanId") Long loanId) {
        return loanService.returnLoan(loanId);
    }

    //전체조회
    @GetMapping
    public List<LoanListResponse> loanAll() {
        return loanService.listAll();
    }

    @GetMapping("/members/{memberId}")
    public List<MyLoanListResponse> loanListByMember(@PathVariable Long memberId) {
       return loanService.findLoansByMember(memberId);
    }

}
