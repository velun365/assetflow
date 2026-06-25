package com.assetflow.loan.controller;

import com.assetflow.loan.dto.*;
import com.assetflow.loan.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;

    @PostMapping
    public LoanCreateResponse createLoan(@Valid @RequestBody LoanCreateRequest request) {
        return loanService.createLoan(request);
    }

    @PostMapping("/{loanId}/return")
    public LoanReturnResponse returnLoan(@PathVariable("loanId") Long loanId) {
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
